import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@design/text';
import { Header } from '@components/Header';
import { Avatar } from '@components/Avatar';
import { Skeleton } from '@components/Skeleton';
import { colors, layout, radius, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import {
  useChatMessages,
  useChatRealtime,
  useSendChatMessage,
  type ChatMessage,
} from '@hooks/useChat';

export default function ChatRoomScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useAuth((s) => s.user);
  const [text, setText] = useState('');
  const messages = useChatMessages(id ?? null);
  const send = useSendChatMessage(id ?? null);
  const { connected } = useChatRealtime(id ?? null);

  // Server returns newest-first; render oldest-first (top to bottom). Memoize
  // so the array isn't reallocated on every render — chat re-renders on every
  // keystroke in the composer.
  const ordered = useMemo<ChatMessage[]>(() => {
    const items = messages.data?.pages.flatMap((p) => p.items) ?? [];
    return items.slice().reverse();
  }, [messages.data]);
  const scrollRef = useRef<ScrollView>(null);

  // Only auto-scroll to the bottom when a NEW message lands at the tail (initial
  // load or an incoming/sent message). Loading older history prepends messages —
  // the tail id is unchanged — so we must NOT yank the view down, or pagination
  // becomes unusable.
  const lastIdRef = useRef<string | null>(null);
  useEffect(() => {
    const lastId = ordered.length ? ordered[ordered.length - 1]!.id : null;
    if (lastId !== lastIdRef.current) {
      lastIdRef.current = lastId;
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }, [ordered]);

  const loadOlder = useCallback(() => {
    if (messages.hasNextPage && !messages.isFetchingNextPage) messages.fetchNextPage();
  }, [messages]);

  const submit = async () => {
    const content = text.trim();
    if (!content) return;
    setText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await send.mutateAsync(content);
    } catch {
      // restore the text on failure
      setText(content);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title="Compostelero"
        onBack={() => router.back()}
        rightAction={
          <View style={[styles.statusDot, { backgroundColor: connected ? colors.success : colors.stone500 }]} />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, paddingTop: insets.top + layout.headerHeight }}
        keyboardVerticalOffset={insets.top + layout.headerHeight}
      >
        {messages.isLoading ? (
          <View style={{ padding: spacing['5'], gap: spacing['3'] }}>
            <Skeleton height={48} />
            <Skeleton height={48} width="60%" />
            <Skeleton height={48} />
          </View>
        ) : messages.isError ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['8'] }}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.stone600} />
            <Text variant="bodyMedium" color={colors.stone300} style={{ marginTop: spacing['3'], textAlign: 'center' }}>
              No pudimos cargar el chat.
            </Text>
            <Pressable
              onPress={() => messages.refetch()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Reintentar carga del chat"
              style={{ marginTop: spacing['4'] }}
            >
              <Text variant="bodyMedium" color={colors.amber400}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: spacing['4'], gap: spacing['2'] }}
            onScroll={(e) => {
              if (e.nativeEvent.contentOffset.y < 60) loadOlder();
            }}
            scrollEventThrottle={400}
          >
            {ordered.length === 0 ? (
              <View style={{ alignItems: 'center', padding: spacing['10'] }}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.stone600} />
                <Text variant="small" color={colors.stone500} style={{ marginTop: spacing['3'] }}>
                  Sé el primer Compostelero en escribir.
                </Text>
              </View>
            ) : (
              ordered.map((item) => (
                <Bubble key={item.id} message={item} mine={item.userId === me?.id} />
              ))
            )}
          </ScrollView>
        )}

        <View
          style={[
            styles.inputBar,
            { paddingBottom: insets.bottom + spacing['2'] },
          ]}
        >
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje…"
            placeholderTextColor={colors.stone500}
            multiline
            maxLength={1000}
          />
          <Pressable
            onPress={submit}
            disabled={!text.trim() || send.isPending}
            style={[
              styles.sendBtn,
              { backgroundColor: text.trim() ? colors.amber400 : colors.stone800 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensaje"
            accessibilityState={{ disabled: !text.trim() || send.isPending }}
          >
            <Ionicons
              name="send"
              size={18}
              color={text.trim() ? colors.stone950 : colors.stone500}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
      {!mine ? (
        <Avatar source={message.user.avatar} name={message.user.name} size="sm" />
      ) : null}
      <View
        style={[
          styles.bubble,
          mine ? styles.bubbleMine : styles.bubbleOther,
        ]}
      >
        {!mine ? (
          <Text variant="caption" color={colors.amber400}>
            {message.user.name} 🐚
          </Text>
        ) : null}
        <Text variant="body" color={mine ? colors.stone950 : colors.cream}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing['4'],
  },
  row: {
    flexDirection: 'row',
    gap: spacing['2'],
    alignItems: 'flex-end',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    gap: spacing['1'],
  },
  bubbleMine: {
    backgroundColor: colors.amber400,
    borderBottomRightRadius: radius.xs,
  },
  bubbleOther: {
    backgroundColor: colors.stone800,
    borderBottomLeftRadius: radius.xs,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['2'],
    gap: spacing['2'],
    borderTopWidth: 1,
    borderColor: colors.stone800,
    backgroundColor: colors.ink,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderRadius: radius.full,
    backgroundColor: colors.stone900,
    borderWidth: 1,
    borderColor: colors.stone700,
    color: colors.cream,
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
