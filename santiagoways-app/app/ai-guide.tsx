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
import { colors, gradients, layout, radius, spacing } from '@design/tokens';
import { useIsCompostelero } from '@hooks/useSubscription';
import { useAIRecommendation, type RecType, type RecommendationResponse } from '@hooks/useAIRecommendation';
import { t } from '@lib/i18n';

const CHIP_TYPES: RecType[] = [
  'daily_tip',
  'albergue_pick',
  'hidden_gem',
  'route_planning',
  'health_advice',
  'weather_advice',
];

type ResultEntry = RecommendationResponse & { id: string };

export default function AIGuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isCompostelero = useIsCompostelero();
  const recMut = useAIRecommendation();
  const [results, setResults] = useState<ResultEntry[]>([]);

  const handleChip = async (type: RecType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const data = await recMut.mutateAsync({ type });
      setResults((prev) => [{ ...data, id: `${Date.now()}` }, ...prev]);
    } catch {
      // mutation error is exposed via recMut.error
    }
  };

  if (!isCompostelero) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title={t('aiGuide.title')} onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: spacing['5'], paddingTop: insets.top + layout.headerHeight + spacing['4'] }}>
          <View style={{ gap: spacing['4'] }}>
            <View>
              <Text variant="display" color={colors.cream}>
                {t('aiGuide.lockedTitle')}
              </Text>
              <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                {t('aiGuide.lockedSubtitle')}
              </Text>
            </View>

            <View>
              <Card style={{ position: 'relative', minHeight: 220 }}>
                <Text variant="bodyBold" color={colors.cream}>
                  {t('aiGuide.veteranTipTitle')}
                </Text>
                <Text variant="body" color={colors.stone300} style={{ marginTop: spacing['2'] }}>
                  {t('aiGuide.veteranTipBody')}
                </Text>
                <View style={{ marginTop: spacing['3'], gap: spacing['1'] }}>
                  <Text variant="caption" color={colors.amber400}>{t('aiGuide.veteranBullet1')}</Text>
                  <Text variant="caption" color={colors.amber400}>{t('aiGuide.veteranBullet2')}</Text>
                </View>
                <LockedOverlay
                  requiredPlan="compostelero"
                  message={t('aiGuide.lockedOverlay')}
                  onPress={() => router.push('/plans')}
                />
              </Card>
            </View>

            <Button
              label={t('aiGuide.viewCompostelero')}
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
      <Header title={t('aiGuide.title')} onBack={() => router.back()} />
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
            colors={gradients.premiumCard}
            style={StyleSheet.absoluteFill}
          />
          <Text variant="display" color={colors.cream}>
            {t('aiGuide.askTitle')}
          </Text>
          <Text variant="small" color={colors.stone300} style={{ marginTop: spacing['2'] }}>
            {t('aiGuide.askSubtitle')}
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
          {CHIP_TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => handleChip(type)}
              disabled={recMut.isPending}
              accessibilityRole="button"
              accessibilityLabel={t(`aiGuide.types.${type}`)}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
            >
              <Text variant="bodyMedium" color={colors.cream}>
                {t(`aiGuide.chips.${type}`)}
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
                {t('aiGuide.loading')}
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
              {t('aiGuide.errorTitle')}
            </Text>
            <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
              {(recMut.error as Error).message ?? t('common.error')}
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
              {t('aiGuide.emptyHint')}
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
            {t(`aiGuide.types.${entry.type}`)}
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
          {entry.contextUsed.hasStage ? <Tag label={t('aiGuide.tagStage')} /> : null}
          {entry.contextUsed.hasRoute ? <Tag label={t('aiGuide.tagRoute')} /> : null}
          {entry.contextUsed.hasHealth ? <Tag label={t('aiGuide.tagHealth')} /> : null}
          {entry.contextUsed.hasWeather ? <Tag label={t('aiGuide.tagWeather')} /> : null}
          {entry.contextUsed.hasPace ? <Tag label={t('aiGuide.tagPace')} /> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing['4'], marginTop: spacing['2'] }}>
          <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel={t('community.saved')}>
            <Ionicons name="bookmark-outline" size={18} color={colors.stone400} />
          </Pressable>
          <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel={t('common.share')}>
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
    borderColor: colors.goldTintStrong,
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
    backgroundColor: colors.goldTintSoft,
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
