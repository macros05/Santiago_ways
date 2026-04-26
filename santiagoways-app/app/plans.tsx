import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';
import { PlanCard, type PlanFeature } from '@features/plans/PlanCard';
import { PriceToggle, type Period } from '@features/plans/PriceToggle';
import { useSubscription } from '@stores/subscription';
import { toast } from '@stores/toast';
import type { PurchasesPackage } from '@lib/purchases';

const FEATURES: Record<'free' | 'buen_camino' | 'compostelero', PlanFeature[]> = {
  free: [
    { text: 'Camino Francés completo', included: true },
    { text: 'Mapa interactivo', included: true },
    { text: 'Solo 3 albergues por etapa', included: false },
    { text: 'Sin mapas offline', included: false },
    { text: 'Comunidad solo lectura', included: false },
    { text: 'Sin IA ni recomendaciones', included: false },
    { text: 'Anuncios', included: false },
  ],
  buen_camino: [
    { text: 'Todas las rutas del Camino', included: true },
    { text: 'Todos los albergues + disponibilidad', included: true },
    { text: 'Mapas offline ilimitados', included: true },
    { text: 'Comunidad completa', included: true },
    { text: 'GPS tracking + historial', included: true },
    { text: 'Sin anuncios', included: true },
  ],
  compostelero: [
    { text: 'Todo lo de Buen Camino', included: true },
    { text: 'IA personalizada con Gemini', included: true, highlight: true },
    { text: 'Apple Health / Google Fit', included: true, highlight: true },
    { text: 'Chat privado Compostelero', included: true, highlight: true },
    { text: 'Seguro de viaje integrado', included: true, highlight: true },
    { text: 'Acceso anticipado a nuevas rutas', included: true, highlight: true },
    { text: 'Badge exclusivo 🐚 en comunidad', included: true, highlight: true },
  ],
};

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

  const handlePurchase = async (pkg: PurchasesPackage | null, planLabel: string) => {
    if (!pkg) {
      toast.error('Compras no disponibles en este entorno');
      return;
    }
    try {
      const newPlan = await purchase(pkg);
      if (newPlan) {
        toast.success(`¡Bienvenido a ${planLabel}!`);
        router.back();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error en la compra';
      toast.error(msg);
    }
  };

  const handleRestore = async () => {
    const plan = await restore();
    if (plan && plan !== 'free') {
      toast.success(`Restaurado: ${plan}`);
    } else {
      toast.info('No se encontraron compras anteriores');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
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
            Elige tu Camino
          </Text>
          <Text variant="body" align="center" color={colors.stone400}>
            Desbloquea la experiencia completa del peregrino
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: spacing['3'] }}>
          <PriceToggle value={period} onChange={setPeriod} savingsLabel="Ahorra hasta un 58%" />
        </View>

        <PlanCard
          tier="free"
          title="Peregrino"
          subtitle="Para empezar el Camino"
          priceLine="Gratis"
          secondaryPrice="para siempre"
          features={FEATURES.free}
          ctaLabel={currentPlan === 'free' ? 'Tu plan actual' : 'Continuar gratis'}
          ctaDisabled={currentPlan === 'free'}
          onPressCta={() => router.back()}
          delay={0}
        />

        <PlanCard
          tier="buen_camino"
          title="Buen Camino"
          subtitle="La experiencia completa"
          priceLine={priceLineFor(buenPkg, period, '€3,99/mes', '€19,99/año')}
          secondaryPrice={
            period === 'annual' ? 'Equivale a €1,66/mes · 7 días gratis' : 'Cancela cuando quieras'
          }
          features={FEATURES.buen_camino}
          ctaLabel={
            currentPlan === 'buen_camino'
              ? 'Tu plan actual'
              : currentPlan === 'compostelero'
                ? 'Bajar a Buen Camino'
                : 'Empezar — 7 días gratis'
          }
          ctaDisabled={currentPlan === 'buen_camino'}
          ctaLoading={isLoading}
          onPressCta={() => handlePurchase(buenPkg, 'Buen Camino')}
          badge="MÁS POPULAR"
          delay={120}
        />

        <PlanCard
          tier="compostelero"
          title="Compostelero"
          subtitle="Tu guía personal del Camino"
          priceLine={priceLineFor(compPkg, period, '€9,99/mes', '€59,99/año')}
          secondaryPrice={
            period === 'annual' ? 'Equivale a €5,00/mes · 7 días gratis' : 'IA + Salud + Chat'
          }
          features={FEATURES.compostelero}
          ctaLabel={
            currentPlan === 'compostelero' ? 'Tu plan actual' : 'Hacerse Compostelero'
          }
          ctaDisabled={currentPlan === 'compostelero'}
          ctaLoading={isLoading}
          onPressCta={() => handlePurchase(compPkg, 'Compostelero')}
          badge="PREMIUM"
          delay={240}
        />

        <View style={{ alignItems: 'center', marginTop: spacing['4'], gap: spacing['2'] }}>
          <Text variant="small" align="center" color={colors.stone400}>
            Cancela cuando quieras · Sin permanencia
          </Text>
          <Pressable
            onPress={handleRestore}
            hitSlop={12}
          >
            <Text variant="bodyMedium" color={colors.amber400}>
              Restaurar compra anterior
            </Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: spacing['4'], marginTop: spacing['2'] }}>
            <Pressable
              onPress={() =>
                Linking.openURL('https://santiagoways.app/terms').catch(() => {
                  Alert.alert('Términos', 'No se pudo abrir el enlace.');
                })
              }
            >
              <Text variant="caption" color={colors.stone400}>
                Términos
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                Linking.openURL('https://santiagoways.app/privacy').catch(() => {
                  Alert.alert('Privacidad', 'No se pudo abrir el enlace.');
                })
              }
            >
              <Text variant="caption" color={colors.stone400}>
                Privacidad
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
      ? `${pkg.product.priceString}/año`
      : `${pkg.product.priceString}/mes`;
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.stone900,
    borderWidth: 1,
    borderColor: colors.stone700,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
