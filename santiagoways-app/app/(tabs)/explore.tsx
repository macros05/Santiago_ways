import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { Skeleton } from '@components/Skeleton';
import { Badge } from '@components/Badge';
import { ProgressRing } from '@components/ProgressRing';
import { Button } from '@components/Button';
import { StageCard } from '@components/StageCard';
import { colors, layout, radius, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import { pilgrimageStats, useMyPilgrimage, useRoutes } from '@hooks/usePilgrimage';
import { greeting } from '@lib/format';
import { t } from '@lib/i18n';

const TIPS = [
  { title: 'Hidratación en la Meseta', body: 'Lleva 2L de agua. La sombra escasea entre las 11 y las 16h.' },
  { title: 'Pies sanos, Camino largo', body: 'Vaselina antes de andar, calcetines de merino, secado al aire cada parada.' },
  { title: 'Sello cada día', body: 'Necesitas mínimo 2 sellos por día en los últimos 100km para la Compostela.' },
  { title: 'Empieza temprano', body: 'En verano, sal antes de las 7am. El calor del mediodía pega muy fuerte.' },
  { title: 'Donativo no es gratis', body: 'En los albergues donativo, deja al menos 8-10€ — sostienen el lugar.' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const myQ = useMyPilgrimage();
  const routesQ = useRoutes();
  const tip = TIPS[new Date().getDate() % TIPS.length]!;

  const stats = pilgrimageStats(myQ.data);
  const upcoming = myQ.data?.stages
    .filter((s) => s.status === 'active' || s.status === 'pending')
    .slice(0, 5);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.stone950 }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing['4'],
        paddingBottom: layout.tabBarHeight + insets.bottom + spacing['8'],
      }}
    >
      <View style={styles.greeting}>
        <View style={{ flex: 1 }}>
          <Text variant="small" color={colors.stone400}>
            {t(`explore.${greeting()}`)}
          </Text>
          <Text variant="display" color={colors.cream} numberOfLines={1}>
            {user?.name?.split(' ')[0] ?? 'Pilgrim'}
          </Text>
        </View>
        <View style={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color={colors.cream} />
        </View>
      </View>

      {myQ.isLoading ? (
        <View style={{ paddingHorizontal: spacing['5'] }}>
          <Skeleton height={200} borderRadius={radius.lg} />
        </View>
      ) : myQ.data && stats ? (
        <Card style={styles.hero} elevation="floating" padding={0}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200' }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(12,10,9,0.45)', 'rgba(12,10,9,0.95)']}
            style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
          />
          <View style={styles.heroContent}>
            <View style={{ flex: 1, paddingRight: spacing['3'] }}>
              <Badge
                label={`${myQ.data.route.name}${stats.active ? ` · Etapa ${stats.active.stage.number}` : ''}`}
                variant="gold"
              />
              <Text
                variant="h1"
                color={colors.cream}
                style={{ marginTop: spacing['3'] }}
                numberOfLines={2}
              >
                {stats.active?.stage.name ?? '¡Camino completado!'}
              </Text>
              <Text variant="small" color={colors.stone300} style={{ marginTop: 4 }}>
                Día {stats.totalDays} · {stats.walkedKm.toFixed(0)} de {stats.totalKmRoute.toFixed(0)} km
              </Text>
              {stats.active ? (
                <Button
                  label="Continuar etapa"
                  size="sm"
                  onPress={() => router.push(`/stage/${stats.active!.stage.id}`)}
                  style={{ marginTop: spacing['4'], alignSelf: 'flex-start' }}
                />
              ) : null}
            </View>
            <ProgressRing percentage={stats.progress} size={96} strokeWidth={6}>
              <Text variant="bodyBold" color={colors.cream}>
                {Math.round(stats.progress * 100)}%
              </Text>
              <Text variant="caption" color={colors.stone300}>
                {stats.completed.length}/{myQ.data.stages.length}
              </Text>
            </ProgressRing>
          </View>
        </Card>
      ) : (
        <Card style={styles.hero} elevation="raised" padding="5">
          <View style={styles.emptyHero}>
            <View style={styles.emptyIcon}>
              <Ionicons name="trail-sign" size={28} color={colors.amber400} />
            </View>
            <Text variant="h2" color={colors.cream} align="center" style={{ marginTop: spacing['3'] }}>
              Aún no has empezado
            </Text>
            <Text variant="small" color={colors.stone400} align="center" style={{ marginTop: 4 }}>
              Elige una ruta y comienza tu Camino.
            </Text>
            <Button
              label="Empezar mi Camino"
              size="sm"
              onPress={() => router.push('/(auth)/profile-setup')}
              style={{ marginTop: spacing['4'] }}
            />
          </View>
        </Card>
      )}

      {/* Próximas etapas */}
      {upcoming && upcoming.length > 0 ? (
        <Section
          title={t('explore.yourRoute')}
          subtitle="Próximas etapas en tu Camino"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {upcoming.map((entry) => (
              <StageCard
                key={entry.id}
                style={{ width: 280 }}
                stage={{
                  id: entry.stage.id,
                  number: entry.stage.number,
                  name: entry.stage.name,
                  startPoint: entry.stage.startPoint,
                  endPoint: entry.stage.endPoint,
                  distanceKm: entry.stage.distanceKm,
                  elevationGain: entry.stage.elevationGain,
                  difficulty:
                    (entry.stage.difficulty as 'easy' | 'medium' | 'hard') ?? 'medium',
                  status: entry.status,
                }}
                onPress={() => router.push(`/stage/${entry.stage.id}`)}
              />
            ))}
          </ScrollView>
        </Section>
      ) : null}

      {/* Consejo del día */}
      <Section title={t('explore.todaysTip')}>
        <View style={{ paddingHorizontal: spacing['5'] }}>
          <Card>
            <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
              <View style={styles.tipIcon}>
                <Ionicons name="bulb" size={20} color={colors.amber400} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold" color={colors.cream}>{tip.title}</Text>
                <Text variant="small" color={colors.stone300} style={{ marginTop: 4 }}>
                  {tip.body}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </Section>

      {/* Todas las rutas */}
      <Section
        title="Rutas del Camino"
        subtitle={`${routesQ.data?.length ?? '...'} rutas disponibles`}
      >
        <View style={{ paddingHorizontal: spacing['5'], gap: spacing['3'] }}>
          {routesQ.isLoading ? (
            <>
              <Skeleton height={88} borderRadius={radius.lg} />
              <Skeleton height={88} borderRadius={radius.lg} />
              <Skeleton height={88} borderRadius={radius.lg} />
            </>
          ) : (
            routesQ.data?.map((r) => (
              <Card
                key={r.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}
              >
                <View style={[styles.routeDot, { backgroundColor: r.color }]} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
                    <Text variant="bodyBold" color={colors.cream}>{r.name}</Text>
                    {r.isPopular ? <Badge label="popular" variant="gold" size="sm" /> : null}
                  </View>
                  <Text variant="small" color={colors.stone400} style={{ marginTop: 2 }}>
                    {r.totalKm.toFixed(0)} km · {r._count?.stages ?? '?'} etapas · {r.startCity}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.stone400} />
              </Card>
            ))
          )}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: spacing['8'] }}>
      <View style={{ paddingHorizontal: spacing['5'] }}>
        <Text variant="h2" color={colors.cream}>{title}</Text>
        {subtitle ? (
          <Text variant="small" color={colors.stone400} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ marginTop: spacing['4'] }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing['5'],
    marginBottom: spacing['6'],
    gap: spacing['3'],
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.stone900,
    borderWidth: 1,
    borderColor: colors.stone700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    minHeight: 200,
    marginHorizontal: spacing['5'],
  },
  heroContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing['5'],
  },
  emptyHero: {
    alignItems: 'center',
    paddingVertical: spacing['4'],
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hScroll: {
    paddingHorizontal: spacing['5'],
    gap: spacing['3'],
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeDot: {
    width: 10,
    height: 56,
    borderRadius: 5,
  },
});
