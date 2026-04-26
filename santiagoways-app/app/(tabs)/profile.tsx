import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Avatar } from '@components/Avatar';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { colors, layout, radius, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import { toast } from '@stores/toast';

const ACHIEVEMENTS = [
  { name: 'Primeros pasos', icon: 'footsteps' as const, unlocked: true },
  { name: '100 km', icon: 'trophy' as const, unlocked: true },
  { name: 'Mitad', icon: 'flag' as const, unlocked: true },
  { name: 'Meseta', icon: 'sunny' as const, unlocked: false },
  { name: 'Compostela', icon: 'star' as const, unlocked: false },
  { name: 'Finisterre', icon: 'compass' as const, unlocked: false },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);

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
            <Badge label="En Camino" variant="gold" />
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value="320" label="km" />
          <Stat value="13" label="etapas" />
          <Stat value="3" label="logros" />
        </View>

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

import { Pressable } from 'react-native';

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
});
