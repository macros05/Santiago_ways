import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { LockedOverlay } from '@components/LockedOverlay';
import { colors, layout, radius, spacing } from '@design/tokens';
import { useIsCompostelero } from '@hooks/useSubscription';
import {
  syncTodayIfPermitted,
  useHealthHistory,
  useHealthPermission,
  type ServerSnapshot,
} from '@hooks/useHealth';
import { t } from '@lib/i18n';

export default function HealthDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isCompostelero = useIsCompostelero();
  const history = useHealthHistory(7);
  const perm = useHealthPermission();

  useEffect(() => {
    if (perm.granted) syncTodayIfPermitted();
  }, [perm.granted]);

  if (!isCompostelero) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title={t('health.title')} onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: spacing['5'], paddingTop: insets.top + layout.headerHeight + spacing['4'], gap: spacing['5'] }}>
          <Text variant="display" color={colors.cream}>
            {t('health.connectTitle')}
          </Text>
          <Text variant="body" color={colors.stone400}>
            {t('health.compostExclusive')}
          </Text>
          <View style={{ position: 'relative', minHeight: 240 }}>
            <Card>
              <Text variant="bodyBold" color={colors.cream}>
                {t('health.stepsSleepHr')}
              </Text>
              <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                {t('health.improveAI')}
              </Text>
            </Card>
            <LockedOverlay
              requiredPlan="compostelero"
              onPress={() => router.push('/plans')}
              message={t('health.lockedOverlay')}
            />
          </View>
          <Button
            label={t('health.viewCompostelero')}
            onPress={() => router.push('/plans')}
            style={{ backgroundColor: colors.gold }}
            fullWidth
          />
        </ScrollView>
      </View>
    );
  }

  if (!perm.available) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title={t('health.title')} onBack={() => router.back()} />
        <View style={{ padding: spacing['5'], paddingTop: insets.top + layout.headerHeight + spacing['4'] }}>
          <Text variant="bodyBold" color={colors.cream}>
            {t('health.unavailableTitle')}
          </Text>
          <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
            {t('health.unavailableBody')}
          </Text>
        </View>
      </View>
    );
  }

  if (perm.granted === false) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title={t('health.title')} onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: spacing['5'], paddingTop: insets.top + layout.headerHeight + spacing['4'], gap: spacing['5'] }}>
          <View style={styles.heroIcon}>
            <Ionicons name="heart" size={36} color={colors.amber400} />
          </View>
          <Text variant="display" color={colors.cream} align="center">
            {t('health.connectTitle')}
          </Text>
          <Text variant="body" color={colors.stone400} align="center">
            {t('health.connectBody')}
          </Text>
          <Button label={t('health.authorize')} fullWidth onPress={() => perm.request()} />
          <Button
            label={t('health.notNow')}
            variant="ghost"
            fullWidth
            onPress={() => router.back()}
          />
        </ScrollView>
      </View>
    );
  }

  const items = history.data?.items ?? [];
  const today = items.at(-1);
  const avgSteps = items.length
    ? Math.round(items.reduce((s, x) => s + (x.steps ?? 0), 0) / items.length)
    : 0;
  const fatigue = computeFatigue(today, avgSteps);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header title={t('health.titleYours')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          padding: spacing['5'],
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['5'],
        }}
      >
        <View style={styles.todayRow}>
          <StatCard
            icon="walk"
            label={t('health.steps')}
            value={String(today?.steps ?? '—')}
            sub={t('health.goal25k')}
            progress={Math.min(1, (today?.steps ?? 0) / 25000)}
          />
          <StatCard
            icon="heart"
            label={t('health.hrAvg')}
            value={today?.heartRateAvg ? `${today.heartRateAvg} bpm` : '—'}
            sub={today?.heartRateMax ? t('health.max', { v: today.heartRateMax }) : t('health.noMax')}
          />
        </View>

        <View style={styles.todayRow}>
          <StatCard
            icon="flame"
            label={t('health.calories')}
            value={today?.calories ? `${today.calories} kcal` : '—'}
          />
          <StatCard
            icon="moon"
            label={t('health.sleep')}
            value={today?.sleepHours ? `${today.sleepHours.toFixed(1)} h` : '—'}
          />
        </View>

        <Card>
          <Text variant="bodyBold" color={colors.cream}>
            {t('health.fatigueTitle')}
          </Text>
          <Text
            variant="display"
            color={fatigue.color}
            style={{ marginTop: spacing['2'] }}
          >
            {fatigue.label}
          </Text>
          <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
            {fatigue.advice}
          </Text>
        </Card>

        <Card>
          <Text variant="bodyBold" color={colors.cream} style={{ marginBottom: spacing['3'] }}>
            {t('health.steps7d')}
          </Text>
          <BarChart items={history.data?.items ?? []} />
        </Card>

        <View style={styles.aiNote}>
          <Ionicons name="sparkles" size={16} color={colors.gold} />
          <Text variant="caption" color={colors.stone300} style={{ flex: 1 }}>
            {t('health.aiNote')}
          </Text>
        </View>

        <Button
          label={t('health.revoke')}
          variant="ghost"
          fullWidth
          onPress={() => perm.revoke()}
        />
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  progress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub?: string;
  progress?: number;
}) {
  return (
    <Card style={{ flex: 1, gap: 4 }}>
      <Ionicons name={icon} size={18} color={colors.amber400} />
      <Text variant="caption" color={colors.stone400}>
        {label}
      </Text>
      <Text variant="h2" color={colors.cream}>
        {value}
      </Text>
      {sub ? (
        <Text variant="caption" color={colors.stone500}>
          {sub}
        </Text>
      ) : null}
      {progress != null ? (
        <View style={styles.bar}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
      ) : null}
    </Card>
  );
}

function BarChart({ items }: { items: ServerSnapshot[] }) {
  if (items.length === 0) {
    return (
      <Text variant="small" color={colors.stone500}>
        {t('health.noData')}
      </Text>
    );
  }
  const max = Math.max(...items.map((i) => i.steps ?? 0), 1);
  const todayKey = new Date().toISOString().slice(0, 10);
  return (
    <View style={styles.chart}>
      {items.map((it) => {
        const isToday = it.date.slice(0, 10) === todayKey;
        const h = ((it.steps ?? 0) / max) * 80;
        return (
          <View key={it.id} style={styles.barCol}>
            <View
              style={[
                styles.chartBar,
                {
                  height: Math.max(4, h),
                  backgroundColor: isToday ? colors.amber400 : colors.amber600,
                  opacity: isToday ? 1 : 0.5,
                },
              ]}
            />
            <Text variant="caption" color={colors.stone500}>
              {dayLabel(it.date)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const labels = t('health.dayLabels') as unknown as string[];
  return labels[d.getDay()] ?? '';
}

function computeFatigue(
  today: ServerSnapshot | undefined,
  avgSteps: number,
): { label: string; color: string; advice: string } {
  if (!today) {
    return {
      label: t('health.fatigue.noData'),
      color: colors.stone400,
      advice: t('health.fatigue.noDataAdvice'),
    };
  }
  const sleep = today.sleepHours ?? 7;
  const hr = today.heartRateAvg ?? 70;
  const steps = today.steps ?? 0;
  let score = 0;
  if (sleep < 6) score += 2;
  else if (sleep < 7) score += 1;
  if (hr > 90) score += 2;
  else if (hr > 80) score += 1;
  if (steps > avgSteps * 1.4) score += 2;
  else if (steps > avgSteps * 1.15) score += 1;

  if (score <= 1)
    return {
      label: t('health.fatigue.fresh'),
      color: colors.success,
      advice: t('health.fatigue.freshAdvice'),
    };
  if (score <= 3)
    return {
      label: t('health.fatigue.moderate'),
      color: colors.amber400,
      advice: t('health.fatigue.moderateAdvice'),
    };
  return {
    label: t('health.fatigue.high'),
    color: colors.error,
    advice: t('health.fatigue.highAdvice'),
  };
}

const styles = StyleSheet.create({
  heroIcon: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amberTintSoft,
    borderWidth: 1,
    borderColor: colors.amberTintStrong,
  },
  todayRow: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  bar: {
    height: 6,
    backgroundColor: colors.stone800,
    borderRadius: radius.full,
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.amber400,
  },
  aiNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    backgroundColor: colors.goldTintSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldTintMuted,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 110,
    gap: spacing['2'],
  },
  barCol: {
    alignItems: 'center',
    gap: 4,
  },
  chartBar: {
    width: 14,
    borderRadius: radius.sm,
  },
});
