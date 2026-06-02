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
import { t } from '@lib/i18n';

export default function DownloadsSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const canOffline = useCanAccess('offline_maps');

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header title={t('settings.offlineDownloads')} onBack={() => router.back()} />
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
              backgroundColor: colors.amberTintSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="cloud-download-outline" size={28} color={colors.amber400} />
          </View>
          <Text variant="h2" color={colors.cream} align="center">
            {t('settingsDownloads.emptyTitle')}
          </Text>
          <Text variant="small" color={colors.stone400} align="center">
            {canOffline
              ? t('settingsDownloads.emptyBodyCanOffline')
              : t('settingsDownloads.emptyBodyLocked')}
          </Text>
          {canOffline ? (
            <Button
              label={t('settingsDownloads.exploreStages')}
              variant="secondary"
              fullWidth
              onPress={() => router.push('/(tabs)/route')}
            />
          ) : (
            <Button
              label={t('profile.viewPlans')}
              fullWidth
              onPress={() => router.push('/plans')}
            />
          )}
        </Card>

        <Text variant="caption" color={colors.stone500}>
          {t('settingsDownloads.sizeDisclaimer')}
        </Text>
      </ScrollView>
    </View>
  );
}
