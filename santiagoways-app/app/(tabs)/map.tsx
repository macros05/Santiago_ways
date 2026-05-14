import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Text } from '@design/text';
import { MapMarker } from '@components/MapMarker';
import { Badge } from '@components/Badge';
import { colors, radius, shadows, spacing } from '@design/tokens';
import { useRoutes, type Route } from '@hooks/usePilgrimage';
import { api } from '@lib/api';
import { toast } from '@stores/toast';

type Stage = {
  id: string;
  number: number;
  coordinates: { type: 'LineString'; coordinates: [number, number][] };
};
type RouteWithStages = Route & { stages: Stage[] };

// Memoized markers prevent re-rendering each pin every time map state
// (filters, regions) changes. With ~10-20 route endpoints today the win
// is modest; clustering becomes worthwhile once we cross ~50 markers,
// at which point switching to react-native-map-clustering or grouping
// markers by a ~10 km grid is the right move.
type EndpointInput = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color: string;
};

const EndpointMarker = memo(function EndpointMarker({ p }: { p: EndpointInput }) {
  return (
    <Marker coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.label}>
      <View style={[styles.endMarker, { borderColor: p.color }]}>
        <View style={[styles.endMarkerInner, { backgroundColor: p.color }]} />
      </View>
    </Marker>
  );
});

const RouteLine = memo(function RouteLine({
  coords,
  color,
}: {
  coords: { latitude: number; longitude: number }[];
  color: string;
}) {
  return <Polyline coordinates={coords} strokeColor={color} strokeWidth={3.5} />;
});

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
    let cancelled = false;
    Location.requestForegroundPermissionsAsync().then((res) => {
      if (!cancelled) setPermission(res.granted);
    });
    return () => {
      cancelled = true;
    };
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
          ? polylines.map((p) => <RouteLine key={p.id} coords={p.coords} color={p.color} />)
          : null}

        {showRoutes
          ? endpoints.map((e) => <EndpointMarker key={e.id} p={e} />)
          : null}

        {/* Santiago — la meta */}
        {showAlbergues ? (
          <Marker coordinate={{ latitude: 42.881, longitude: -8.545 }} title="Santiago de Compostela">
            <MapMarker type="church" size={36} pulse />
          </Marker>
        ) : null}
      </MapView>

      {/* Top search/filter bar — search is not yet implemented; tap toasts the
          user instead of presenting a dead TextInput. */}
      <Pressable
        onPress={() => toast.info('La búsqueda en el mapa llega pronto.')}
        style={[styles.search, { top: insets.top + spacing['3'] }]}
        accessibilityRole="search"
        accessibilityLabel="Buscar en el mapa"
        accessibilityHint="Próximamente disponible"
      >
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <Ionicons name="search" size={20} color={colors.stone300} />
        <Text variant="body" color={colors.stone300}>
          Busca etapas, albergues, ciudades…
        </Text>
      </Pressable>

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

      {/* Floating tracking button — opens the user's pilgrimage. */}
      <Pressable
        onPress={() => router.push('/(tabs)/route')}
        style={[styles.fab, { bottom: insets.bottom + 100 }]}
        accessibilityRole="button"
        accessibilityLabel="Abrir mi peregrinación"
      >
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
          // Mirror stone900 with ~85% alpha so the chip floats over the map.
          backgroundColor: active ? colors.amber400 : 'rgba(28,25,23,0.85)',
          borderColor: active ? colors.amber400 : colors.stone700,
        },
      ]}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: active }}
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
