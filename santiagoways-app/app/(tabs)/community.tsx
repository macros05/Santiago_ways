import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@design/text';
import { Avatar } from '@components/Avatar';
import { Skeleton } from '@components/Skeleton';
import { Card } from '@components/Card';
import { UpgradeBottomSheet } from '@components/UpgradeBottomSheet';
import { colors, layout, radius, shadows, spacing } from '@design/tokens';
import { type Post, useBookmarkPost, useLikePost, usePostsFeed } from '@hooks/usePosts';
import { useMyPilgrimage } from '@hooks/usePilgrimage';
import { useCanAccess } from '@hooks/useSubscription';
import { timeAgo } from '@lib/format';
import { t } from '@lib/i18n';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const myQ = useMyPilgrimage();
  const activeStage =
    myQ.data?.stages.find((s) => s.status === 'active') ??
    myQ.data?.stages.find((s) => s.status === 'pending');
  const activeStageId = activeStage?.stage.id ?? null;
  const [filterByStage, setFilterByStage] = useState(false);
  const feed = usePostsFeed(filterByStage && activeStageId ? activeStageId : undefined);
  const like = useLikePost();
  const bookmark = useBookmarkPost();
  const canPost = useCanAccess('community_post');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const onEndReached = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
  }, [feed]);

  const items = feed.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing['3'] }]}>
        <Text variant="display" color={colors.cream}>{t('community.title')}</Text>
        <Pressable
          onPress={() => router.push('/community/nearby')}
          style={styles.nearbyBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('community.nearbyCta')}
        >
          <Ionicons name="people" size={18} color={colors.amber400} />
          <Text variant="caption" color={colors.amber400}>
            {t('community.nearbyCta')}
          </Text>
        </Pressable>
      </View>

      {activeStageId ? (
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilterByStage((v) => !v)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filterByStage ? colors.amber400 : colors.stone900,
                borderColor: filterByStage ? colors.amber400 : colors.stone700,
              },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: filterByStage }}
          >
            <Ionicons
              name="footsteps"
              size={14}
              color={filterByStage ? colors.stone950 : colors.cream}
            />
            <Text
              variant="caption"
              color={filterByStage ? colors.stone950 : colors.cream}
              numberOfLines={1}
            >
              {t('community.filterMyStage')}
              {activeStage ? ` · ${activeStage.stage.name}` : ''}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <FlashList<Post>
        data={items}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{
          paddingHorizontal: spacing['5'],
          paddingBottom: layout.tabBarHeight + insets.bottom + spacing['8'],
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing['4'] }} />}
        ListEmptyComponent={
          feed.isLoading ? (
            <View style={{ gap: spacing['4'] }}>
              <Skeleton height={300} borderRadius={radius.lg} />
              <Skeleton height={300} borderRadius={radius.lg} />
            </View>
          ) : feed.isError ? (
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Ionicons name="cloud-offline-outline" size={56} color={colors.stone600} />
              <Text variant="bodyMedium" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
                {t('common.offlineError')}
              </Text>
              <Pressable
                onPress={() => feed.refetch()}
                accessibilityRole="button"
                accessibilityLabel={t('common.retry')}
                style={{ marginTop: spacing['3'], paddingVertical: spacing['2'], paddingHorizontal: spacing['5'] }}
              >
                <Text variant="bodyMedium" color={colors.amber400}>
                  {t('common.retry')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 80 }}>
              <Ionicons name="leaf-outline" size={56} color={colors.stone600} />
              <Text variant="bodyMedium" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
                {t('community.emptyTitle')}
              </Text>
              <Text variant="small" color={colors.stone500} style={{ marginTop: 4 }}>
                {t('community.emptyBody')}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              like.mutate(item.id);
            }}
            onBookmark={() => {
              Haptics.selectionAsync().catch(() => {});
              bookmark.mutate(item.id);
            }}
            onPress={() => router.push(`/post/${item.id}`)}
          />
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
      />

      <Pressable
        style={[styles.fab, { bottom: layout.tabBarHeight + insets.bottom + spacing['4'] }]}
        onPress={() => {
          if (canPost) {
            router.push('/post/new');
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setUpgradeOpen(true);
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={canPost ? 'Crear nueva publicación' : 'Publicar requiere plan Buen Camino'}
      >
        <Ionicons name={canPost ? 'add' : 'lock-closed'} size={canPost ? 28 : 22} color={colors.stone950} />
      </Pressable>

      <UpgradeBottomSheet
        visible={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredPlan="buen_camino"
        iconName="chatbubbles"
        title={t('community.shareCta')}
        bullets={t('community.bullets') as unknown as string[]}
      />
    </View>
  );
}

function PostCard({
  post,
  onLike,
  onBookmark,
  onPress,
}: {
  post: Post;
  onLike: () => void;
  onBookmark: () => void;
  onPress: () => void;
}) {
  return (
    <Card padding="4" elevation="raised">
      <Pressable onPress={onPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
          <Avatar source={post.user.avatar} name={post.user.name} size="md" />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" color={colors.cream}>
              {post.user.name} {post.user.nationality ? `·  ${flag(post.user.nationality)}` : ''}
            </Text>
            <Text variant="caption" color={colors.stone400}>
              @{post.user.username} · {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>

        <Text variant="body" color={colors.cream} style={{ marginTop: spacing['3'] }}>
          {post.content}
        </Text>

        {post.images.length > 0 ? (
          <Image
            source={{ uri: post.images[0]! }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : null}

        {post.locationName ? (
          <View style={styles.location}>
            <Ionicons name="location" size={14} color={colors.amber400} />
            <Text variant="caption" color={colors.amber400}>{post.locationName}</Text>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={onLike}
          hitSlop={8}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={post.likedByMe ? 'Quitar me gusta' : 'Me gusta'}
          accessibilityState={{ selected: post.likedByMe }}
        >
          <Ionicons
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={22}
            color={post.likedByMe ? colors.error : colors.stone300}
          />
          <Text variant="small" color={colors.stone300}>
            {post._count.likes}
          </Text>
        </Pressable>
        <Pressable
          onPress={onPress}
          hitSlop={8}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={`Ver ${post._count.comments} comentarios`}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.stone300} />
          <Text variant="small" color={colors.stone300}>
            {post._count.comments}
          </Text>
        </Pressable>
        <Pressable
          onPress={onBookmark}
          hitSlop={8}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={post.bookmarkedByMe ? 'Quitar de guardados' : 'Guardar publicación'}
          accessibilityState={{ selected: post.bookmarkedByMe }}
        >
          <Ionicons
            name={post.bookmarkedByMe ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={post.bookmarkedByMe ? colors.amber400 : colors.stone300}
          />
        </Pressable>
      </View>
    </Card>
  );
}

function flag(iso: string): string {
  if (!iso || iso.length !== 2) return '';
  const codePoints = iso
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['3'],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing['3'],
  },
  nearbyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.amber400,
    marginBottom: spacing['1'],
  },
  filterRow: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: '90%',
  },
  image: {
    width: '100%',
    height: 280,
    marginTop: spacing['3'],
    borderRadius: radius.md,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing['3'],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing['5'],
    marginTop: spacing['4'],
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderColor: colors.stone800,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  fab: {
    position: 'absolute',
    right: spacing['5'],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.amber400,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
});
