import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Text } from '@design/text';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Skeleton } from '@components/Skeleton';
import { Button } from '@components/Button';
import { LockedOverlay } from '@components/LockedOverlay';
import { colors, layout, radius, spacing } from '@design/tokens';
import { useIsCompostelero } from '@hooks/useSubscription';
import { useAIRecommendation, type RecType, type RecommendationResponse } from '@hooks/useAIRecommendation';

type Chip = {
  type: RecType;
  emoji: string;
  label: string;
};

const CHIPS: Chip[] = [
  { type: 'daily_tip', emoji: '💡', label: 'Consejo de hoy' },
  { type: 'albergue_pick', emoji: '🛏️', label: 'Mejor albergue' },
  { type: 'hidden_gem', emoji: '📍', label: 'Joyas ocultas' },
  { type: 'route_planning', emoji: '🗺️', label: 'Planificar etapas' },
  { type: 'health_advice', emoji: '❤️', label: 'Consejo de salud' },
  { type: 'weather_advice', emoji: '🌦️', label: 'Preparación meteo' },
];

type ResultEntry = RecommendationResponse & { id: string };

export default function AIGuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isCompostelero = useIsCompostelero();
  const recMut = useAIRecommendation();
  const [results, setResults] = useState<ResultEntry[]>([]);

  const handleChip = async (chip: Chip) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const data = await recMut.mutateAsync({ type: chip.type });
      setResults((prev) => [{ ...data, id: `${Date.now()}` }, ...prev]);
    } catch {
      // mutation error is exposed via recMut.error
    }
  };

  if (!isCompostelero) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Tu Guía IA" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: spacing['5'], paddingTop: insets.top + layout.headerHeight + spacing['4'] }}>
          <View style={{ gap: spacing['4'] }}>
            <View>
              <Text variant="display" color={colors.cream}>
                Tu guía personal del Camino
              </Text>
              <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                Activa Compostelero para recomendaciones personalizadas basadas en tu ritmo,
                salud y ruta.
              </Text>
            </View>

            <View>
              <Card style={{ position: 'relative', minHeight: 220 }}>
                <Text variant="bodyBold" color={colors.cream}>
                  Consejo del peregrino veterano
                </Text>
                <Text variant="body" color={colors.stone300} style={{ marginTop: spacing['2'] }}>
                  Con 18 km por delante y un sol de justicia, sal antes de las 6:30. La
                  taberna de Hospital de Órbigo abre a las 9 — perfecto para la primera
                  pausa larga…
                </Text>
                <View style={{ marginTop: spacing['3'], gap: spacing['1'] }}>
                  <Text variant="caption" color={colors.amber400}>• Lleva 1,5L por persona</Text>
                  <Text variant="caption" color={colors.amber400}>• Sombrero ancho, no gorra</Text>
                </View>
                <LockedOverlay
                  requiredPlan="compostelero"
                  message="Tu guía IA personal"
                  onPress={() => router.push('/plans')}
                />
              </Card>
            </View>

            <Button
              label="Ver plan Compostelero"
              variant="primary"
              fullWidth
              style={{ backgroundColor: colors.gold }}
              onPress={() => router.push('/plans')}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title="Tu Guía IA" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: spacing['5'],
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['5'],
        }}
      >
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['rgba(47,93,62,0.12)', 'rgba(47,93,62,0.02)']}
            style={StyleSheet.absoluteFill}
          />
          <Text variant="display" color={colors.cream}>
            Pregunta a tu peregrino veterano
          </Text>
          <Text variant="small" color={colors.stone300} style={{ marginTop: spacing['2'] }}>
            Combina tu ruta, ritmo, salud y meteo para darte un consejo único.
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.gold }]}>
            <Text variant="caption" color={colors.stone950}>
              ⭐ Compostelero
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing['2'], paddingVertical: spacing['1'] }}
        >
          {CHIPS.map((chip) => (
            <Pressable
              key={chip.type}
              onPress={() => handleChip(chip)}
              disabled={recMut.isPending}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
            >
              <Text variant="bodyMedium" color={colors.cream}>
                {chip.emoji}  {chip.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {recMut.isPending ? (
          <Card style={{ gap: spacing['3'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
              <MotiView
                from={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ loop: true, type: 'timing', duration: 700 }}
              >
                <Ionicons name="sparkles" size={18} color={colors.gold} />
              </MotiView>
              <Text variant="bodyMedium" color={colors.stone300}>
                Consultando con el peregrino experto…
              </Text>
            </View>
            <Skeleton height={20} />
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="60%" />
          </Card>
        ) : null}

        {recMut.error ? (
          <Card>
            <Text variant="bodyBold" color={colors.error}>
              No se pudo obtener la recomendación
            </Text>
            <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
              {(recMut.error as Error).message ?? 'Error desconocido'}
            </Text>
          </Card>
        ) : null}

        {results.map((r, idx) => (
          <ResultCard key={r.id} entry={r} delay={idx * 60} />
        ))}

        {results.length === 0 && !recMut.isPending ? (
          <View style={{ alignItems: 'center', marginTop: spacing['10'], gap: spacing['2'] }}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.stone600} />
            <Text variant="small" color={colors.stone500} align="center">
              Toca un chip para empezar.{'\n'}Cada consejo combina tu contexto en tiempo real.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ResultCard({ entry, delay }: { entry: ResultEntry; delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 18, delay }}
    >
      <Card elevation="raised" style={{ gap: spacing['3'] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
          <View style={styles.resultIcon}>
            <Ionicons name="sparkles" size={14} color={colors.gold} />
          </View>
          <Text variant="caption" color={colors.amber400}>
            {labelForType(entry.type)}
          </Text>
        </View>
        <Text variant="h2" color={colors.cream} italic>
          {firstSentence(entry.recommendation)}
        </Text>
        <Text variant="body" color={colors.stone200}>
          {restAfterFirstSentence(entry.recommendation)}
        </Text>
        {entry.tips.length > 0 ? (
          <View style={{ gap: spacing['2'], marginTop: spacing['2'] }}>
            {entry.tips.map((tip, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing['2'] }}>
                <Ionicons name="checkmark-circle" size={16} color={colors.amber400} />
                <Text variant="small" color={colors.stone300} style={{ flex: 1 }}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.contextRow}>
          {entry.contextUsed.hasStage ? <Tag label="Etapa" /> : null}
          {entry.contextUsed.hasRoute ? <Tag label="Ruta" /> : null}
          {entry.contextUsed.hasHealth ? <Tag label="Salud" /> : null}
          {entry.contextUsed.hasWeather ? <Tag label="Meteo" /> : null}
          {entry.contextUsed.hasPace ? <Tag label="Ritmo" /> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing['4'], marginTop: spacing['2'] }}>
          <Pressable hitSlop={8}>
            <Ionicons name="bookmark-outline" size={18} color={colors.stone400} />
          </Pressable>
          <Pressable hitSlop={8}>
            <Ionicons name="share-outline" size={18} color={colors.stone400} />
          </Pressable>
        </View>
      </Card>
    </MotiView>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text variant="caption" color={colors.stone400}>
        {label}
      </Text>
    </View>
  );
}

function labelForType(t: RecType): string {
  return {
    daily_tip: 'Consejo del día',
    albergue_pick: 'Albergue recomendado',
    hidden_gem: 'Joya oculta',
    route_planning: 'Planificación',
    weather_advice: 'Meteorología',
    health_advice: 'Salud',
  }[t];
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?\n]+[.!?]/);
  return m ? m[0] : text.split('\n')[0] ?? text;
}

function restAfterFirstSentence(text: string): string {
  const first = firstSentence(text);
  return text.slice(first.length).trim();
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: colors.stone900,
    borderRadius: radius.lg,
    padding: spacing['5'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(47,93,62,0.3)',
  },
  badge: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    paddingHorizontal: spacing['3'],
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  chip: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderRadius: radius.full,
    backgroundColor: colors.stone900,
    borderWidth: 1,
    borderColor: colors.stone700,
  },
  resultIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(47,93,62,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  tag: {
    paddingHorizontal: spacing['2'],
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.stone800,
    borderWidth: 1,
    borderColor: colors.stone700,
  },
});
