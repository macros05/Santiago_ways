import { useQuery } from '@tanstack/react-query';
import { api } from '@lib/api';
import { useShowAds } from '@hooks/useSubscription';

export type FeaturedAlbergue = {
  id: string;
  name: string;
  city: string;
  type: string;
  pricePerNight: number | null;
  totalBeds: number | null;
  amenities: string[];
  imageUrl: string | null;
  description: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  sponsored: true;
  priority: number;
};

export function useFeaturedAlbergues() {
  const showAds = useShowAds();
  return useQuery({
    queryKey: ['ads', 'featured-albergues'],
    queryFn: () => api<FeaturedAlbergue[]>('/ads/featured-albergues', { auth: false }),
    enabled: showAds,
    staleTime: 5 * 60 * 1000,
  });
}
