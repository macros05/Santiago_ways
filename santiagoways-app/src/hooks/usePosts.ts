import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';

export type Post = {
  id: string;
  content: string;
  images: string[];
  locationName: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    nationality: string | null;
  };
  _count: { likes: number; comments: number };
  likedByMe: boolean;
  bookmarkedByMe: boolean;
};

type Page = { items: Post[]; nextCursor: string | null };

export function usePostsFeed() {
  return useInfiniteQuery<Page>({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) =>
      api<Page>('/posts', { query: { cursor: pageParam as string | undefined } }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => api<{ liked: boolean }>(`/posts/${postId}/like`, { method: 'POST', body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useBookmarkPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api<{ bookmarked: boolean }>(`/posts/${postId}/bookmark`, { method: 'POST', body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}
