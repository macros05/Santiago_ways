import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';

export type Stamp = {
  id: string;
  pilgrimageId: string | null;
  placeSlug: string;
  placeName: string;
  city: string | null;
  lat: number;
  lng: number;
  method: 'qr' | 'gps' | 'manual';
  stampedAt: string;
};

export type Credential = {
  stamps: Stamp[];
  compostelaEligible: boolean;
  stampsLast100km: number;
  uniqueDaysLast100km: number;
};

export function useCredential(pilgrimageId?: string) {
  return useQuery({
    queryKey: ['credential', pilgrimageId ?? 'all'],
    queryFn: () =>
      api<Credential>(`/credential${pilgrimageId ? `?pilgrimageId=${pilgrimageId}` : ''}`),
  });
}

type StampInput = {
  pilgrimageId?: string;
  placeSlug: string;
  placeName: string;
  city?: string;
  lat: number;
  lng: number;
  method: 'qr' | 'gps' | 'manual';
  userLat?: number;
  userLng?: number;
};

export function useAddStamp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StampInput) =>
      api<Stamp>('/credential/stamps', { method: 'POST', body: input as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credential'] });
    },
  });
}
