import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Avatar } from '@components/Avatar';
import { Input } from '@components/Input';
import { Text } from '@design/text';
import { Skeleton } from '@components/Skeleton';
import { colors, radius, spacing } from '@design/tokens';
import { api, ApiError } from '@lib/api';
import { timeAgo } from '@lib/format';
import { toast } from '@stores/toast';

type PostDetail = {
  id: string;
  content: string;
  images: string[];
  locationName: string | null;
  createdAt: string;
  user: { id: string; name: string; username: string; avatar: string | null };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string; username: string; avatar: string | null };
  }>;
  _count: { likes: number; comments: number };
  likedByMe: boolean;
};

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');

  const postQ = useQuery({
    queryKey: ['post', id],
    queryFn: () => api<PostDetail>(`/posts/${id}`),
    enabled: !!id,
  });
  const post = postQ.data;

  const comment = useMutation({
    mutationFn: (content: string) =>
      api(`/posts/${id}/comments`, { method: 'POST', body: { content } }),
    onSuccess: () => {
      setDraft('');
      qc.invalidateQueries({ queryKey: ['post', id] });
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : 'No pudimos enviar el comentario.';
      toast.error(msg);
    },
  });

  const canSend = draft.trim().length >= 1 && !comment.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.stone950 }}
    >
      <Header onBack={() => router.back()} title="Publicación" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 64, paddingBottom: spacing['6'] }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: spacing['5'] }}>
          {postQ.isError ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing['12'] }}>
              <Ionicons name="cloud-offline-outline" size={48} color={colors.stone600} />
              <Text variant="bodyMedium" color={colors.stone300} style={{ marginTop: spacing['3'] }}>
                No pudimos cargar la publicación.
              </Text>
              <Pressable
                onPress={() => postQ.refetch()}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Reintentar carga de publicación"
                style={{ marginTop: spacing['4'] }}
              >
                <Text variant="bodyMedium" color={colors.amber400}>Reintentar</Text>
              </Pressable>
            </View>
          ) : post ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <Avatar source={post.user.avatar} name={post.user.name} size="md" />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" color={colors.cream}>{post.user.name}</Text>
                  <Text variant="caption" color={colors.stone400}>
                    @{post.user.username} · {timeAgo(post.createdAt)}
                  </Text>
                </View>
              </View>
              <Text variant="body" color={colors.cream} style={{ marginTop: spacing['4'] }}>
                {post.content}
              </Text>
              {post.images[0] ? (
                <Image source={{ uri: post.images[0] }} style={styles.img} contentFit="cover" />
              ) : null}
              {post.locationName ? (
                <View style={styles.location}>
                  <Ionicons name="location" size={14} color={colors.amber400} />
                  <Text variant="caption" color={colors.amber400}>{post.locationName}</Text>
                </View>
              ) : null}
              <View style={styles.divider} />
              <Text variant="h2" color={colors.cream}>Comentarios</Text>
              {post.comments.length === 0 ? (
                <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
                  Sé el primero en comentar.
                </Text>
              ) : (
                <View style={{ marginTop: spacing['4'], gap: spacing['4'] }}>
                  {post.comments.map((c) => (
                    <View key={c.id} style={{ flexDirection: 'row', gap: spacing['3'] }}>
                      <Avatar source={c.user.avatar} name={c.user.name} size="sm" />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium" color={colors.cream}>{c.user.name}</Text>
                        <Text variant="body" color={colors.stone200} style={{ marginTop: 2 }}>{c.content}</Text>
                        <Text variant="caption" color={colors.stone500} style={{ marginTop: 2 }}>{timeAgo(c.createdAt)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={{ gap: spacing['4'] }}>
              <Skeleton height={36} />
              <Skeleton height={120} borderRadius={radius.lg} />
              <Skeleton height={250} borderRadius={radius.lg} />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.inputBar}>
        <Input
          label="Comentar"
          value={draft}
          onChangeText={setDraft}
          containerStyle={{ flex: 1 }}
        />
        <Pressable
          disabled={!canSend}
          onPress={() => comment.mutate(draft.trim())}
          style={[styles.sendBtn, { opacity: canSend ? 1 : 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel="Enviar comentario"
          accessibilityState={{ disabled: !canSend }}
        >
          <Ionicons name="arrow-up" size={20} color={colors.stone950} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  img: {
    width: '100%',
    height: 320,
    marginTop: spacing['4'],
    borderRadius: radius.lg,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing['3'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.stone800,
    marginVertical: spacing['6'],
  },
  inputBar: {
    flexDirection: 'row',
    padding: spacing['3'],
    gap: spacing['2'],
    backgroundColor: colors.stone950,
    borderTopWidth: 1,
    borderColor: colors.stone800,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.amber400,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
});
