import { useEffect, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@lib/api';
import { getPusherClient } from '@lib/pusherClient';
import { useIsCompostelero } from './useSubscription';

export type ChatMessage = {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
};

export type ChatRoom = {
  id: string;
  name: string;
  type: string;
  routeId: string | null;
  lastMessage: ChatMessage | null;
  messageCount: number;
};

export function useChatRooms() {
  const enabled = useIsCompostelero();
  return useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: () => api<ChatRoom[]>('/chat/rooms'),
    enabled,
  });
}

type Page = { items: ChatMessage[]; nextCursor: string | null };

export function useChatMessages(roomId: string | null) {
  const enabled = useIsCompostelero() && !!roomId;
  return useInfiniteQuery<Page>({
    queryKey: ['chat', 'room', roomId, 'messages'],
    queryFn: ({ pageParam }) =>
      api<Page>(`/chat/rooms/${roomId}/messages`, {
        query: { cursor: pageParam as string | undefined },
      }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled,
  });
}

export function useSendChatMessage(roomId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api<ChatMessage>(`/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        body: { content },
      }),
    onSuccess: (msg) => {
      qc.setQueryData<{ pages: Page[]; pageParams: unknown[] } | undefined>(
        ['chat', 'room', roomId, 'messages'],
        (old) => {
          if (!old) return old;
          const [first, ...rest] = old.pages;
          if (!first) return old;
          if (first.items.some((m) => m.id === msg.id)) return old;
          return { ...old, pages: [{ ...first, items: [msg, ...first.items] }, ...rest] };
        },
      );
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
  });
}

export function useChatRealtime(roomId: string | null) {
  const enabled = useIsCompostelero() && !!roomId;
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !roomId) return;
    const p = getPusherClient();
    if (!p) return;
    const channelName = `private-compostelero-${roomId}`;
    const channel = p.subscribe(channelName);
    channel.bind('pusher:subscription_succeeded', () => setConnected(true));
    channel.bind('pusher:subscription_error', () => setConnected(false));
    channel.bind('message', (msg: ChatMessage) => {
      qc.setQueryData<{ pages: Page[]; pageParams: unknown[] } | undefined>(
        ['chat', 'room', roomId, 'messages'],
        (old) => {
          if (!old) return old;
          const [first, ...rest] = old.pages;
          if (!first) return old;
          if (first.items.some((m) => m.id === msg.id)) return old;
          return { ...old, pages: [{ ...first, items: [msg, ...first.items] }, ...rest] };
        },
      );
    });
    return () => {
      channel.unbind_all();
      p.unsubscribe(channelName);
      setConnected(false);
    };
  }, [enabled, roomId, qc]);

  return { connected };
}
