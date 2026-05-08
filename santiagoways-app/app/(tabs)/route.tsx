import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { ProgressRing } from '@components/ProgressRing';
import { KmCounter } from '@components/KmCounter';
import { Badge } from '@components/Badge';
import { Skeleton } from '@components/Skeleton';
import { Button } from '@components/Button';
import { colors, layout, radius, spacing } from '@design/tokens';
import { pilgrimageStats, useMyPilgrimage } from '@hooks/usePilgrimage';

export default function RouteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const myQ = useMyPilgrimage();
  const stats = pilgrimageStats(myQ.data);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.stone950 }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing['4'],
        paddingBottom: layout.tabBarHeight + insets.bottom + spacing['8'],
      }}
    >
      <View style={{ paddingHorizontal: spacing['5'] }}>
        <Text variant="display" color={colors.cream}>
          Mi Camino
        </Text>

        {myQ.isLoading ? (
          <Skeleton height={280} borderRadius={radius.lg} style={{ marginTop: spacing['5'] }} />
        ) : !myQ.data ? (
          <Card style={{ marginTop: spacing['5'], alignItems: 'center', paddingVertical: spacing['8'] }}>
            <View style={styles.emptyIcon}>
              <Ionicons name="map-outline" size={32} color={colors.amber400} />
            </View>
            <Text variant="h2" color={colors.cream} align="center" style={{ marginTop: spacing['4'] }}>
              Aún no tienes ningún Camino
            </Text>
            <Text
              variant="small"
              color={colors.stone400}
              align="center"
              style={{ marginTop: spacing['2'], paddingHorizontal: spacing['5'] }}
            >
              Configura tu peregrinaje para empezar a registrar etapas, kilómetros y logros.
            </Text>
            <Button
              label="Empezar"
              onPress={() => router.push('/(auth)/profile-setup')}
              style={{ marginTop: spacing['5'] }}
            />
          </Card>
        ) : stats ? (
          <>
            <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['1'] }}>
              {myQ.data.route.name} ·{' '}
              {myQ.data.status === 'active'
                ? `Día ${stats.totalDays}`
                : myQ.data.status === 'completed'
                ? '¡Completado!'
                : myQ.data.status === 'planning'
                ? 'En planificación'
                : 'Pausado'}
            </Text>

            <Card elevation="raised" style={styles.summary}>
              <ProgressRing percentage={stats.progress} size={160} strokeWidth={10}>
                <KmCounter value={stats.walkedKm} decimals={0} suffix="" color={colors.cream} />
                <Text variant="caption" color={colors.stone400}>
                  de {stats.totalKmRoute.toFixed(0)} km
                </Text>
              </ProgressRing>
              <View style={styles.summaryStats}>
                <Stat label="Días" value={String(stats.totalDays)} />
                <Stat label="Etapas" value={`${stats.completed.length}/${myQ.data.stages.length}`} />
                <Stat
                  label="Restante"
                  value={
                    stats.remainingDays != null
                      ? `≈ ${stats.remainingDays} días`
                      : `${stats.remainingKm.toFixed(0)} km`
                  }
                />
              </View>
            </Card>

            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Ionicons name="walk" size={20} color={colors.amber400} />
                <Text variant="caption" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                  Pasos estimados
                </Text>
                <Text variant="h2" color={colors.cream}>
                  {Math.round(stats.walkedKm * 1400).toLocaleString('es-ES')}
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="trending-up" size={20} color={colors.amber400} />
                <Text variant="caption" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                  Desnivel +
                </Text>
                <Text variant="h2" color={colors.cream}>
                  {stats.elevationGain.toLocaleString('es-ES')} m
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="bed-outline" size={20} color={colors.amber400} />
                <Text variant="caption" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                  Albergues
                </Text>
                <Text variant="h2" color={colors.cream}>
                  {stats.completed.length}
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Ionicons name="trophy" size={20} color={colors.amber400} />
                <Text variant="caption" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                  Velocidad
                </Text>
                <Text variant="h2" color={colors.cream}>
                  {stats.totalDays > 0
                    ? (stats.walkedKm / stats.totalDays).toFixed(1)
                    : '0'}{' '}
                  km/d
                </Text>
              </Card>
            </View>

            <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
              Etapas
            </Text>
            <View style={{ marginTop: spacing['4'] }}>
              {myQ.data.stages.map((entry, i) => (
                <View key={entry.id} style={styles.timelineRow}>
                  <View style={styles.timelineCol}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor:
                            entry.status === 'completed' || entry.status === 'active'
                              ? colors.amber400
                              : colors.stone700,
                        },
                      ]}
                    >
                      {entry.status === 'completed' ? (
                        <Ionicons name="checkmark" size={12} color={colors.stone950} />
                      ) : entry.status === 'active' ? (
                        <View style={styles.pulseDot} />
                      ) : null}
                    </View>
                    {i < myQ.data!.stages.length - 1 ? <View style={styles.timelineLine} /> : null}
                  </View>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() => router.push(`/stage/${entry.stage.id}`)}
                  >
                    <Card style={{ opacity: entry.status === 'pending' ? 0.6 : 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text variant="bodyMedium" color={colors.cream}>
                        Etapa {entry.stage.number}
                      </Text>
                      <Badge
                        label={
                          entry.status === 'completed'
                            ? 'Completada'
                            : entry.status === 'active'
                            ? 'En curso'
                            : 'Pendiente'
                        }
                        variant={
                          entry.status === 'completed'
                            ? 'success'
                            : entry.status === 'active'
                            ? 'gold'
                            : 'neutral'
                        }
                      />
                    </View>
                    <Text variant="body" color={colors.stone300} style={{ marginTop: 2 }}>
                      {entry.stage.name}
                    </Text>
                    <Text variant="small" color={colors.stone400}>
                      {entry.stage.distanceKm.toFixed(1)} km · +{entry.stage.elevationGain} m
                    </Text>
                    </Card>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text variant="caption" color={colors.stone400}>{label}</Text>
      <Text variant="bodyBold" color={colors.cream} style={{ marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginTop: spacing['5'],
    alignItems: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing['5'],
    paddingTop: spacing['5'],
    borderTopWidth: 1,
    borderColor: colors.stone800,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    marginTop: spacing['4'],
  },
  statCard: {
    width: '47%',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
    marginBottom: spacing['3'],
  },
  timelineCol: {
    alignItems: 'center',
    paddingTop: spacing['4'],
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.stone800,
    marginTop: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.stone950,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
