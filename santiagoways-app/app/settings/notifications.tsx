import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { Button } from '@components/Button';
import { colors, layout, spacing } from '@design/tokens';
import { usePrefs } from '@stores/prefs';
import {
  scheduleDepartureReminder,
  scheduleWeeklyRecap,
  cancelAllScheduled,
} from '@lib/notifications';
import { toast } from '@stores/toast';
import { t } from '@lib/i18n';

type Status = 'unknown' | 'granted' | 'denied' | 'undetermined';

export default function NotificationsSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pushEnabled = usePrefs((s) => s.pushEnabled);
  const setPushEnabled = usePrefs((s) => s.setPushEnabled);

  const [status, setStatus] = useState<Status>('unknown');

  const refresh = async () => {
    const perm = await Notifications.getPermissionsAsync();
    setStatus(perm.status as Status);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onToggle = async (next: boolean) => {
    if (next) {
      const perm = await Notifications.requestPermissionsAsync();
      setStatus(perm.status as Status);
      if (perm.status !== 'granted') return;
    }
    await setPushEnabled(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Header title="Notificaciones" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['4'],
        }}
      >
        <Card style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" color={colors.cream}>Recibir notificaciones</Text>
            <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
              Likes, comentarios, mensajes y avisos del Camino.
            </Text>
          </View>
          <Switch
            value={pushEnabled && status === 'granted'}
            onValueChange={onToggle}
            trackColor={{ false: colors.stone700, true: colors.amber500 }}
            thumbColor={colors.cream}
          />
        </Card>

        {/* Smart notification slots — opt-in, individual schedules. */}
        {pushEnabled && status === 'granted' ? (
          <View style={{ gap: spacing['3'] }}>
            <Text variant="caption" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
              Avisos inteligentes
            </Text>
            <Pressable
              onPress={async () => {
                const r = await scheduleDepartureReminder({ hour: 6, minute: 30 });
                toast.success(r ? 'Recordatorio diario a las 6:30 ✓' : 'Permiso necesario.');
              }}
            >
              <Card style={styles.smartRow}>
                <Ionicons name="alarm-outline" size={20} color={colors.amber400} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" color={colors.cream}>
                    {t('notifications.departureReminder')}
                  </Text>
                  <Text variant="caption" color={colors.stone400}>06:30 todos los días</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.stone500} />
              </Card>
            </Pressable>
            <Pressable
              onPress={async () => {
                const r = await scheduleWeeklyRecap();
                toast.success(r ? 'Resumen semanal activado ✓' : 'Permiso necesario.');
              }}
            >
              <Card style={styles.smartRow}>
                <Ionicons name="bar-chart-outline" size={20} color={colors.amber400} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" color={colors.cream}>
                    {t('notifications.weeklyRecap')}
                  </Text>
                  <Text variant="caption" color={colors.stone400}>Domingos a las 19:00</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.stone500} />
              </Card>
            </Pressable>
            <Pressable
              onPress={async () => {
                await cancelAllScheduled();
                toast.success('Avisos programados borrados.');
              }}
            >
              <Card style={styles.smartRow}>
                <Ionicons name="close-circle-outline" size={20} color={colors.stone400} />
                <Text variant="bodyMedium" color={colors.stone300}>Cancelar todos</Text>
              </Card>
            </Pressable>
          </View>
        ) : null}

        {status === 'denied' ? (
          <Card style={{ gap: spacing['3'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
              <Ionicons name="alert-circle" size={18} color={colors.amber400} />
              <Text variant="bodyMedium" color={colors.cream} style={{ flex: 1 }}>
                Permiso bloqueado
              </Text>
            </View>
            <Text variant="small" color={colors.stone400}>
              Has rechazado las notificaciones para SantiagoWays. Para activarlas debes
              hacerlo desde los ajustes del sistema.
            </Text>
            <Button
              label="Abrir ajustes del sistema"
              variant="secondary"
              fullWidth
              onPress={() => Linking.openSettings()}
            />
          </Card>
        ) : null}

        <Text variant="caption" color={colors.stone500} style={{ marginTop: spacing['4'] }}>
          Estado del permiso del sistema:{' '}
          <Text variant="caption" color={colors.amber400}>{status}</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  smartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
});
