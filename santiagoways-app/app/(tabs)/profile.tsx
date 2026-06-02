import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@design/text';
import { Avatar } from '@components/Avatar';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { colors, gradients, layout, radius, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import { useSubscription } from '@stores/subscription';
import { useSubscriptionStatus } from '@hooks/useSubscription';
import { toast } from '@stores/toast';
import { useHealthPermission } from '@hooks/useHealth';
import { useStats } from '@hooks/useStats';
import { evaluate } from '@lib/achievements';
import { t } from '@lib/i18n';

// Buen Camino / Compostelero are brand names; only the free tier is localized.
function planName(plan: string): string {
  if (plan === 'buen_camino') return 'Buen Camino';
  if (plan === 'compostelero') return 'Compostelero';
  return t('plans.tierFreeTitle');
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const { plan, status, currentPeriodEnd, cancelAtPeriodEnd } = useSubscriptionStatus();
  const restore = useSubscription((s) => s.restore);
  const health = useHealthPermission();
  const stats = useStats();
  const achievements = evaluate(stats);

  const isCompostelero = plan === 'compostelero';
  const isBuenCamino = plan === 'buen_camino';
  const isPaid = isBuenCamino || isCompostelero;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ink }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing['4'],
        paddingBottom: layout.tabBarHeight + insets.bottom + spacing['8'],
      }}
    >
      <View style={{ paddingHorizontal: spacing['5'] }}>
        <View style={styles.header}>
          <Avatar source={user?.avatar} name={user?.name} size="xl" />
          <Text variant="h1" color={colors.cream} style={{ marginTop: spacing['4'] }}>
            {user?.name ?? t('profile.defaultName')}
          </Text>
          <Text variant="small" color={colors.stone400}>@{user?.username}</Text>
          <View style={{ marginTop: spacing['3'], flexDirection: 'row', gap: spacing['2'] }}>
            {user?.nationality ? (
              <Badge
                label={`${flag(user.nationality)} ${user.nationality.toUpperCase()}`}
                variant="neutral"
              />
            ) : null}
            {isCompostelero ? (
              <View style={[styles.planBadge, { borderColor: colors.gold, backgroundColor: colors.goldTintSoft }]}>
                <Text variant="caption" color={colors.gold}>🐚 Compostelero</Text>
              </View>
            ) : isBuenCamino ? (
              <View style={[styles.planBadge, { borderColor: colors.amber400, backgroundColor: colors.amberTintSoft }]}>
                <Text variant="caption" color={colors.amber400}>⭐ Buen Camino</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value={(user?.totalKm ?? 0).toFixed(0)} label={t('profile.statKm')} />
          <Stat value={String(user?.timesCompleted ?? 0)} label={t('profile.statCompleted')} />
          <Stat value={String(unlockedCount)} label={t('profile.statAchievements')} />
        </View>

        <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          {t('profile.mySubscription')}
        </Text>
        <Pressable onPress={() => router.push('/plans')} accessibilityRole="button" accessibilityLabel={t('profile.mySubscription')}>
          <Card style={{ marginTop: spacing['3'], overflow: 'hidden' }}>
            {isCompostelero ? (
              <LinearGradient
                colors={gradients.premiumCard}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
              <View
                style={[
                  styles.planIcon,
                  {
                    backgroundColor: isCompostelero
                      ? colors.goldTintMuted
                      : isBuenCamino
                        ? colors.amberTintMuted
                        : colors.stone800,
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>
                  {isCompostelero ? '🐚' : isBuenCamino ? '⭐' : '🚶'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold" color={colors.cream}>
                  {planName(plan)}
                </Text>
                <Text variant="caption" color={colors.stone400}>
                  {isPaid && currentPeriodEnd
                    ? cancelAtPeriodEnd
                      ? t('profile.endsOn', { date: currentPeriodEnd.toLocaleDateString() })
                      : t('profile.renewsOn', { date: currentPeriodEnd.toLocaleDateString() })
                    : status === 'active'
                      ? t('profile.planActive')
                      : t('profile.planFree')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.stone400} />
            </View>
          </Card>
        </Pressable>
        <Pressable
          onPress={() => restore()}
          style={{ marginTop: spacing['2'], paddingVertical: spacing['2'] }}
          accessibilityRole="button"
          accessibilityLabel={t('profile.restorePurchase')}
        >
          <Text variant="caption" color={colors.amber400} align="center">
            {t('profile.restorePurchase')}
          </Text>
        </Pressable>

        {/* Compostelero quick links */}
        {isCompostelero ? (
          <View style={{ marginTop: spacing['6'], gap: spacing['3'] }}>
            <Pressable onPress={() => router.push('/ai-guide')} accessibilityRole="button" accessibilityLabel={t('profile.aiGuide')}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <View style={[styles.qIcon, { backgroundColor: colors.goldTintSoft }]}>
                  <Ionicons name="sparkles" size={18} color={colors.gold} />
                </View>
                <Text variant="bodyMedium" color={colors.cream} style={{ flex: 1 }}>
                  {t('profile.aiGuide')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.stone400} />
              </Card>
            </Pressable>
            <Pressable onPress={() => router.push('/health-dashboard')} accessibilityRole="button" accessibilityLabel={t('profile.health')}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <View style={[styles.qIcon, { backgroundColor: colors.amberTintSoft }]}>
                  <Ionicons name="heart" size={18} color={colors.amber400} />
                </View>
                <Text variant="bodyMedium" color={colors.cream} style={{ flex: 1 }}>
                  {t('profile.health')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.stone400} />
              </Card>
            </Pressable>
            <Pressable onPress={() => router.push('/chat')} accessibilityRole="button" accessibilityLabel={t('profile.compChat')}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <View style={[styles.qIcon, { backgroundColor: colors.goldTintSoft }]}>
                  <Ionicons name="chatbubbles" size={18} color={colors.gold} />
                </View>
                <Text variant="bodyMedium" color={colors.cream} style={{ flex: 1 }}>
                  {t('profile.compChat')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.stone400} />
              </Card>
            </Pressable>
          </View>
        ) : null}

        <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          {t('profile.achievementsHeading')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievements}>
          {achievements.map((a) => (
            <View key={a.id} style={styles.ach}>
              <View
                style={[
                  styles.achCircle,
                  {
                    backgroundColor: a.unlocked ? colors.amberTintSoft : colors.stone800,
                    borderColor: a.unlocked ? colors.amber400 : colors.stone700,
                  },
                ]}
              >
                <Ionicons
                  name={a.icon}
                  size={26}
                  color={a.unlocked ? colors.amber400 : colors.stone600}
                />
              </View>
              <Text
                variant="caption"
                color={a.unlocked ? colors.cream : colors.stone500}
                style={{ marginTop: spacing['2'] }}
              >
                {t(`profile.achievements.${a.id}`)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          {t('profile.subscriptionHeading')}
        </Text>
        <Card style={{ marginTop: spacing['3'], padding: 0 }}>
          <SettingsRow
            icon="diamond-outline"
            label={isPaid ? t('profile.changePlan') : t('profile.viewPlans')}
            onPress={() => router.push('/plans')}
          />
          {isPaid ? (
            <SettingsRow
              icon="close-circle-outline"
              label={t('profile.cancelSub')}
              onPress={() => toast.info(t('profile.cancelHint'))}
            />
          ) : null}
          <SettingsRow
            icon="refresh-outline"
            label={t('profile.restorePurchaseShort')}
            onPress={() => restore()}
            last
          />
        </Card>

        {isCompostelero ? (
          <>
            <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
              {t('profile.healthHeading')}
            </Text>
            <Card style={{ marginTop: spacing['3'], padding: 0 }}>
              <SettingsRow
                icon="heart-outline"
                label={health.granted ? t('profile.healthConnected') : t('profile.connectHealth')}
                onPress={() => (health.granted ? router.push('/health-dashboard') : health.request())}
              />
              <SettingsRow
                icon="bar-chart-outline"
                label={t('profile.viewHealthDashboard')}
                onPress={() => router.push('/health-dashboard')}
              />
              {health.granted ? (
                <SettingsRow
                  icon="trash-outline"
                  label={t('profile.revokeAccess')}
                  onPress={() => health.revoke()}
                  last
                />
              ) : null}
            </Card>
          </>
        ) : null}

        <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          {t('profile.settingsHeading')}
        </Text>
        <Card style={{ marginTop: spacing['3'], padding: 0 }}>
          <SettingsRow
            icon="stats-chart-outline"
            label={t('profile.stats.rowLabel')}
            onPress={() => router.push('/profile/stats')}
          />
          <SettingsRow icon="person-outline" label={t('profile.editProfile')} onPress={() => router.push('/settings/profile')} />
          <SettingsRow icon="lock-closed-outline" label={t('profile.privacy')} onPress={() => router.push('/settings/privacy')} />
          <SettingsRow icon="notifications-outline" label={t('profile.notifications')} onPress={() => router.push('/settings/notifications')} />
          <SettingsRow icon="map-outline" label={t('profile.mapUnits')} onPress={() => router.push('/settings/map')} />
          <SettingsRow icon="cloud-download-outline" label={t('profile.offlineDownloads')} onPress={() => router.push('/settings/downloads')} />
          <SettingsRow icon="language-outline" label={t('profile.language')} onPress={() => router.push('/settings/language')} last />
        </Card>

        <Button
          label={t('profile.signOut')}
          variant="ghost"
          fullWidth
          style={{ marginTop: spacing['8'] }}
          onPress={async () => {
            await signOut();
            router.replace('/(onboarding)/welcome');
          }}
        />
      </View>
    </ScrollView>
  );
}

function flag(iso: string): string {
  if (!iso || iso.length !== 2) return '🌍';
  const codePoints = iso
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text variant="h1" color={colors.cream}>
        {value}
      </Text>
      <Text variant="caption" color={colors.stone400}>
        {label}
      </Text>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !last && styles.rowBorder]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={colors.stone300} />
      <Text variant="body" color={colors.cream} style={{ flex: 1, marginLeft: spacing['3'] }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.stone500} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: spacing['4'],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing['8'],
    paddingVertical: spacing['4'],
    backgroundColor: colors.stone900,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stone700,
  },
  achievements: {
    gap: spacing['4'],
    paddingVertical: spacing['4'],
  },
  ach: {
    alignItems: 'center',
    width: 80,
  },
  achCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['4'],
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderColor: colors.stone800,
  },
  planBadge: {
    paddingHorizontal: spacing['3'],
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
