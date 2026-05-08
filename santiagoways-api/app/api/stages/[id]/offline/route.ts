import { NextRequest } from 'next/server';
import { getAuth } from '@lib/auth';
import { err, handleApiError, notFound, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { canUseOfflineMaps } from '@lib/permissions';

// Computes a tight bounding box around the stage's GeoJSON LineString and
// returns a download manifest the client uses to grab a small MBTiles archive
// (or, when MBTiles isn't configured, the list of XYZ tiles to pre-cache).
//
// In production, the MBTiles file should be generated offline (e.g. with
// tippecanoe + mbtileserver) and uploaded to Cloudinary or S3. The env var
// MBTILES_BASE_URL points to the bucket / CDN, and we expect a file named
// `stage-{id}.mbtiles` to exist there.
export const dynamic = 'force-dynamic';

type LngLat = [number, number];

function computeBbox(coords: LngLat[]): { minLng: number; minLat: number; maxLng: number; maxLat: number } {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  // Pad ~2km on each side so the recorded path isn't right at the edge of the
  // tiles (≈0.02° at Iberian latitudes).
  return {
    minLng: minLng - 0.02,
    maxLng: maxLng + 0.02,
    minLat: minLat - 0.02,
    maxLat: maxLat + 0.02,
  };
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!canUseOfflineMaps(user)) {
      return err('Offline maps require Buen Camino plan', 403, 'PLAN_REQUIRED', {
        requiredPlan: 'buen_camino',
      });
    }

    const { id } = await ctx.params;
    const stage = await prisma.stage.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        coordinates: true,
        distanceKm: true,
      },
    });
    if (!stage) return notFound('Stage not found');

    const lineString = stage.coordinates as
      | { type: 'LineString'; coordinates: LngLat[] }
      | null;
    if (!lineString || !Array.isArray(lineString.coordinates) || lineString.coordinates.length < 2) {
      return err('Stage has no GPS track to download', 422, 'no_track');
    }

    const bbox = computeBbox(lineString.coordinates);
    const base = process.env.MBTILES_BASE_URL?.replace(/\/$/, '');
    const tilesUrl = base ? `${base}/stage-${stage.id}.mbtiles` : null;

    return ok({
      stageId: stage.id,
      name: stage.name,
      distanceKm: stage.distanceKm,
      bbox,
      // Approximate uncompressed size at zoom 12-14 for a stage-sized tile pack.
      estimatedBytes: Math.round(stage.distanceKm * 240_000),
      // Primary asset — null when MBTILES_BASE_URL is not configured. The
      // client falls back to its in-app raster cache in that case.
      mbtilesUrl: tilesUrl,
      // Raster fallback: the public OpenStreetMap-compatible tile schema the
      // client can use to walk the bbox itself (zooms 11..14). Useful when
      // MBTiles aren't ready yet but we still want SOMETHING to download.
      rasterTemplate:
        process.env.RASTER_TILE_URL_TEMPLATE ??
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      rasterZoomRange: [11, 14] as [number, number],
    });
  } catch (e) {
    return handleApiError(e);
  }
}
