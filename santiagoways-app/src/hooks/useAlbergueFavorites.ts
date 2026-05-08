import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';

export type FavoriteAlbergue = {
  id: string;
  name: string;
  city: string;
  address: string;
  imageUrl: string | null;
  pricePerNight: number | null;
  amenities: string[];
};

export function useAlbergueFavorites() {
  return useQuery({
    queryKey: ['albergues', 'favorites'],
    queryFn: () => api<FavoriteAlbergue[]>('/albergues/favorites'),
  });
}

export function useToggleAlbergueFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      on
        ? api<{ favorited: boolean }>(`/albergues/${id}/favorite`, { method: 'POST' })
        : api<{ favorited: boolean }>(`/albergues/${id}/favorite`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['albergues', 'favorites'] });
      qc.invalidateQueries({ queryKey: ['albergue'] });
    },
  });
}
