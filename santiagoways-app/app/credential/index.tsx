import { useMemo } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Skeleton } from '@components/Skeleton';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { useCredential, type Stamp } from '@hooks/useCredential';
import { useMyPilgrimage } from '@hooks/usePilgrimage';
import { useAuth } from '@stores/auth';
import { t } from '@lib/i18n';

export default function CredentialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const myQ = useMyPilgrimage();
  const credQ = useCredential(myQ.data?.id);
  const user = useAuth((s) => s.user);

  const stamps = credQ.data?.stamps ?? [];
  const eligible = credQ.data?.compostelaEligible ?? false;
  const remaining = useMemo(() => {
    if (!credQ.data) return 2;
    return Math.max(0, 2 - credQ.data.uniqueDaysLast100km);
  }, [credQ.data]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Header title={t('credential.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + 32,
        }}
      >
        {credQ.isLoading ? (
          <Skeleton height={200} borderRadius={radius.lg} />
        ) : (
          <Card padding={0} style={styles.compostela}>
            <LinearGradient
              colors={['rgba(251,191,36,0.18)', 'rgba(251,191,36,0.04)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.compostelaContent}>
              <Text style={{ fontSize: 36 }}>🐚</Text>
              <Text variant="h2" color={colors.cream} align="center" style={{ marginTop: spacing['2'] }}>
                {t('credential.compostela')}
              </Text>
              <Text
                variant="caption"
                color={colors.stone400}
                align="center"
                style={{ marginTop: 4, paddingHorizontal: spacing['4'] }}
              >
                {eligible
                  ? t('credential.compostelaEligible')
                  : t('credential.compostelaNotYet', { remaining: String(remaining) })}
              </Text>
              {eligible ? (
                <Button
                  label={t('credential.shareCompostela')}
                  size="sm"
                  onPress={() =>
                    Share.share({
                      message: `He completado el Camino de Santiago — ${user?.name ?? 'pilgrim'} · ${stamps.length} sellos`,
                    })
                  }
                  style={{ marginTop: spacing['4'] }}
                />
              ) : null}
            </View>
          </Card>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing['8'] }}>
          <Text variant="h2" color={colors.cream}>
            {t('credential.stamps', { count: String(stamps.length) })}
          </Text>
          <Button
            label={t('credential.addStamp')}
            size="sm"
            variant="ghost"
            onPress={() => router.push('/credential/add')}
          />
        </View>

        <View style={{ marginTop: spacing['4'], gap: spacing['3'] }}>
          {stamps.length === 0 ? (
            <Card>
              <Text variant="body" color={colors.stone300} align="center">
                {t('credential.compostelaNotYet', { remaining: '2' })}
              </Text>
            </Card>
          ) : (
            stamps.map((s) => <StampRow key={s.id} stamp={s} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StampRow({ stamp }: { stamp: Stamp }) {
  const date = new Date(stamp.stampedAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
  const variant = stamp.method === 'gps' ? 'success' : stamp.method === 'qr' ? 'gold' : 'neutral';
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
        <View style={styles.stampIcon}>
          <Ionicons
            name={stamp.method === 'qr' ? 'qr-code' : stamp.method === 'gps' ? 'location' : 'create'}
            size={18}
            color={colors.amber400}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold" color={colors.cream} numberOfLines={1}>
            {stamp.placeName}
          </Text>
          <Text variant="caption" color={colors.stone400}>
            {stamp.city ? `${stamp.city} · ` : ''}{date}
          </Text>
        </View>
        <Badge label={t(`credential.method_${stamp.method}`)} variant={variant} size="sm" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  compostela: {
    overflow: 'hidden',
    borderColor: 'rgba(251,191,36,0.4)',
    borderWidth: 1,
    minHeight: 200,
    justifyContent: 'center',
  },
  compostelaContent: {
    padding: spacing['8'],
    alignItems: 'center',
  },
  stampIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
