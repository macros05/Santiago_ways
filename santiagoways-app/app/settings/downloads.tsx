import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Button } from '@components/Button';
import { Text } from '@design/text';
import { colors, layout, radius, spacing } from '@design/tokens';
import { useCanAccess } from '@hooks/useSubscription';

export default function DownloadsSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const canOffline = useCanAccess('offline_maps');

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Header title="Descargas offline" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['4'],
        }}
      >
        <Card style={{ alignItems: 'center', gap: spacing['3'], paddingVertical: spacing['8'] }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.full,
              backgroundColor: 'rgba(251,191,36,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="cloud-download-outline" size={28} color={colors.amber400} />
          </View>
          <Text variant="h2" color={colors.cream} align="center">
            No hay mapas descargados
          </Text>
          <Text variant="small" color={colors.stone400} align="center">
            {canOffline
              ? 'Abre cualquier etapa y pulsa "Descargar para offline" para llevar el Camino sin cobertura.'
              : 'Los mapas offline son una característica del plan Buen Camino.'}
          </Text>
          {canOffline ? (
            <Button
              label="Explorar etapas"
              variant="secondary"
              fullWidth
              onPress={() => router.push('/(tabs)/route')}
            />
          ) : (
            <Button label="Ver planes" fullWidth onPress={() => router.push('/plans')} />
          )}
        </Card>

        <Text variant="caption" color={colors.stone500}>
          Las etapas descargadas ocupan entre 8 y 25 MB cada una. Podrás eliminar cualquier
          descarga individualmente desde aquí cuando esté disponible.
        </Text>
      </ScrollView>
    </View>
  );
}
