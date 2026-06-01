import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { Skeleton } from '@components/Skeleton';
import { Badge } from '@components/Badge';
import { ProgressRing } from '@components/ProgressRing';
import { Button } from '@components/Button';
import { StageCard } from '@components/StageCard';
import { HomeBanner } from '@components/ads/HomeBanner';
import { HoyCard } from '@components/HoyCard';
import { FeaturedAlbergueCard } from '@components/ads/FeaturedAlbergueCard';
import { AuroraBackground } from '@components/AuroraBackground';
import { colors, layout, radius, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import {
  isLockedRoute,
  pilgrimageStats,
  useMyPilgrimage,
  useRoutes,
  type RouteListItem,
} from '@hooks/usePilgrimage';
import { useFeaturedAlbergues } from '@hooks/useFeaturedAlbergues';
import { useShowAds, usePlan } from '@hooks/useSubscription';
import { useWeather } from '@hooks/useWeather';
import { greeting } from '@lib/format';
import { t } from '@lib/i18n';
import { dailyQuote } from '@lib/dailyQuote';
import { Analytics } from '@lib/analytics';
import { useTracking } from '@lib/tracking';
import { usePrefs } from '@stores/prefs';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const isGuest = useAuth((s) => s.isGuest);
  const myQ = useMyPilgrimage();
  const routesQ = useRoutes();
  const featuredQ = useFeaturedAlbergues();
  const showAds = useShowAds();
  const plan = usePlan();
  const locale = usePrefs((s) => s.locale);
  const quote = dailyQuote(locale);

  const stats = pilgrimageStats(myQ.data);
  const upcoming = myQ.data?.stages
    .filter((s) => s.status === 'active' || s.status === 'pending')
    .slice(0, 5);

  // Weather follows the user's last known position when on Camino;
  // falls back to Santiago de Compostela for inspiration.
  const weatherLat = user?.isOnCamino ? null : 42.881;
  const weatherLng = user?.isOnCamino ? null : -8.545;
  const weatherQ = useWeather(weatherLat, weatherLng);

  // Live tracking — surface off-route warning at the top.
  const isTracking = useTracking((s) => s.isTracking);
  const isOffRoute = useTracking((s) => s.offRoute);

  useEffect(() => {
    Analytics.homeView();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <AuroraBackground bloom={0.5} subtle />
      <ScrollView
        style={{ flex: 1 }}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
            <Text variant="display" color={colors.cream} numberOfLines={1} style={{ flexShrink: 1 }}>
              {user?.name?.split(' ')[0] ?? (isGuest ? 'Invitado' : 'Pilgrim')}
            </Text>
            {plan === 'compostelero' ? (
              <Text style={{ fontSize: 22 }}>🐚</Text>
            ) : plan === 'buen_camino' ? (
              <Ionicons name="star" size={20} color={colors.amber400} />
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/plans')}
          hitSlop={8}
          style={styles.bell}
          accessibilityRole="button"
          accessibilityLabel="Ver planes premium"
        >
          <Ionicons name="diamond-outline" size={20} color={colors.musgo} />
        </Pressable>
      </View>

      {isGuest ? (
        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={styles.guestBanner}
          accessibilityRole="button"
        >
          <Ionicons name="person-circle-outline" size={20} color={colors.musgo} />
          <View style={{ flex: 1 }}>
            <Text variant="caption" color={colors.cream}>{t('guest.banner')}</Text>
            <Text variant="caption" color={colors.musgo}>{t('guest.bannerCta')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.musgo} />
        </Pressable>
      ) : null}

      {isTracking && isOffRoute ? (
        <View style={styles.offRoute}>
          <Ionicons name="warning" size={18} color={colors.stone950} />
          <Text variant="caption" color={colors.stone950} style={{ flex: 1 }}>
            {t('home.offRoute')}
          </Text>
        </View>
      ) : null}

      {myQ.isLoading ? (
        <View style={{ paddingHorizontal: spacing['5'] }}>
          <Skeleton height={200} borderRadius={radius.lg} />
        </View>
      ) : myQ.data && stats ? (
        <Card style={styles.hero} elevation="floating" padding={0}>
          {/* homeHero photo pending GEMINI_API_KEY — see plan Task 13 */}
          <LinearGradient
            colors={['rgba(12,10,9,0.45)', 'rgba(12,10,9,0.95)']}
            style={[StyleSheet.absoluteFill, { borderRadius: radius.lg }]}
          />
          <View style={styles.heroContent}>
            <View style={{ flex: 1, paddingRight: spacing['3'] }}>
              <Badge
                label={`${myQ.data.route.name}${stats.active ? ` · Etapa ${stats.active.stage.number}` : ''}`}
                variant="neutral"
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
              <Ionicons name="trail-sign" size={28} color={colors.musgo} />
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

      {/* Quick actions — surface the new diary, credential, practical, community shortcuts. */}
      <View style={styles.quickActions}>
        <QuickAction icon="book-outline" label={t('home.qaDiary')} onPress={() => router.push('/diary')} />
        <QuickAction icon="ribbon-outline" label={t('home.qaCredential')} onPress={() => router.push('/credential')} />
        <QuickAction icon="information-circle-outline" label={t('home.qaPractical')} onPress={() => router.push('/practical')} />
        <QuickAction icon="people-outline" label={t('home.qaCommunity')} onPress={() => router.push('/(tabs)/community')} />
      </View>

      <HoyCard
        quote={quote}
        weather={weatherQ.data ? {
          label: locale === 'en' ? weatherQ.data.description_en : weatherQ.data.description,
          tempC: weatherQ.data.temperatureC,
        } : null}
      />

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

      {/* Compostelero: AI guide entry */}
      {plan === 'compostelero' ? (
        <Section title="Tu Guía IA" subtitle="Recomendaciones personalizadas para hoy">
          <View style={{ paddingHorizontal: spacing['5'] }}>
            <Pressable onPress={() => router.push('/ai-guide')}>
              <Card elevation="raised" style={styles.aiCard}>
                <LinearGradient
                  colors={['rgba(79,122,82,0.10)', 'rgba(79,122,82,0.02)']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.aiIcon}>
                  <Ionicons name="sparkles" size={20} color={colors.musgo} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyBold" color={colors.cream}>
                    Pide consejo a tu peregrino veterano
                  </Text>
                  <Text variant="small" color={colors.stone400} style={{ marginTop: 2 }}>
                    Etapa, salud, meteo y joyas ocultas, en segundos.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.stone400} />
              </Card>
            </Pressable>
          </View>
        </Section>
      ) : null}

      {/* Albergues destacados (free plan only) */}
      {showAds && (featuredQ.isLoading || (featuredQ.data && featuredQ.data.length > 0)) ? (
        <Section title="Albergues destacados" subtitle="Recomendados por SantiagoWays">
          {featuredQ.isLoading ? (
            <View style={[styles.hScroll, { flexDirection: 'row' }]}>
              <Skeleton height={180} width={260} borderRadius={radius.lg} />
              <Skeleton height={180} width={260} borderRadius={radius.lg} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScroll}
            >
              {featuredQ.data!.map((a) => (
                <View key={a.id} style={{ width: 260 }}>
                  <FeaturedAlbergueCard albergue={a} />
                </View>
              ))}
            </ScrollView>
          )}
        </Section>
      ) : null}

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
            routesQ.data?.map((r: RouteListItem) =>
              isLockedRoute(r) ? (
                <LockedRouteRow key={r.id} route={r} onPress={() => router.push('/plans')} />
              ) : (
                <Pressable key={r.id} onPress={() => router.push(`/route/${r.slug}`)}>
                  <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                    <View style={[styles.routeDot, { backgroundColor: r.color }]} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
                        <Text variant="bodyBold" color={colors.cream}>{r.name}</Text>
                        {r.isPopular ? <Badge label="popular" variant="success" size="sm" /> : null}
                      </View>
                      <Text variant="small" color={colors.stone400} style={{ marginTop: 2 }}>
                        {r.totalKm.toFixed(0)} km · {r._count?.stages ?? '?'} etapas · {r.startCity}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.stone400} />
                  </Card>
                </Pressable>
              ),
            )
          )}
        </View>
      </Section>

      {showAds ? (
        <View style={{ marginTop: spacing['6'] }}>
          <HomeBanner />
        </View>
      ) : null}
      </ScrollView>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.qa}>
      <View style={styles.qaIcon}>
        <Ionicons name={icon} size={20} color={colors.musgo} />
      </View>
      <Text variant="caption" color={colors.cream} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function LockedRouteRow({
  route,
  onPress,
}: {
  route: import('@hooks/usePilgrimage').LockedRoute;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'], opacity: 0.85 }}>
        <View style={[styles.routeDot, { backgroundColor: route.color, opacity: 0.4 }]} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
            <Text variant="bodyBold" color={colors.stone300}>{route.name}</Text>
            <Badge label="Premium" variant="gold" size="sm" />
          </View>
          <Text variant="small" color={colors.stone500} style={{ marginTop: 2 }}>
            {route.preview.totalKm.toFixed(0)} km · {route.preview.startCity} · Buen Camino
          </Text>
        </View>
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={14} color={colors.gold} />
        </View>
      </Card>
    </Pressable>
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.greenTintSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.greenTintStrong,
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
    backgroundColor: 'rgba(58,90,64,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hScroll: {
    paddingHorizontal: spacing['5'],
    gap: spacing['3'],
  },
  routeDot: {
    width: 10,
    height: 56,
    borderRadius: 5,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(58,90,64,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79,122,82,0.30)',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    overflow: 'hidden',
    borderColor: 'rgba(79,122,82,0.30)',
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(79,122,82,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginHorizontal: spacing['5'],
    marginBottom: spacing['4'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(58,90,64,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(79,122,82,0.30)',
  },
  offRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: colors.amber400,
    marginHorizontal: spacing['5'],
    marginBottom: spacing['4'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.md,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing['5'],
    marginTop: spacing['6'],
    gap: spacing['2'],
  },
  qa: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  qaIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.greenTintSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
