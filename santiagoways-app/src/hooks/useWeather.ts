import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '@lib/weather';

export function useWeather(lat: number | null | undefined, lng: number | null | undefined) {
  return useQuery({
    queryKey: ['weather', lat, lng],
    queryFn: ({ signal }) =>
      lat != null && lng != null ? fetchWeather(lat, lng, signal) : null,
    enabled: lat != null && lng != null,
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  });
}
