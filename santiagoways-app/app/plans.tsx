import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';
import { AuroraBackground } from '@components/AuroraBackground';
import { PlanCard, type PlanFeature } from '@features/plans/PlanCard';
import { PriceToggle, type Period } from '@features/plans/PriceToggle';
import { useSubscription } from '@stores/subscription';
import { toast } from '@stores/toast';
import { t } from '@lib/i18n';
import type { PurchasesPackage } from '@lib/purchases';

function featuresByTier(): Record<'free' | 'buen_camino' | 'compostelero', PlanFeature[]> {
  return {
    free: [
      { text: t('plans.features.freeFrances'), included: true },
      { text: t('plans.features.freeMap'), included: true },
      { text: t('plans.features.free3Albergues'), included: false },
      { text: t('plans.features.freeNoOffline'), included: false },
      { text: t('plans.features.freeReadOnly'), included: false },
      { text: t('plans.features.freeNoAI'), included: false },
      { text: t('plans.features.freeAds'), included: false },
    ],
    buen_camino: [
      { text: t('plans.features.buenAllRoutes'), included: true },
      { text: t('plans.features.buenAllAlbergues'), included: true },
      { text: t('plans.features.buenOffline'), included: true },
      { text: t('plans.features.buenCommunity'), included: true },
      { text: t('plans.features.buenGps'), included: true },
      { text: t('plans.features.buenNoAds'), included: true },
    ],
    compostelero: [
      { text: t('plans.features.compAllBuen'), included: true },
      { text: t('plans.features.compAI'), included: true, highlight: true },
      { text: t('plans.features.compHealth'), included: true, highlight: true },
      { text: t('plans.features.compChat'), included: true, highlight: true },
      { text: t('plans.features.compInsurance'), included: true, highlight: true },
      { text: t('plans.features.compEarlyAccess'), included: true, highlight: true },
      { text: t('plans.features.compBadge'), included: true, highlight: true },
    ],
  };
}

export default function PlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('annual');
  const offerings = useSubscription((s) => s.offerings);
  const loadOfferings = useSubscription((s) => s.loadOfferings);
  const purchase = useSubscription((s) => s.purchase);
  const restore = useSubscription((s) => s.restore);
  const isLoading = useSubscription((s) => s.isLoading);
  const currentPlan = useSubscription((s) => s.plan);

  useEffect(() => {
    if (!offerings) loadOfferings();
  }, [offerings, loadOfferings]);

  const buenPkg = useMemo(() => pickPackage(offerings, 'buen_camino', period), [offerings, period]);
  const compPkg = useMemo(() => pickPackage(offerings, 'compostelero', period), [offerings, period]);
  const features = featuresByTier();

  const handlePurchase = async (pkg: PurchasesPackage | null, planLabel: string) => {
    if (!pkg) {
      toast.error(t('plans.purchaseUnavailable'));
      return;
    }
    try {
      const newPlan = await purchase(pkg);
      if (newPlan) {
        toast.success(t('plans.welcomeTo', { plan: planLabel }));
        router.back();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('plans.purchaseError');
      toast.error(msg);
    }
  };

  const handleRestore = async () => {
    const plan = await restore();
    if (plan && plan !== 'free') {
      toast.success(t('plans.restored', { plan }));
    } else {
      toast.info(t('plans.restoreNone'));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <AuroraBackground bloom={0.58} />
      <View style={[styles.topBar, { paddingTop: insets.top + spacing['2'] }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="close" size={24} color={colors.cream} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['5'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginTop: spacing['2'], gap: spacing['2'] }}>
          <Text variant="display" align="center" color={colors.cream}>
            {t('plans.title')}
          </Text>
          <Text variant="body" align="center" color={colors.stone400}>
            {t('plans.subtitle')}
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: spacing['3'] }}>
          <PriceToggle value={period} onChange={setPeriod} savingsLabel={t('plans.savings')} />
        </View>

        <PlanCard
          tier="free"
          title={t('plans.tierFreeTitle')}
          subtitle={t('plans.tierFreeSubtitle')}
          priceLine={t('plans.free')}
          secondaryPrice={t('plans.forever')}
          features={features.free}
          ctaLabel={currentPlan === 'free' ? t('plans.currentPlan') : t('plans.continueFree')}
          ctaDisabled={currentPlan === 'free'}
          onPressCta={() => router.back()}
          delay={0}
        />

        <PlanCard
          tier="buen_camino"
          title={t('plans.buenTitle')}
          subtitle={t('plans.buenSubtitle')}
          priceLine={priceLineFor(buenPkg, period, t('plans.perMonthFallbackBuen'), t('plans.perYearFallbackBuen'))}
          secondaryPrice={
            period === 'annual' ? t('plans.buenSecondaryAnnual') : t('plans.cancelAnytime')
          }
          features={features.buen_camino}
          ctaLabel={
            currentPlan === 'buen_camino'
              ? t('plans.currentPlan')
              : currentPlan === 'compostelero'
                ? t('plans.downgradeBuen')
                : t('plans.startTrial')
          }
          ctaDisabled={currentPlan === 'buen_camino'}
          ctaLoading={isLoading}
          onPressCta={() => handlePurchase(buenPkg, t('plans.buenTitle'))}
          badge={t('plans.mostPopular')}
          delay={120}
        />

        <PlanCard
          tier="compostelero"
          title={t('plans.compTitle')}
          subtitle={t('plans.compSubtitle')}
          priceLine={priceLineFor(compPkg, period, t('plans.perMonthFallbackComp'), t('plans.perYearFallbackComp'))}
          secondaryPrice={
            period === 'annual' ? t('plans.compSecondaryAnnual') : t('plans.compSecondaryMonthly')
          }
          features={features.compostelero}
          ctaLabel={
            currentPlan === 'compostelero' ? t('plans.currentPlan') : t('plans.becomeComp')
          }
          ctaDisabled={currentPlan === 'compostelero'}
          ctaLoading={isLoading}
          onPressCta={() => handlePurchase(compPkg, t('plans.compTitle'))}
          badge={t('plans.premium')}
          delay={240}
        />

        <View style={{ alignItems: 'center', marginTop: spacing['4'], gap: spacing['2'] }}>
          <Text variant="small" align="center" color={colors.stone400}>
            {t('plans.noCommitment')}
          </Text>
          <Pressable
            onPress={handleRestore}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('plans.restore')}
          >
            <Text variant="bodyMedium" color={colors.amber400}>
              {t('plans.restore')}
            </Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: spacing['4'], marginTop: spacing['2'] }}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={t('plans.terms')}
              onPress={() =>
                Linking.openURL('https://santiagoways.app/terms').catch(() => {
                  Alert.alert(t('plans.terms'), t('plans.linkError'));
                })
              }
            >
              <Text variant="caption" color={colors.stone400}>
                {t('plans.terms')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={t('plans.privacy')}
              onPress={() =>
                Linking.openURL('https://santiagoways.app/privacy').catch(() => {
                  Alert.alert(t('plans.privacy'), t('plans.linkError'));
                })
              }
            >
              <Text variant="caption" color={colors.stone400}>
                {t('plans.privacy')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function pickPackage(
  offerings: ReturnType<typeof useSubscription.getState>['offerings'],
  offeringId: 'buen_camino' | 'compostelero',
  period: Period,
): PurchasesPackage | null {
  if (!offerings) return null;
  const offering = offerings.all[offeringId] ?? offerings.current;
  if (!offering) return null;
  return period === 'annual' ? offering.annual ?? null : offering.monthly ?? null;
}

function priceLineFor(
  pkg: PurchasesPackage | null,
  period: Period,
  monthlyFallback: string,
  annualFallback: string,
): string {
  if (pkg) {
    return period === 'annual'
      ? `${pkg.product.priceString}${t('plans.perYear')}`
      : `${pkg.product.priceString}${t('plans.perMonth')}`;
  }
  return period === 'annual' ? annualFallback : monthlyFallback;
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['2'],
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.glassFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
