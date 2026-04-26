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
import { colors, layout, radius, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import { useSubscription } from '@stores/subscription';
import { useSubscriptionStatus } from '@hooks/useSubscription';
import { toast } from '@stores/toast';
import { useHealthPermission } from '@hooks/useHealth';

const ACHIEVEMENTS = [
  { name: 'Primeros pasos', icon: 'footsteps' as const, unlocked: true },
  { name: '100 km', icon: 'trophy' as const, unlocked: true },
  { name: 'Mitad', icon: 'flag' as const, unlocked: true },
  { name: 'Meseta', icon: 'sunny' as const, unlocked: false },
  { name: 'Compostela', icon: 'star' as const, unlocked: false },
  { name: 'Finisterre', icon: 'compass' as const, unlocked: false },
];

const PLAN_NAME: Record<string, string> = {
  free: 'Peregrino',
  buen_camino: 'Buen Camino',
  compostelero: 'Compostelero',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const { plan, status, currentPeriodEnd, cancelAtPeriodEnd } = useSubscriptionStatus();
  const restore = useSubscription((s) => s.restore);
  const health = useHealthPermission();

  const isCompostelero = plan === 'compostelero';
  const isBuenCamino = plan === 'buen_camino';
  const isPaid = isBuenCamino || isCompostelero;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.stone950 }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing['4'],
        paddingBottom: layout.tabBarHeight + insets.bottom + spacing['8'],
      }}
    >
      <View style={{ paddingHorizontal: spacing['5'] }}>
        <View style={styles.header}>
          <Avatar source={user?.avatar} name={user?.name} size="xl" />
          <Text variant="h1" color={colors.cream} style={{ marginTop: spacing['4'] }}>
            {user?.name ?? 'Pilgrim'}
          </Text>
          <Text variant="small" color={colors.stone400}>@{user?.username}</Text>
          <View style={{ marginTop: spacing['3'], flexDirection: 'row', gap: spacing['2'] }}>
            <Badge label="🇪🇸 ES" variant="neutral" />
            {isCompostelero ? (
              <View style={[styles.planBadge, { borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.15)' }]}>
                <Text variant="caption" color="#FFD700">🐚 Compostelero</Text>
              </View>
            ) : isBuenCamino ? (
              <View style={[styles.planBadge, { borderColor: colors.amber400, backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                <Text variant="caption" color={colors.amber400}>⭐ Buen Camino</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value={(user?.totalKm ?? 0).toFixed(0)} label="km" />
          <Stat value={String(user?.timesCompleted ?? 0)} label="completados" />
          <Stat value="3" label="logros" />
        </View>

        {/* Mi Suscripción */}
        <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          Mi Suscripción
        </Text>
        <Pressable onPress={() => router.push('/plans')}>
          <Card style={{ marginTop: spacing['3'], overflow: 'hidden' }}>
            {isCompostelero ? (
              <LinearGradient
                colors={['rgba(255,215,0,0.10)', 'rgba(255,215,0,0.02)']}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
              <View
                style={[
                  styles.planIcon,
                  {
                    backgroundColor: isCompostelero
                      ? 'rgba(255,215,0,0.18)'
                      : isBuenCamino
                        ? 'rgba(251,191,36,0.18)'
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
                  {PLAN_NAME[plan] ?? 'Peregrino'}
                </Text>
                <Text variant="caption" color={colors.stone400}>
                  {isPaid && currentPeriodEnd
                    ? `${cancelAtPeriodEnd ? 'Termina' : 'Renueva'} el ${currentPeriodEnd.toLocaleDateString('es')}`
                    : status === 'active'
                      ? 'Plan activo'
                      : 'Plan gratuito'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.stone400} />
            </View>
          </Card>
        </Pressable>
        <Pressable onPress={() => restore()} style={{ marginTop: spacing['2'], paddingVertical: spacing['2'] }}>
          <Text variant="caption" color={colors.amber400} align="center">
            Restaurar compra anterior
          </Text>
        </Pressable>

        {/* Compostelero quick links */}
        {isCompostelero ? (
          <View style={{ marginTop: spacing['6'], gap: spacing['3'] }}>
            <Pressable onPress={() => router.push('/ai-guide')}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <View style={[styles.qIcon, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
                  <Ionicons name="sparkles" size={18} color="#FFD700" />
                </View>
                <Text variant="bodyMedium" color={colors.cream} style={{ flex: 1 }}>
                  Guía IA
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.stone400} />
              </Card>
            </Pressable>
            <Pressable onPress={() => router.push('/health-dashboard')}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <View style={[styles.qIcon, { backgroundColor: 'rgba(251,191,36,0.12)' }]}>
                  <Ionicons name="heart" size={18} color={colors.amber400} />
                </View>
                <Text variant="bodyMedium" color={colors.cream} style={{ flex: 1 }}>
                  Salud
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.stone400} />
              </Card>
            </Pressable>
            <Pressable onPress={() => router.push('/chat')}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <View style={[styles.qIcon, { backgroundColor: 'rgba(255,215,0,0.12)' }]}>
                  <Ionicons name="chatbubbles" size={18} color="#FFD700" />
                </View>
                <Text variant="bodyMedium" color={colors.cream} style={{ flex: 1 }}>
                  Chat Compostelero
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.stone400} />
              </Card>
            </Pressable>
          </View>
        ) : null}

        <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          Logros
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievements}>
          {ACHIEVEMENTS.map((a) => (
            <View key={a.name} style={styles.ach}>
              <View
                style={[
                  styles.achCircle,
                  {
                    backgroundColor: a.unlocked ? 'rgba(251,191,36,0.15)' : colors.stone800,
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
                {a.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          Suscripción
        </Text>
        <Card style={{ marginTop: spacing['3'], padding: 0 }}>
          <SettingsRow
            icon="diamond-outline"
            label={isPaid ? 'Cambiar de plan' : 'Ver planes'}
            onPress={() => router.push('/plans')}
          />
          {isPaid ? (
            <SettingsRow
              icon="close-circle-outline"
              label="Cancelar suscripción"
              onPress={() =>
                toast.info('Gestiona tu cancelación desde el sistema de tu dispositivo.')
              }
            />
          ) : null}
          <SettingsRow
            icon="refresh-outline"
            label="Restaurar compra"
            onPress={() => restore()}
            last
          />
        </Card>

        {isCompostelero ? (
          <>
            <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
              Salud
            </Text>
            <Card style={{ marginTop: spacing['3'], padding: 0 }}>
              <SettingsRow
                icon="heart-outline"
                label={
                  health.granted ? 'Apple Health · Conectado' : 'Conectar Apple Health / Google Fit'
                }
                onPress={() => (health.granted ? router.push('/health-dashboard') : health.request())}
              />
              <SettingsRow
                icon="bar-chart-outline"
                label="Ver dashboard de salud"
                onPress={() => router.push('/health-dashboard')}
              />
              {health.granted ? (
                <SettingsRow
                  icon="trash-outline"
                  label="Revocar acceso"
                  onPress={() => health.revoke()}
                  last
                />
              ) : null}
            </Card>
          </>
        ) : null}

        <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          Ajustes
        </Text>
        <Card style={{ marginTop: spacing['3'], padding: 0 }}>
          <SettingsRow icon="person-outline" label="Editar perfil" onPress={() => toast.info('Pendiente.')} />
          <SettingsRow icon="lock-closed-outline" label="Privacidad" onPress={() => toast.info('Pendiente.')} />
          <SettingsRow icon="notifications-outline" label="Notificaciones" onPress={() => toast.info('Pendiente.')} />
          <SettingsRow icon="map-outline" label="Mapa & unidades" onPress={() => toast.info('Pendiente.')} />
          <SettingsRow icon="cloud-download-outline" label="Descargas offline" onPress={() => toast.info('Pendiente.')} />
          <SettingsRow icon="language-outline" label="Idioma" onPress={() => toast.info('Pendiente.')} last />
        </Card>

        <Button
          label="Cerrar sesión"
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
    <Pressable onPress={onPress} style={[styles.row, !last && styles.rowBorder]}>
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
