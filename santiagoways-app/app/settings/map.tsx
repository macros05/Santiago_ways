import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { colors, layout, radius, spacing } from '@design/tokens';
import { usePrefs, type DistanceUnit } from '@stores/prefs';
import { t } from '@lib/i18n';

const OPTIONS: Array<{ value: DistanceUnit; labelKey: string; example: string }> = [
  { value: 'km', labelKey: 'settingsMap.optionKilometers', example: '24,5 km · +680 m' },
  { value: 'mi', labelKey: 'settingsMap.optionMiles', example: '15.2 mi · +2,231 ft' },
];

export default function MapSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const units = usePrefs((s) => s.units);
  const setUnits = usePrefs((s) => s.setUnits);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header title={t('settingsMap.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['5'],
        }}
      >
        <View>
          <Text variant="h2" color={colors.cream}>{t('settingsMap.distanceUnits')}</Text>
          <Text variant="caption" color={colors.stone400} style={{ marginTop: 4 }}>
            {t('settingsMap.distanceUnitsDescription')}
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
                    <Text variant="bodyMedium" color={colors.cream}>{t(opt.labelKey)}</Text>
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
          {t('settingsMap.conversionDisclaimer')}
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
