import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { HeroOverlay } from '@components/HeroOverlay';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { StageCard } from '@components/StageCard';
import { Skeleton } from '@components/Skeleton';
import { colors, radius, spacing } from '@design/tokens';
import { api } from '@lib/api';

type RouteDetail = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  totalKm: number;
  difficulty: string;
  startCity: string;
  country: string;
  description: string;
  color: string;
  imageUrl: string | null;
  stages: Array<{
    id: string;
    number: number;
    name: string;
    startPoint: string;
    endPoint: string;
    distanceKm: number;
    elevationGain: number;
    elevationLoss: number;
    difficulty: string;
    imageUrl: string | null;
  }>;
};

export default function RouteDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const routeQ = useQuery({
    queryKey: ['route', slug],
    queryFn: () => api<RouteDetail>(`/routes/${slug}`),
    enabled: !!slug,
  });
  const r = routeQ.data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Header title={r?.name} onBack={() => router.back()} blur />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['16'] }}>
        <View style={styles.hero}>
          {r?.imageUrl ? (
            <Image source={{ uri: r.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient colors={[colors.stone800, colors.stone900]} style={StyleSheet.absoluteFill} />
          )}
          <HeroOverlay variant="subtle" />
          <View style={styles.heroFooter}>
            {r ? (
              <>
                <Badge label={r.country} variant="gold" />
                <Text variant="display" color={colors.cream} style={{ marginTop: spacing['3'] }}>
                  {r.name}
                </Text>
                <Text variant="body" color={colors.stone300} style={{ marginTop: 4 }}>
                  Inicio en {r.startCity}
                </Text>
              </>
            ) : (
              <Skeleton height={64} />
            )}
          </View>
        </View>

        {r ? (
          <View style={styles.stats}>
            <Stat icon="map" label="Distancia" value={`${r.totalKm.toFixed(0)} km`} />
            <Stat icon="footsteps" label="Etapas" value={String(r.stages.length)} />
            <Stat icon="alert-circle" label="Dificultad" value={r.difficulty} />
          </View>
        ) : null}

        {r ? (
          <View style={styles.section}>
            <Text variant="h2" color={colors.cream}>Sobre esta ruta</Text>
            <Text variant="body" color={colors.stone300} style={{ marginTop: spacing['3'] }}>
              {r.description}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text variant="h2" color={colors.cream}>Etapas</Text>
          <Text variant="small" color={colors.stone400} style={{ marginTop: 2 }}>
            {r ? `${r.stages.length} etapas · ${r.totalKm.toFixed(0)} km en total` : ''}
          </Text>
          <View style={{ marginTop: spacing['4'], gap: spacing['3'] }}>
            {routeQ.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={200} borderRadius={radius.lg} />
                ))
              : r?.stages.map((s) => (
                  <StageCard
                    key={s.id}
                    stage={{
                      id: s.id,
                      number: s.number,
                      name: s.name,
                      startPoint: s.startPoint,
                      endPoint: s.endPoint,
                      distanceKm: s.distanceKm,
                      elevationGain: s.elevationGain,
                      difficulty: (s.difficulty as 'easy' | 'medium' | 'hard') ?? 'medium',
                      imageUrl: s.imageUrl ?? undefined,
                    }}
                    onPress={() => router.push(`/stage/${s.id}`)}
                  />
                ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Ionicons name={icon} size={20} color={colors.amber400} />
      <Text variant="caption" color={colors.stone400} style={{ marginTop: 4 }}>
        {label}
      </Text>
      <Text variant="bodyBold" color={colors.cream}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 300,
    justifyContent: 'flex-end',
  },
  heroFooter: {
    padding: spacing['5'],
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: spacing['5'],
    paddingHorizontal: spacing['4'],
    borderBottomWidth: 1,
    borderColor: colors.stone800,
  },
  section: {
    padding: spacing['5'],
  },
});
