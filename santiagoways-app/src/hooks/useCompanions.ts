import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';

export type Companion = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  nationality: string | null;
  currentLat: number | null;
  currentLng: number | null;
  distanceKm: number;
  lastLocationAt: string | null;
  // TODO(api): backend doesn't surface currentStage yet — include when
  // /api/companions/nearby returns it so the nearby list can show it.
  currentStageName?: string | null;
};

export function useNearbyCompanions(enabled: boolean) {
  return useQuery({
    queryKey: ['companions', 'nearby'],
    queryFn: () => api<Companion[]>('/companions/nearby'),
    enabled,
    staleTime: 60_000,
  });
}
