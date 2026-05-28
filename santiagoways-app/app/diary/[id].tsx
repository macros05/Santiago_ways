import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Button } from '@components/Button';
import { Skeleton } from '@components/Skeleton';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { useDiaryEntry, useDeleteDiaryEntry, useShareDiaryEntry } from '@hooks/useDiary';
import { useCredential } from '@hooks/useCredential';
import { useMyPilgrimage } from '@hooks/usePilgrimage';
import { generateCompostelaHTML } from '@lib/compostela';
import { toast } from '@stores/toast';
import { useAuth } from '@stores/auth';
import { t } from '@lib/i18n';

const PUBLIC_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api', '') ?? 'https://santiagoways.app';

export default function DiaryEntryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const q = useDiaryEntry(id ?? null);
  const myQ = useMyPilgrimage();
  const credentialQ = useCredential();
  const { user } = useAuth();
  const del = useDeleteDiaryEntry();
  const share = useShareDiaryEntry();
  const [busy, setBusy] = useState(false);

  const entry = q.data;

  const onShare = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      const r = await share.mutateAsync({ id: entry.id, on: true });
      const link = `${PUBLIC_BASE}/diary/${r.shareToken}`;
      await Share.share({ message: link, url: link });
      toast.success(t('diary.shared'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const onExportPdf = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      const publicUrl = entry.shareToken ? `${PUBLIC_BASE}/diary/${entry.shareToken}` : null;
      const html = generateCompostelaHTML({
        entry,
        user,
        stamps: credentialQ.data?.stamps ?? [],
        routeName: myQ.data?.route?.name ?? null,
        startDate: myQ.data?.startDate ?? null,
        publicUrl,
      });
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: t('diary.share.pdf.dialogTitle'),
          UTI: 'com.adobe.pdf',
        });
      } else {
        toast.info(t('diary.share.pdf.saved'));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('common.error');
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      await share.mutateAsync({ id: entry.id, on: false });
      toast.success(t('common.done'));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!entry) return;
    setBusy(true);
    try {
      await del.mutateAsync(entry.id);
      toast.success(t('diary.deleted'));
      router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header title={t('diary.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + 32,
        }}
      >
        {q.isLoading || !entry ? (
          <Skeleton height={300} borderRadius={radius.lg} />
        ) : (
          <>
            <Text variant="caption" color={colors.stone400}>
              {new Date(entry.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text variant="display" color={colors.cream} style={{ marginTop: spacing['1'] }}>
              {entry.title}
            </Text>
            {entry.mood ? (
              <Text variant="caption" color={colors.amber400} style={{ marginTop: spacing['1'] }}>
                {t(`diary.mood${capitalize(entry.mood)}`)}
              </Text>
            ) : null}

            {entry.images.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: spacing['5'] }}
              >
                <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
                  {entry.images.map((uri) => (
                    <Image key={uri} source={{ uri }} style={styles.photo} contentFit="cover" />
                  ))}
                </View>
              </ScrollView>
            ) : null}

            <Text variant="body" color={colors.stone200} style={{ marginTop: spacing['6'], lineHeight: 22 }}>
              {entry.body}
            </Text>

            <Card padding="4" style={{ marginTop: spacing['8'] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyBold" color={colors.cream}>
                    {entry.isPrivate ? t('diary.private') : t('diary.shareLink')}
                  </Text>
                  <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
                    {entry.isPrivate ? t('diary.shareSubtitle') : `${PUBLIC_BASE}/diary/${entry.shareToken}`}
                  </Text>
                </View>
                {entry.isPrivate ? (
                  <Pressable onPress={onShare} disabled={busy} hitSlop={12}>
                    <Ionicons name="share-outline" size={22} color={colors.amber400} />
                  </Pressable>
                ) : (
                  <Pressable onPress={onRevoke} disabled={busy} hitSlop={12}>
                    <Ionicons name="link-outline" size={22} color={colors.stone400} />
                  </Pressable>
                )}
              </View>
            </Card>

            <Button
              label={t('diary.share.pdf.cta')}
              variant="secondary"
              onPress={onExportPdf}
              loading={busy}
              iconLeft={<Ionicons name="document-text-outline" size={18} color={colors.cream} />}
              fullWidth
              style={{ marginTop: spacing['6'] }}
            />

            <Button
              label={t('common.delete')}
              variant="ghost"
              onPress={onDelete}
              fullWidth
              style={{ marginTop: spacing['4'] }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  photo: {
    width: 240,
    height: 240,
    borderRadius: radius.lg,
  },
});
