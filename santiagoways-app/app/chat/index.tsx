import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { Header } from '@components/Header';
import { Skeleton } from '@components/Skeleton';
import { Button } from '@components/Button';
import { LockedOverlay } from '@components/LockedOverlay';
import { colors, layout, radius, spacing } from '@design/tokens';
import { useChatRooms } from '@hooks/useChat';
import { useIsCompostelero } from '@hooks/useSubscription';
import { timeAgo } from '@lib/format';
import { t } from '@lib/i18n';

type SamplePreview = { name: string; last: string };

export default function ChatRoomsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isCompostelero = useIsCompostelero();
  const roomsQ = useChatRooms();

  if (!isCompostelero) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title={t('profile.compChat')} onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={{
            padding: spacing['5'],
            paddingTop: insets.top + layout.headerHeight + spacing['4'],
            paddingBottom: insets.bottom + spacing['10'],
            gap: spacing['4'],
          }}
        >
          <Text variant="display" color={colors.cream}>
            {t('chat.lockedTitle')}
          </Text>
          <Text variant="body" color={colors.stone400}>
            {t('chat.lockedSubtitle')}
          </Text>

          <View style={{ position: 'relative', gap: spacing['3'] }}>
            {(t('chat.sample') as unknown as SamplePreview[]).map((r, i) => (
              <Card key={i} style={{ flexDirection: 'row', gap: spacing['3'] }}>
                <View style={styles.avatar}>
                  <Ionicons name="chatbubbles" size={18} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" color={colors.cream} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text variant="caption" color={colors.stone400} numberOfLines={1}>
                    {r.last}
                  </Text>
                </View>
              </Card>
            ))}
            <LockedOverlay
              requiredPlan="compostelero"
              message={t('chat.lockedOverlay')}
              onPress={() => router.push('/plans')}
            />
          </View>

          <Button
            label={t('chat.viewCompostelero')}
            fullWidth
            onPress={() => router.push('/plans')}
            style={{ backgroundColor: colors.gold }}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={t('chat.roomsTitle')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: spacing['5'],
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['3'],
        }}
      >
        {roomsQ.isLoading ? (
          <>
            <Skeleton height={72} borderRadius={radius.lg} />
            <Skeleton height={72} borderRadius={radius.lg} />
            <Skeleton height={72} borderRadius={radius.lg} />
          </>
        ) : roomsQ.data?.length ? (
          roomsQ.data.map((room) => (
            <Pressable key={room.id} onPress={() => router.push(`/chat/${room.id}`)}>
              <Card style={{ flexDirection: 'row', gap: spacing['3'] }}>
                <View style={styles.avatar}>
                  <Ionicons name="chatbubbles" size={18} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" color={colors.cream} numberOfLines={1}>
                    {room.name}
                  </Text>
                  <Text variant="caption" color={colors.stone400} numberOfLines={1}>
                    {room.lastMessage
                      ? `${room.lastMessage.user.name.split(' ')[0]}: ${room.lastMessage.content}`
                      : t('chat.noMessages')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {room.lastMessage ? (
                    <Text variant="caption" color={colors.stone500}>
                      {timeAgo(room.lastMessage.createdAt)}
                    </Text>
                  ) : null}
                </View>
              </Card>
            </Pressable>
          ))
        ) : (
          <View style={{ alignItems: 'center', paddingTop: spacing['10'] }}>
            <Ionicons name="leaf-outline" size={56} color={colors.stone600} />
            <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
              {t('chat.noRooms')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.goldTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldTintStrong,
  },
});
