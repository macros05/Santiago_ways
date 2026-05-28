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
        <Header title="Salud en el Camino" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: spacing['5'], paddingTop: insets.top + layout.headerHeight + spacing['4'], gap: spacing['5'] }}>
          <Text variant="display" color={colors.cream}>
            Conecta tu salud al Camino
          </Text>
          <Text variant="body" color={colors.stone400}>
            La integración con Apple Health y Google Fit es exclusiva del plan Compostelero.
          </Text>
          <View style={{ position: 'relative', minHeight: 240 }}>
            <Card>
              <Text variant="bodyBold" color={colors.cream}>
                Pasos · Sueño · Frecuencia
              </Text>
              <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                Mejora tus recomendaciones de IA con datos reales de tu cuerpo.
              </Text>
            </Card>
            <LockedOverlay
              requiredPlan="compostelero"
              onPress={() => router.push('/plans')}
              message="Salud · Compostelero"
            />
          </View>
          <Button
            label="Ver plan Compostelero"
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
        <Header title="Salud en el Camino" onBack={() => router.back()} />
        <View style={{ padding: spacing['5'], paddingTop: insets.top + layout.headerHeight + spacing['4'] }}>
          <Text variant="bodyBold" color={colors.cream}>
            HealthKit/Health Connect no disponible
          </Text>
          <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
            Necesitas un build de desarrollo nativo (no Expo Go) con
            react-native-health (iOS) o react-native-health-connect (Android).
          </Text>
        </View>
      </View>
    );
  }

  if (perm.granted === false) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Header title="Salud en el Camino" onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ padding: spacing['5'], paddingTop: insets.top + layout.headerHeight + spacing['4'], gap: spacing['5'] }}>
          <View style={styles.heroIcon}>
            <Ionicons name="heart" size={36} color={colors.amber400} />
          </View>
          <Text variant="display" color={colors.cream} align="center">
            Conecta tu salud al Camino
          </Text>
          <Text variant="body" color={colors.stone400} align="center">
            Leemos pasos, frecuencia cardíaca, sueño y distancia para entender tu fatiga
            y mejorar las recomendaciones de IA. Tus datos no salen del dispositivo y del
            backend cifrado.
          </Text>
          <Button label="Autorizar acceso" fullWidth onPress={() => perm.request()} />
          <Button
            label="Ahora no"
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
      <Header title="Tu Salud en el Camino" onBack={() => router.back()} />
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
            label="Pasos"
            value={String(today?.steps ?? '—')}
            sub={`Meta 25.000`}
            progress={Math.min(1, (today?.steps ?? 0) / 25000)}
          />
          <StatCard
            icon="heart"
            label="FC media"
            value={today?.heartRateAvg ? `${today.heartRateAvg} bpm` : '—'}
            sub={today?.heartRateMax ? `Máx ${today.heartRateMax}` : 'Sin máx'}
          />
        </View>

        <View style={styles.todayRow}>
          <StatCard
            icon="flame"
            label="Calorías"
            value={today?.calories ? `${today.calories} kcal` : '—'}
          />
          <StatCard
            icon="moon"
            label="Sueño"
            value={today?.sleepHours ? `${today.sleepHours.toFixed(1)} h` : '—'}
          />
        </View>

        <Card>
          <Text variant="bodyBold" color={colors.cream}>
            Nivel de fatiga estimado
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
            Pasos últimos 7 días
          </Text>
          <BarChart items={history.data?.items ?? []} />
        </Card>

        <View style={styles.aiNote}>
          <Ionicons name="sparkles" size={16} color={colors.gold} />
          <Text variant="caption" color={colors.stone300} style={{ flex: 1 }}>
            Estos datos mejoran tus recomendaciones de IA en tiempo real.
          </Text>
        </View>

        <Button
          label="Revocar acceso a salud"
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
        Sin datos. Empieza a caminar 🚶
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
  return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][d.getDay()] ?? '';
}

function computeFatigue(
  today: ServerSnapshot | undefined,
  avgSteps: number,
): { label: string; color: string; advice: string } {
  if (!today) {
    return {
      label: 'Sin datos',
      color: colors.stone400,
      advice: 'Sincroniza datos para ver tu nivel de fatiga.',
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
      label: 'Fresco',
      color: colors.success,
      advice: 'Buen nivel de recuperación. Mantén tu ritmo.',
    };
  if (score <= 3)
    return {
      label: 'Moderado',
      color: colors.amber400,
      advice: 'Ritmo bien gestionado. Estira y bebe agua extra.',
    };
  return {
    label: 'Alto · Necesitas descanso',
    color: colors.error,
    advice: 'Considera una etapa más corta o un día de descanso mañana.',
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
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
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
    backgroundColor: 'rgba(255,215,0,0.06)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
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
