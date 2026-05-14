import { ReactNode, useMemo } from 'react';
import { StyleSheet } from 'react-native';

// @maplibre/maplibre-react-native ships a native module. Until the
// project is rebuilt with the MapLibre plugin AND a tile server (e.g.
// react-native-mbtiles-server) is wired to expose mbtiles over HTTP,
// the require() will throw at runtime — we swallow it and render the
// fallback `children` (typically the react-native-maps MapView).
let MapLibreNative: { Map?: unknown } | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  MapLibreNative = require('@maplibre/maplibre-react-native');
} catch {
  MapLibreNative = null;
}

type Props = {
  offlinePath: string | null;
  children: ReactNode;
};

export function OfflineStageMap({ offlinePath, children }: Props) {
  const mapStyle = useMemo(() => {
    if (!offlinePath) return null;
    return {
      version: 8,
      sources: {
        offline: {
          type: 'raster',
          tiles: [
            `http://127.0.0.1:8080/tile/{z}/{x}/{y}.png?file=${encodeURIComponent(offlinePath)}`,
          ],
          tileSize: 256,
        },
      },
      layers: [{ id: 'offline', type: 'raster', source: 'offline' }],
    };
  }, [offlinePath]);

  const MapComponent = (MapLibreNative as { Map?: unknown } | null)?.Map as
    | React.ComponentType<{ style?: unknown; mapStyle?: unknown }>
    | undefined;
  if (!mapStyle || !MapComponent) {
    return <>{children}</>;
  }
  return <MapComponent style={StyleSheet.absoluteFill} mapStyle={mapStyle} />;
}
