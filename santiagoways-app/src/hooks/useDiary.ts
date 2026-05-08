import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';

export type DiaryEntry = {
  id: string;
  userId: string;
  pilgrimageId: string | null;
  stageId: string | null;
  date: string;
  title: string;
  body: string;
  images: string[];
  mood: string | null;
  weather: string | null;
  isPrivate: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListArgs = { stageId?: string; pilgrimageId?: string };

export function useDiaryEntries(args: ListArgs = {}) {
  const qs = new URLSearchParams();
  if (args.stageId) qs.set('stageId', args.stageId);
  if (args.pilgrimageId) qs.set('pilgrimageId', args.pilgrimageId);
  const path = `/diary${qs.toString() ? `?${qs}` : ''}`;
  return useQuery({
    queryKey: ['diary', args],
    queryFn: () => api<DiaryEntry[]>(path),
  });
}

export function useDiaryEntry(id: string | null) {
  return useQuery({
    queryKey: ['diary', id],
    queryFn: () => api<DiaryEntry>(`/diary/${id}`),
    enabled: !!id,
  });
}

type CreateInput = {
  title: string;
  body: string;
  images?: string[];
  mood?: 'happy' | 'tired' | 'inspired' | 'grateful' | 'challenged';
  weather?: string;
  stageId?: string;
  pilgrimageId?: string;
  date?: string;
};

export function useCreateDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInput) =>
      api<DiaryEntry>('/diary', { method: 'POST', body: input as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}

export function useUpdateDiaryEntry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateInput>) =>
      api<DiaryEntry>(`/diary/${id}`, { method: 'PATCH', body: input as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}

export function useDeleteDiaryEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<{ id: string }>(`/diary/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}

type ShareResult = { shareToken?: string; id: string };

export function useShareDiaryEntry() {
  const qc = useQueryClient();
  return useMutation<ShareResult, Error, { id: string; on: boolean }>({
    mutationFn: async ({ id, on }) => {
      if (on) {
        const r = await api<{ shareToken: string }>(`/diary/${id}/share`, { method: 'POST' });
        return { id, shareToken: r.shareToken };
      }
      const r = await api<{ id: string }>(`/diary/${id}/share`, { method: 'DELETE' });
      return { id: r.id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}
