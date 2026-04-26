import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';

export type Route = {
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
  isPopular: boolean;
  imageUrl: string | null;
  _count?: { stages: number };
};

export type LockedRoute = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  country: string;
  color: string;
  locked: true;
  preview: {
    imageUrl: string | null;
    totalKm: number;
    difficulty: string;
    startCity: string;
  };
};

export type RouteListItem = Route | LockedRoute;

export function isLockedRoute(r: RouteListItem): r is LockedRoute {
  return (r as LockedRoute).locked === true;
}

export type PilgrimageStageEntry = {
  id: string;
  status: 'pending' | 'active' | 'completed';
  distanceWalked: number;
  startedAt: string | null;
  completedAt: string | null;
  stage: {
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
  };
};

export type Pilgrimage = {
  id: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  totalKm: number;
  startDate: string;
  endDate: string | null;
  route: Route;
  stages: PilgrimageStageEntry[];
};

export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: () => api<RouteListItem[]>('/routes'),
  });
}

export function useRoute(slug: string | null) {
  return useQuery({
    queryKey: ['route', slug],
    queryFn: () => api<Route & { stages: PilgrimageStageEntry['stage'][] }>(`/routes/${slug}`),
    enabled: !!slug,
  });
}

export function useMyPilgrimage() {
  return useQuery({
    queryKey: ['pilgrimage', 'me'],
    queryFn: () => api<Pilgrimage | null>('/pilgrimages/me'),
  });
}

export function usePilgrimage(id: string | null) {
  return useQuery({
    queryKey: ['pilgrimage', id],
    queryFn: () => api<Pilgrimage>(`/pilgrimages/${id}`),
    enabled: !!id,
  });
}

// Derived helpers
export function pilgrimageStats(p: Pilgrimage | null | undefined) {
  if (!p) return null;
  const completed = p.stages.filter((s) => s.status === 'completed');
  const active = p.stages.find((s) => s.status === 'active');
  const totalKmRoute = p.route.totalKm;
  const walkedKm = completed.reduce((sum, s) => sum + s.distanceWalked, 0) +
    (active?.distanceWalked ?? 0);
  const elevationGain = completed.reduce((s, e) => s + e.stage.elevationGain, 0);
  const totalDays = p.startDate
    ? Math.max(1, Math.floor((Date.now() - new Date(p.startDate).getTime()) / 86_400_000))
    : 0;
  const remainingKm = Math.max(0, totalKmRoute - walkedKm);
  const avgKmPerDay = totalDays > 0 ? walkedKm / totalDays : 0;
  const remainingDays = avgKmPerDay > 0 ? Math.ceil(remainingKm / avgKmPerDay) : null;
  return {
    completed,
    active,
    walkedKm,
    totalKmRoute,
    progress: totalKmRoute ? walkedKm / totalKmRoute : 0,
    elevationGain,
    totalDays,
    remainingKm,
    remainingDays,
  };
}
