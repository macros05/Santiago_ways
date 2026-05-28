import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
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
import { MapMarker } from '@components/MapMarker';
import { UpgradeBottomSheet } from '@components/UpgradeBottomSheet';
import { HeroOverlay } from '@components/HeroOverlay';
import { colors, radius, spacing } from '@design/tokens';
import { api } from '@lib/api';
import { formatElevation, formatKm } from '@lib/format';
import { useCanAccess } from '@hooks/useSubscription';
import {
  deleteStageOffline,
  downloadStageOffline,
  isStageDownloaded,
} from '@lib/offline';
import { OfflineStageMap } from '@components/OfflineStageMap';
import { useOfflineMap } from '@hooks/useOfflineMap';
import { toast } from '@stores/toast';
import { ElevationProfile } from '@components/ElevationProfile';
import { useTracking } from '@lib/tracking';
import { useMyPilgrimage } from '@hooks/usePilgrimage';
import { Analytics } from '@lib/analytics';

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
  coordinates: { type: 'LineString'; coordinates: [number, number][] } | null;
  route: { name: string; color: string };
  waypoints: Array<{
    id: string;
    name: string;
    type: string;
    description: string | null;
    lat: number;
    lng: number;
  }>;
  offlineAvailable?: boolean;
};

type StageAlbergue =
  | {
      id: string;
      name: string;
      city: string;
      type: string;
      pricePerNight: number | null;
      totalBeds: number | null;
      amenities: string[];
      imageUrl: string | null;
      ratingAvg: number | null;
      ratingCount: number;
    }
  | {
      id: string;
      locked: true;
      preview: { name: string; city: string; type: string; imageUrl: string | null };
    };

function isLockedAlbergue(
  a: StageAlbergue,
): a is Extract<StageAlbergue, { locked: true }> {
  return (a as { locked?: boolean }).locked === true;
}

type Tab = 'overview' | 'map' | 'albergues' | 'tips';

export default function StageDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [offlineUpgrade, setOfflineUpgrade] = useState(false);
  const canOffline = useCanAccess('offline_maps');
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadPct, setDownloadPct] = useState(0);
  const offline = useOfflineMap(id ?? null);

  useEffect(() => {
    let cancelled = false;
    if (id) {
      isStageDownloaded(id)
        .then((v) => { if (!cancelled) setDownloaded(v); })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [id]);

  const handleOfflineToggle = async () => {
    if (!id) return;
    if (downloaded) {
      try {
        await deleteStageOffline(id);
        setDownloaded(false);
        toast.success('Mapas eliminados.');
      } catch {
        toast.error('No pudimos borrar los mapas.');
      }
      return;
    }
    setDownloading(true);
    setDownloadPct(0);
    try {
      await downloadStageOffline(id, ({ received, total }) => {
        if (total > 0) setDownloadPct(Math.min(99, Math.round((received / total) * 100)));
      });
      setDownloaded(true);
      setDownloadPct(100);
      toast.success('Etapa disponible offline.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'MBTILES_BASE_URL_NOT_SET') {
        toast.info('Mapas offline llegan próximamente para esta ruta.');
      } else {
        toast.error('No pudimos completar la descarga.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const stageQ = useQuery({
    queryKey: ['stage', id],
    queryFn: () => api<Stage>(`/stages/${id}`),
    enabled: !!id,
  });

  const albergueQ = useQuery({
    queryKey: ['stage', id, 'albergues'],
    queryFn: () => api<StageAlbergue[]>(`/stages/${id}/albergues`),
    enabled: !!id && tab === 'albergues',
  });

  const stage = stageQ.data;

  // ── Tracking integration ───────────────────────────────────────────────
  const myQ = useMyPilgrimage();
  const isTracking = useTracking((s) => s.isTracking);
  const trackingPilgrimage = useTracking((s) => s.pilgrimageId);
  const distanceMeters = useTracking((s) => s.distanceMeters);
  const startTracking = useTracking((s) => s.start);
  const stopTracking = useTracking((s) => s.stop);

  const startTrack = async () => {
    if (!stage || !myQ.data) {
      toast.info('Necesitas tener una peregrinación activa.');
      return;
    }
    const polyline = (stage.coordinates?.coordinates ?? []).map(([lng, lat]) => ({ lat, lng }));
    try {
      await startTracking(myQ.data.id, polyline);
      Analytics.trackingStarted();
      toast.success('Tracking iniciado.');
    } catch {
      toast.error('Necesitamos permiso de ubicación.');
    }
  };

  const stopTrack = async () => {
    const result = await stopTracking();
    if (result) {
      Analytics.trackingStopped(result.distanceMeters / 1000, result.durationMin);
      Analytics.stageCompleted(stage?.id ?? '', 'gps');
      toast.success(`Etapa registrada · ${(result.distanceMeters / 1000).toFixed(1)} km`);
    }
  };

  useEffect(() => {
    if (id) Analytics.stageView(id);
  }, [id]);

  if (stageQ.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['8'] }}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.stone600} />
          <Text variant="bodyMedium" color={colors.stone300} style={{ marginTop: spacing['3'], textAlign: 'center' }}>
            No pudimos cargar esta etapa.
          </Text>
          <Pressable
            onPress={() => stageQ.refetch()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga de etapa"
            style={{ marginTop: spacing['4'] }}
          >
            <Text variant="bodyMedium" color={colors.amber400}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
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
          <HeroOverlay variant="subtle" />
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
            {/* Elevation profile */}
            <ElevationProfile
              totalKm={stage.distanceKm}
              elevationGain={stage.elevationGain}
              elevationLoss={stage.elevationLoss}
            />

            {/* Live tracking controls */}
            <Card style={{ marginTop: spacing['4'] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(251,191,36,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={isTracking && trackingPilgrimage === myQ.data?.id ? 'radio' : 'play'}
                    size={20}
                    color={colors.amber400}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyBold" color={colors.cream}>
                    {isTracking ? 'Tracking activo' : 'Track esta etapa'}
                  </Text>
                  <Text variant="caption" color={colors.stone400}>
                    {isTracking
                      ? `${(distanceMeters / 1000).toFixed(2)} km registrados`
                      : 'GPS preciso, GPX al final, validación de etapa'}
                  </Text>
                </View>
                <Button
                  label={isTracking ? 'Parar' : 'Empezar'}
                  size="sm"
                  onPress={isTracking ? stopTrack : startTrack}
                />
              </View>
            </Card>

            {/* Diary + credential shortcuts */}
            <View style={{ flexDirection: 'row', gap: spacing['3'], marginTop: spacing['4'] }}>
              <Pressable style={{ flex: 1 }} onPress={() => router.push(`/diary/new?stageId=${stage.id}${myQ.data?.id ? `&pilgrimageId=${myQ.data.id}` : ''}`)}>
                <Card padding="3" style={{ alignItems: 'center', gap: 6 }}>
                  <Ionicons name="book-outline" size={20} color={colors.amber400} />
                  <Text variant="caption" color={colors.cream}>Anotar en diario</Text>
                </Card>
              </Pressable>
              <Pressable style={{ flex: 1 }} onPress={() => router.push('/credential/add')}>
                <Card padding="3" style={{ alignItems: 'center', gap: 6 }}>
                  <Ionicons name="ribbon-outline" size={20} color={colors.amber400} />
                  <Text variant="caption" color={colors.cream}>Sellar credencial</Text>
                </Card>
              </Pressable>
            </View>

            <Text variant="body" color={colors.stone200} style={{ marginTop: spacing['8'] }}>
              {stage.description}
            </Text>
            <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
              Puntos de interés
            </Text>
            {stage.waypoints.length === 0 ? (
              <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
                Esta etapa no tiene puntos de interés registrados.
              </Text>
            ) : (
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
            )}
          </View>
        ) : null}

        {tab === 'map' && stage ? (
          <View style={styles.section}>
            <View style={styles.mapWrap}>
              {(() => {
                const coords = stage.coordinates?.coordinates ?? [];
                if (coords.length < 2) {
                  return (
                    <View style={styles.mapEmpty}>
                      <Ionicons name="map-outline" size={48} color={colors.stone600} />
                      <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
                        Esta etapa no tiene coordenadas
                      </Text>
                    </View>
                  );
                }
                const first = coords[0]!;
                const last = coords[coords.length - 1]!;
                return (
                  <OfflineStageMap offlinePath={offline.path}>
                    <MapView
                      provider={PROVIDER_DEFAULT}
                      style={StyleSheet.absoluteFill}
                      initialRegion={regionFor(coords)}
                      scrollEnabled
                      zoomEnabled
                    >
                      <Polyline
                        coordinates={coords.map(([lng, lat]) => ({
                          latitude: lat,
                          longitude: lng,
                        }))}
                        strokeColor={stage.route.color}
                        strokeWidth={4}
                      />
                      <Marker
                        coordinate={{ latitude: first[1], longitude: first[0] }}
                        title={stage.startPoint}
                      >
                        <MapMarker type="info" size={28} />
                      </Marker>
                      <Marker
                        coordinate={{ latitude: last[1], longitude: last[0] }}
                        title={stage.endPoint}
                      >
                        <MapMarker type="church" size={28} />
                      </Marker>
                      {stage.waypoints.map((w) => (
                        <Marker
                          key={w.id}
                          coordinate={{ latitude: w.lat, longitude: w.lng }}
                          title={w.name}
                          description={w.description ?? undefined}
                        >
                          <MapMarker type={waypointType(w.type)} size={22} />
                        </Marker>
                      ))}
                    </MapView>
                  </OfflineStageMap>
                );
              })()}
            </View>
            <Button
              label={
                !canOffline
                  ? 'Descarga offline · Premium'
                  : downloading
                  ? `Descargando… ${downloadPct}%`
                  : downloaded
                  ? 'Eliminar mapas offline'
                  : 'Descargar para offline'
              }
              variant="secondary"
              fullWidth
              loading={downloading}
              disabled={downloading}
              iconLeft={
                <Ionicons
                  name={
                    !canOffline
                      ? 'lock-closed'
                      : downloaded
                      ? 'checkmark-circle'
                      : 'cloud-download-outline'
                  }
                  size={18}
                  color={!canOffline ? colors.amber400 : downloaded ? colors.success : colors.cream}
                />
              }
              style={{ marginTop: spacing['4'] }}
              onPress={() => {
                if (!canOffline) {
                  setOfflineUpgrade(true);
                } else {
                  handleOfflineToggle();
                }
              }}
            />
          </View>
        ) : null}

        {tab === 'albergues' ? (
          <View style={styles.section}>
            {albergueQ.isLoading ? (
              <View style={{ gap: spacing['3'] }}>
                <Skeleton height={120} borderRadius={radius.lg} />
                <Skeleton height={120} borderRadius={radius.lg} />
                <Skeleton height={120} borderRadius={radius.lg} />
              </View>
            ) : (
              <View style={{ gap: spacing['3'] }}>
                {albergueQ.data?.map((a) =>
                  isLockedAlbergue(a) ? (
                    <Pressable key={a.id} onPress={() => router.push('/plans')}>
                      <Card style={styles.lockedAlbergue}>
                        <View style={styles.lockedThumb}>
                          <Ionicons name="lock-closed" size={20} color={colors.amber400} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text variant="bodyMedium" color={colors.stone300}>
                            {a.preview.name}
                          </Text>
                          <Text variant="caption" color={colors.stone500}>
                            {a.preview.city} · {a.preview.type}
                          </Text>
                        </View>
                        <Text variant="caption" color={colors.amber400}>
                          Premium
                        </Text>
                      </Card>
                    </Pressable>
                  ) : (
                    <Pressable key={a.id} onPress={() => router.push(`/albergue/${a.id}`)}>
                      <Card style={{ flexDirection: 'row', gap: spacing['3'] }}>
                        {a.imageUrl ? (
                          <Image source={{ uri: a.imageUrl }} style={styles.albergueThumb} />
                        ) : (
                          <View style={[styles.albergueThumb, { backgroundColor: colors.stone800 }]}>
                            <Ionicons name="bed" size={20} color={colors.stone500} />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text variant="bodyBold" color={colors.cream} numberOfLines={1}>
                            {a.name}
                          </Text>
                          <Text variant="caption" color={colors.stone400}>
                            {a.city} · {a.type}
                          </Text>
                          <View style={{ flexDirection: 'row', gap: spacing['3'], marginTop: 4 }}>
                            {a.pricePerNight != null ? (
                              <Text variant="caption" color={colors.amber400}>
                                €{a.pricePerNight.toFixed(0)}
                              </Text>
                            ) : null}
                            {a.ratingAvg != null ? (
                              <Text variant="caption" color={colors.stone400}>
                                ★ {a.ratingAvg.toFixed(1)}
                              </Text>
                            ) : null}
                            {a.totalBeds != null ? (
                              <Text variant="caption" color={colors.stone400}>
                                {a.totalBeds} camas
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  ),
                )}
                {albergueQ.data?.length === 0 ? (
                  <Text variant="small" color={colors.stone400}>
                    Sin albergues registrados en esta etapa.
                  </Text>
                ) : null}
              </View>
            )}
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

      <UpgradeBottomSheet
        visible={offlineUpgrade}
        onClose={() => setOfflineUpgrade(false)}
        requiredPlan="buen_camino"
        iconName="cloud-download"
        title="Mapas para llevar offline"
        bullets={[
          'Descarga etapas completas para sin cobertura',
          'GPS preciso aunque pierdas señal',
          'Lleva el Camino siempre en el bolsillo',
        ]}
      />
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

function waypointType(t: string): import('@components/MapMarker').MarkerType {
  const allowed: import('@components/MapMarker').MarkerType[] = [
    'albergue', 'waypoint', 'pilgrim', 'danger', 'church',
    'fountain', 'viewpoint', 'bar', 'info',
  ];
  return (allowed.includes(t as import('@components/MapMarker').MarkerType)
    ? (t as import('@components/MapMarker').MarkerType)
    : 'info');
}

function regionFor(coords: [number, number][]) {
  // Caller guarantees coords.length >= 2 — see the early-return path above.
  const lats = coords.map((c) => c[1]);
  const lngs = coords.map((c) => c[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padding = 0.1;
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.05, (maxLat - minLat) * (1 + padding * 2)),
    longitudeDelta: Math.max(0.05, (maxLng - minLng) * (1 + padding * 2)),
  };
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

function Tab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
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
  mapWrap: {
    height: 360,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.stone700,
    backgroundColor: colors.stone900,
  },
  mapEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albergueThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedAlbergue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    opacity: 0.85,
  },
  lockedThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: 'rgba(251,191,36,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
