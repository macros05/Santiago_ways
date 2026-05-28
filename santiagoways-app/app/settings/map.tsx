import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { colors, layout, radius, spacing } from '@design/tokens';
import { usePrefs, type DistanceUnit } from '@stores/prefs';

const OPTIONS: Array<{ value: DistanceUnit; label: string; example: string }> = [
  { value: 'km', label: 'Kilómetros', example: '24,5 km · +680 m' },
  { value: 'mi', label: 'Millas', example: '15.2 mi · +2,231 ft' },
];

export default function MapSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const units = usePrefs((s) => s.units);
  const setUnits = usePrefs((s) => s.setUnits);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header title="Mapa & unidades" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['5'],
        }}
      >
        <View>
          <Text variant="h2" color={colors.cream}>Unidades de distancia</Text>
          <Text variant="caption" color={colors.stone400} style={{ marginTop: 4 }}>
            Cómo se muestran los kilómetros y la elevación en toda la app.
          </Text>
        </View>

        <View style={{ gap: spacing['3'] }}>
          {OPTIONS.map((opt) => {
            const active = units === opt.value;
            return (
              <Pressable key={opt.value} onPress={() => setUnits(opt.value)}>
                <Card
                  style={[
                    styles.option,
                    active ? { borderColor: colors.amber400, borderWidth: 1.5 } : null,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" color={colors.cream}>{opt.label}</Text>
                    <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
                      {opt.example}
                    </Text>
                  </View>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.amber400} />
                  ) : (
                    <View style={styles.bullet} />
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>

        <Text variant="caption" color={colors.stone500}>
          La conversión es solo de presentación: el backend siempre almacena valores en
          kilómetros y metros para mantener la consistencia entre dispositivos.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  bullet: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.stone600,
  },
});
