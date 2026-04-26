import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useQueries } from '@tanstack/react-query';
import { Text } from '@design/text';
import { MapMarker } from '@components/MapMarker';
import { Badge } from '@components/Badge';
import { colors, radius, shadows, spacing } from '@design/tokens';
import { useRoutes, type Route } from '@hooks/usePilgrimage';
import { api } from '@lib/api';

type Stage = {
  id: string;
  number: number;
  coordinates: { type: 'LineString'; coordinates: [number, number][] };
};
type RouteWithStages = Route & { stages: Stage[] };

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [permission, setPermission] = useState(false);
  const [showAlbergues, setShowAlbergues] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const routesQ = useRoutes();

  // For each route, fetch stages so we can build a polyline.
  const stageQueries = useQueries({
    queries: (routesQ.data ?? []).map((r) => ({
      queryKey: ['route', r.slug, 'stages'],
      queryFn: () => api<RouteWithStages>(`/routes/${r.slug}`),
      enabled: !!routesQ.data,
      staleTime: 5 * 60_000,
    })),
  });

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then((res) => setPermission(res.granted));
  }, []);

  const polylines = useMemo(() => {
    return stageQueries.flatMap((q, i) => {
      const route = routesQ.data?.[i];
      if (!q.data || !route) return [];
      const coords: { latitude: number; longitude: number }[] = [];
      for (const stage of q.data.stages ?? []) {
        const c = stage.coordinates?.coordinates;
        if (Array.isArray(c)) {
          for (const point of c) {
            if (Array.isArray(point) && point.length >= 2) {
              coords.push({ latitude: point[1]!, longitude: point[0]! });
            }
          }
        }
      }
      return coords.length > 1
        ? [{ id: route.id, color: route.color, coords, name: route.name }]
        : [];
    });
  }, [stageQueries, routesQ.data]);

  // Endpoint markers (start and Santiago)
  const endpoints = useMemo(() => {
    const out: { id: string; lat: number; lng: number; label: string; color: string }[] = [];
    for (const p of polylines) {
      if (p.coords.length === 0) continue;
      out.push({
        id: p.id + '-start',
        lat: p.coords[0]!.latitude,
        lng: p.coords[0]!.longitude,
        label: p.name + ' (inicio)',
        color: p.color,
      });
    }
    return out;
  }, [polylines]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        showsUserLocation={permission}
        initialRegion={{
          latitude: 41.5,
          longitude: -5.5,
          latitudeDelta: 6.5,
          longitudeDelta: 8,
        }}
      >
        {showRoutes
          ? polylines.map((p) => (
              <Polyline
                key={p.id}
                coordinates={p.coords}
                strokeColor={p.color}
                strokeWidth={3.5}
              />
            ))
          : null}

        {showRoutes
          ? endpoints.map((e) => (
              <Marker
                key={e.id}
                coordinate={{ latitude: e.lat, longitude: e.lng }}
                title={e.label}
              >
                <View style={[styles.endMarker, { borderColor: e.color }]}>
                  <View style={[styles.endMarkerInner, { backgroundColor: e.color }]} />
                </View>
              </Marker>
            ))
          : null}

        {/* Santiago — la meta */}
        {showAlbergues ? (
          <Marker coordinate={{ latitude: 42.881, longitude: -8.545 }} title="Santiago de Compostela">
            <MapMarker type="church" size={36} pulse />
          </Marker>
        ) : null}
      </MapView>

      {/* Top search/filter bar */}
      <View style={[styles.search, { top: insets.top + spacing['3'] }]}>
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <Ionicons name="search" size={20} color={colors.stone300} />
        <Text variant="body" color={colors.stone300}>
          Busca etapas, albergues, ciudades…
        </Text>
      </View>

      {/* Layer toggles */}
      <View style={[styles.layers, { top: insets.top + 80 }]}>
        <LayerChip
          active={showRoutes}
          icon="trail-sign"
          label={`Rutas (${routesQ.data?.length ?? 0})`}
          onPress={() => setShowRoutes((v) => !v)}
        />
        <LayerChip
          active={showAlbergues}
          icon="bed"
          label="Hitos"
          onPress={() => setShowAlbergues((v) => !v)}
        />
      </View>

      {/* Route legend */}
      {showRoutes && routesQ.data ? (
        <View style={[styles.legend, { top: insets.top + 132 }]}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          {routesQ.data.map((r) => (
            <View key={r.id} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: r.color }]} />
              <Text variant="caption" color={colors.cream} numberOfLines={1}>
                {r.name}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Floating tracking button */}
      <Pressable style={[styles.fab, { bottom: insets.bottom + 100 }]}>
        <Ionicons name="play" size={22} color={colors.stone950} />
      </Pressable>

      {/* Live counter */}
      <View style={[styles.live, { bottom: insets.bottom + 170 }]}>
        <Badge label="● En vivo" variant="gold" />
      </View>
    </View>
  );
}

function LayerChip({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.amber400 : 'rgba(28,25,23,0.85)',
          borderColor: active ? colors.amber400 : colors.stone700,
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={active ? colors.stone950 : colors.cream} />
      <Text variant="caption" color={active ? colors.stone950 : colors.cream}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    position: 'absolute',
    left: spacing['4'],
    right: spacing['4'],
    height: 48,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.stone700,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    gap: spacing['2'],
    ...shadows.md,
  },
  layers: {
    position: 'absolute',
    left: spacing['4'],
    flexDirection: 'row',
    gap: spacing['2'],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    borderWidth: 1,
  },
  legend: {
    position: 'absolute',
    left: spacing['4'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.stone700,
    gap: 6,
    maxWidth: 200,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 4,
    borderRadius: 2,
  },
  endMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    backgroundColor: colors.stone950,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    right: spacing['5'],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.amber400,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  live: {
    position: 'absolute',
    right: spacing['5'],
  },
});
