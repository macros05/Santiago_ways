import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { Header } from '@components/Header';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { useStats } from '@hooks/useStats';
import { evaluate } from '@lib/achievements';
import { t } from '@lib/i18n';
import { toast } from '@stores/toast';

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  accent?: string;
};

function StatCard({ icon, value, label, accent = colors.amber400 }: StatCardProps) {
  return (
    <Card padding="4" style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <Text variant="h1" color={colors.cream}>
        {value}
      </Text>
      <Text variant="caption" color={colors.stone400}>
        {label}
      </Text>
    </Card>
  );
}

export default function ProfileStatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const stats = useStats();
  const captureViewRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const achievements = evaluate({
    totalKm: stats.totalKm,
    stagesCompleted: stats.stagesCompleted,
    photos: stats.photos,
    diaryEntries: stats.diaryEntries,
    streak: stats.streak,
  });

  const onShare = async () => {
    if (!captureViewRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(captureViewRef, { format: 'png', quality: 0.9 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('profile.stats.shareDialog'),
        });
      } else {
        toast.info(t('profile.stats.shareSaved'));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('common.error');
      toast.error(msg);
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Header title={t('profile.stats.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + spacing['8'],
        }}
      >
        <View ref={captureViewRef} collapsable={false} style={styles.captureZone}>
          <Text variant="display" color={colors.cream}>
            {t('profile.stats.heading')}
          </Text>
          <Text variant="caption" color={colors.stone400} style={{ marginTop: spacing['1'] }}>
            {t('profile.stats.subtitle')}
          </Text>

          <View style={styles.grid}>
            <StatCard
              icon="walk"
              value={`${stats.totalKm.toFixed(0)}`}
              label={t('profile.stats.km')}
            />
            <StatCard
              icon="flame"
              value={String(stats.streak)}
              label={t('profile.stats.streak')}
              accent={colors.error}
            />
            <StatCard
              icon="checkmark-circle"
              value={String(stats.stagesCompleted)}
              label={t('profile.stats.stages')}
            />
            <StatCard
              icon="camera"
              value={String(stats.photos)}
              label={t('profile.stats.photos')}
            />
            <StatCard
              icon="trending-up"
              value={`${stats.totalElevation.toFixed(0)} m`}
              label={t('profile.stats.elevation')}
            />
            <StatCard
              icon="book"
              value={String(stats.diaryEntries)}
              label={t('profile.stats.diary')}
            />
          </View>

          <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
            {t('profile.stats.achievementsTitle')}
          </Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((a) => (
              <Card key={a.id} padding="3" style={styles.achievement}>
                <View
                  style={[
                    styles.achCircle,
                    {
                      backgroundColor: a.unlocked
                        ? colors.amberTintMuted
                        : colors.stone800,
                      borderColor: a.unlocked ? colors.amber400 : colors.stone700,
                    },
                  ]}
                >
                  <Ionicons
                    name={a.icon}
                    size={22}
                    color={a.unlocked ? colors.amber400 : colors.stone600}
                  />
                </View>
                <Text
                  variant="bodyBold"
                  color={a.unlocked ? colors.cream : colors.stone500}
                  style={{ marginTop: spacing['2'], textAlign: 'center' }}
                >
                  {a.name}
                </Text>
                <Text
                  variant="caption"
                  color={a.unlocked ? colors.stone300 : colors.stone600}
                  style={{ textAlign: 'center', marginTop: 2 }}
                  numberOfLines={2}
                >
                  {a.description}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        <Button
          label={t('profile.stats.shareCta')}
          variant="secondary"
          onPress={onShare}
          loading={sharing}
          iconLeft={<Ionicons name="share-social-outline" size={18} color={colors.cream} />}
          fullWidth
          style={{ marginTop: spacing['6'] }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  captureZone: {
    backgroundColor: colors.stone950,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    marginTop: spacing['6'],
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'flex-start',
    gap: spacing['1'],
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    marginTop: spacing['4'],
  },
  achievement: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
  },
  achCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
