import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Header } from '@components/Header';
import { Badge } from '@components/Badge';
import { Card } from '@components/Card';
import { Skeleton } from '@components/Skeleton';
import { Button } from '@components/Button';
import { colors, radius, spacing } from '@design/tokens';
import { api } from '@lib/api';
import { formatElevation, formatKm } from '@lib/format';

type Stage = {
  id: string;
  number: number;
  name: string;
  startPoint: string;
  endPoint: string;
  distanceKm: number;
  elevationGain: number;
  elevationLoss: number;
  difficulty: string;
  description: string;
  tips: string;
  imageUrl: string | null;
  route: { name: string; color: string };
  waypoints: Array<{ id: string; name: string; type: string; description: string | null }>;
};

type Tab = 'overview' | 'map' | 'albergues' | 'tips';

export default function StageDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');

  const stageQ = useQuery({
    queryKey: ['stage', id],
    queryFn: () => api<Stage>(`/stages/${id}`),
    enabled: !!id,
  });

  const stage = stageQ.data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={stage?.name} onBack={() => router.back()} blur />

      <ScrollView contentContainerStyle={{ paddingBottom: spacing['16'] }}>
        <View style={styles.hero}>
          {stage?.imageUrl ? (
            <Image source={{ uri: stage.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient
              colors={[colors.stone800, colors.stone900]}
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={['rgba(12,10,9,0.2)', 'rgba(12,10,9,0.95)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroFooter}>
            {stage ? (
              <>
                <Badge label={`Etapa ${stage.number}`} variant="gold" />
                <Text variant="display" color={colors.cream} style={{ marginTop: spacing['3'] }}>
                  {stage.name}
                </Text>
                <Text variant="body" color={colors.stone300} style={{ marginTop: 4 }}>
                  {stage.startPoint} → {stage.endPoint}
                </Text>
              </>
            ) : (
              <Skeleton height={64} />
            )}
          </View>
        </View>

        {stage ? (
          <View style={styles.stats}>
            <Stat icon="walk" label="Distancia" value={formatKm(stage.distanceKm)} />
            <Stat icon="trending-up" label="Subida" value={formatElevation(stage.elevationGain)} />
            <Stat icon="trending-down" label="Bajada" value={formatElevation(stage.elevationLoss)} />
            <Stat icon="alert-circle" label="Dificultad" value={stage.difficulty} />
          </View>
        ) : null}

        <View style={styles.tabs}>
          {(['overview', 'map', 'albergues', 'tips'] as Tab[]).map((t) => (
            <Tab key={t} active={tab === t} label={label(t)} onPress={() => setTab(t)} />
          ))}
        </View>

        {tab === 'overview' && stage ? (
          <View style={styles.section}>
            <Text variant="body" color={colors.stone200}>
              {stage.description}
            </Text>
            <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
              Puntos de interés
            </Text>
            <View style={{ marginTop: spacing['4'], gap: spacing['3'] }}>
              {stage.waypoints.map((w) => (
                <Card key={w.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                  <View style={styles.wpIcon}>
                    <Ionicons name={iconFor(w.type)} size={16} color={colors.amber400} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" color={colors.cream}>{w.name}</Text>
                    {w.description ? (
                      <Text variant="small" color={colors.stone400} numberOfLines={2}>
                        {w.description}
                      </Text>
                    ) : null}
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ) : null}

        {tab === 'map' ? (
          <View style={styles.section}>
            <Card style={{ height: 320, padding: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="map-outline" size={48} color={colors.stone600} />
              <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
                Mapa de la etapa (Mapbox)
              </Text>
            </Card>
            <Button
              label="Descargar para offline"
              variant="secondary"
              fullWidth
              iconLeft={<Ionicons name="cloud-download-outline" size={18} color={colors.cream} />}
              style={{ marginTop: spacing['4'] }}
              onPress={() => null}
            />
          </View>
        ) : null}

        {tab === 'albergues' ? (
          <View style={styles.section}>
            <Text variant="body" color={colors.stone400}>
              Cargando albergues de esta etapa…
            </Text>
            <Skeleton height={120} borderRadius={radius.lg} style={{ marginTop: spacing['4'] }} />
          </View>
        ) : null}

        {tab === 'tips' && stage ? (
          <View style={styles.section}>
            <Card>
              <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
                <Ionicons name="bulb" size={20} color={colors.amber400} />
                <Text variant="body" color={colors.stone200} style={{ flex: 1 }}>
                  {stage.tips}
                </Text>
              </View>
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function label(t: Tab) {
  return { overview: 'Resumen', map: 'Mapa', albergues: 'Albergues', tips: 'Consejos' }[t];
}

function iconFor(type: string): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap {
  const map: Record<string, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
    church: 'business',
    bar: 'cafe',
    fountain: 'water',
    viewpoint: 'eye',
    danger: 'warning',
    info: 'information-circle',
  };
  return map[type] ?? 'flag';
}

function Stat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Ionicons name={icon} size={18} color={colors.amber400} />
      <Text variant="caption" color={colors.stone400} style={{ marginTop: 4 }}>{label}</Text>
      <Text variant="bodyBold" color={colors.cream}>{value}</Text>
    </View>
  );
}

import { Pressable } from 'react-native';

function Tab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text variant="bodyMedium" color={active ? colors.amber400 : colors.stone400}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 320,
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing['4'],
    borderBottomWidth: 1,
    borderColor: colors.stone800,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing['4'],
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: colors.amber400,
  },
  section: {
    padding: spacing['5'],
  },
  wpIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
