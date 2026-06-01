import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { Button } from '@components/Button';
import { Header } from '@components/Header';
import { Skeleton } from '@components/Skeleton';
import { colors, radius, spacing } from '@design/tokens';
import { useDiaryEntries, type DiaryEntry } from '@hooks/useDiary';
import { t } from '@lib/i18n';

export default function DiaryListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const q = useDiaryEntries();
  const data = useMemo(() => q.data ?? [], [q.data]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header title={t('diary.title')} onBack={() => router.back()} />
      <View style={{ flex: 1, paddingTop: insets.top + 56 }}>
        {q.isLoading ? (
          <View style={{ paddingHorizontal: spacing['5'], gap: spacing['3'] }}>
            <Skeleton height={120} borderRadius={radius.lg} />
            <Skeleton height={120} borderRadius={radius.lg} />
            <Skeleton height={120} borderRadius={radius.lg} />
          </View>
        ) : data.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={32} color={colors.amber400} />
            </View>
            <Text variant="h2" color={colors.cream} align="center" style={{ marginTop: spacing['4'] }}>
              {t('diary.empty')}
            </Text>
            <Button
              label={t('diary.newEntry')}
              onPress={() => router.push('/diary/new')}
              style={{ marginTop: spacing['6'] }}
            />
          </View>
        ) : (
          <FlashList<DiaryEntry>
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: spacing['5'],
              paddingBottom: insets.bottom + 96,
              paddingTop: spacing['3'],
            }}
            ItemSeparatorComponent={() => <View style={{ height: spacing['3'] }} />}
            renderItem={({ item }) => <EntryCard entry={item} onPress={() => router.push(`/diary/${item.id}`)} />}
          />
        )}
      </View>

      <Pressable
        onPress={() => router.push('/diary/new')}
        style={[styles.fab, { bottom: insets.bottom + spacing['5'] }]}
        accessibilityRole="button"
        accessibilityLabel={t('diary.newEntry')}
      >
        <Ionicons name="add" size={28} color={colors.stone950} />
      </Pressable>
    </View>
  );
}

function EntryCard({ entry, onPress }: { entry: DiaryEntry; onPress: () => void }) {
  const date = new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const cover = entry.images[0];
  return (
    <Pressable onPress={onPress}>
      <Card padding="4">
        <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
          {cover ? (
            <Image
              source={{ uri: cover }}
              style={{ width: 64, height: 64, borderRadius: radius.md }}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="leaf-outline" size={20} color={colors.amber400} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="caption" color={colors.stone400}>{date}</Text>
              {!entry.isPrivate ? (
                <Ionicons name="link-outline" size={14} color={colors.amber400} />
              ) : (
                <Ionicons name="lock-closed" size={12} color={colors.stone500} />
              )}
            </View>
            <Text variant="bodyBold" color={colors.cream} numberOfLines={1}>
              {entry.title}
            </Text>
            <Text variant="small" color={colors.stone300} numberOfLines={2} style={{ marginTop: 2 }}>
              {entry.body}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingHorizontal: spacing['8'],
    paddingTop: spacing['16'],
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(78,157,99,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: 'rgba(78,157,99,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
