import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import { toast } from '@stores/toast';
import { t } from '@lib/i18n';

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
type FeedData = { pages: Page[]; pageParams: unknown[] };

/**
 * Apply `patch` to one post across every cached `['posts', …]` infinite feed
 * (the global feed and any per-stage feed). Used for optimistic toggles so the
 * UI flips instantly without refetching the whole paginated feed.
 */
function patchPostInFeeds(
  qc: ReturnType<typeof useQueryClient>,
  postId: string,
  patch: (p: Post) => Post,
) {
  qc.setQueriesData<FeedData>({ queryKey: ['posts'] }, (data) => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map((pg) => ({
        ...pg,
        items: pg.items.map((it) => (it.id === postId ? patch(it) : it)),
      })),
    };
  });
}

export function usePostsFeed(stageId?: string) {
  return useInfiniteQuery<Page>({
    queryKey: ['posts', stageId ?? 'all'],
    queryFn: ({ pageParam }) =>
      api<Page>('/posts', {
        query: { cursor: pageParam as string | undefined, stageId },
      }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api<{ liked: boolean }>(`/posts/${postId}/like`, { method: 'POST', body: {} }),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: ['posts'] });
      const prev = qc.getQueriesData<FeedData>({ queryKey: ['posts'] });
      patchPostInFeeds(qc, postId, (p) => ({
        ...p,
        likedByMe: !p.likedByMe,
        _count: { ...p._count, likes: p._count.likes + (p.likedByMe ? -1 : 1) },
      }));
      return { prev };
    },
    onError: (_e, _postId, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(t('common.error'));
    },
    onSuccess: (data, postId) => {
      // Reconcile the flag with the server's authoritative value.
      patchPostInFeeds(qc, postId, (p) =>
        p.likedByMe === data.liked ? p : { ...p, likedByMe: data.liked },
      );
    },
  });
}

export function useBookmarkPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api<{ bookmarked: boolean }>(`/posts/${postId}/bookmark`, { method: 'POST', body: {} }),
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: ['posts'] });
      const prev = qc.getQueriesData<FeedData>({ queryKey: ['posts'] });
      patchPostInFeeds(qc, postId, (p) => ({ ...p, bookmarkedByMe: !p.bookmarkedByMe }));
      return { prev };
    },
    onError: (_e, _postId, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));
      toast.error(t('common.error'));
    },
    onSuccess: (data, postId) => {
      patchPostInFeeds(qc, postId, (p) =>
        p.bookmarkedByMe === data.bookmarked ? p : { ...p, bookmarkedByMe: data.bookmarked },
      );
    },
  });
}
