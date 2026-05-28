import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { colors, layout, spacing } from '@design/tokens';
import { api, ApiError } from '@lib/api';
import { useAuth, type AuthUser } from '@stores/auth';
import { toast } from '@stores/toast';

export default function PrivacySettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const [privateAccount, setPrivateAccount] = useState(user?.privateAccount ?? false);
  const [shareLocation, setShareLocation] = useState(user?.shareLocation ?? true);

  const update = async (patch: { privateAccount?: boolean; shareLocation?: boolean }) => {
    // Optimistic update — revert if the API rejects the change.
    const previous = { privateAccount, shareLocation };
    if (patch.privateAccount !== undefined) setPrivateAccount(patch.privateAccount);
    if (patch.shareLocation !== undefined) setShareLocation(patch.shareLocation);
    try {
      const updated = await api<AuthUser>('/users/me', { method: 'PATCH', body: patch });
      if (user) setUser({ ...user, ...updated });
    } catch (e) {
      setPrivateAccount(previous.privateAccount);
      setShareLocation(previous.shareLocation);
      toast.error(e instanceof ApiError ? e.message : 'No pudimos guardar el cambio.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header title="Privacidad" onBack={() => router.back()} />
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
            <Text variant="bodyMedium" color={colors.cream}>Cuenta privada</Text>
            <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
              Solo los peregrinos que sigues podrán ver tus publicaciones.
            </Text>
          </View>
          <Switch
            value={privateAccount}
            onValueChange={(v) => update({ privateAccount: v })}
            trackColor={{ false: colors.stone700, true: colors.amber500 }}
            thumbColor={colors.cream}
          />
        </Card>

        <Card style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" color={colors.cream}>Compartir ubicación</Text>
            <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
              Aparece en el mapa de la comunidad mientras estás en el Camino.
            </Text>
          </View>
          <Switch
            value={shareLocation}
            onValueChange={(v) => update({ shareLocation: v })}
            trackColor={{ false: colors.stone700, true: colors.amber500 }}
            thumbColor={colors.cream}
          />
        </Card>

        <Text variant="caption" color={colors.stone500} style={{ marginTop: spacing['4'] }}>
          La eliminación de cuenta y la exportación de datos están disponibles bajo solicitud
          escribiendo a soporte@santiagoways.app.
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
});
