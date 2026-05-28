import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Text } from '@design/text';
import { Badge } from '@components/Badge';
import { Card } from '@components/Card';
import { Skeleton } from '@components/Skeleton';
import { colors, radius, spacing } from '@design/tokens';
import { isLockedRoute, useRoutes } from '@hooks/usePilgrimage';
import { media } from '@/media';

const { width, height } = Dimensions.get('window');
const CARD_W = width * 0.72;

const FALLBACK = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800';

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

export function Routes() {
  const routesQ = useRoutes();
  const items = routesQ.data ?? [];

  return (
    <View style={styles.root}>
      <Image source={media.auroraBg} style={[StyleSheet.absoluteFill, { width, height }]} contentFit="cover" />
      <LinearGradient
        colors={['rgba(8,7,11,0.72)', 'rgba(8,7,11,0.86)', 'rgba(8,7,11,0.96)']}
        style={StyleSheet.absoluteFill}
      />
      <Text variant="overline" color={colors.amber300} align="center" style={{ marginBottom: spacing['3'] }}>
        {items.length || '...'} rutas legendarias
      </Text>
      <Text variant="display" color={colors.cream} align="center">
        Elige tu Camino
      </Text>
      <Text
        variant="body"
        color={colors.stone300}
        align="center"
        style={{ marginTop: spacing['3'], paddingHorizontal: spacing['8'] }}
      >
        Cada sendero cuenta su propia historia hacia Santiago.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + spacing['3']}
        decelerationRate="fast"
        contentContainerStyle={styles.carousel}
        style={{ marginTop: spacing['8'] }}
      >
        {routesQ.isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <View key={i} style={[styles.card, { width: CARD_W }]}>
                <Skeleton height={380} borderRadius={radius.lg} />
              </View>
            ))
          : items.map((r, i) => {
              // Normalize locked / unlocked into a single shape for rendering.
              const display = isLockedRoute(r)
                ? {
                    name: r.name,
                    imageUrl: r.preview.imageUrl,
                    difficulty: r.preview.difficulty,
                    totalKm: r.preview.totalKm,
                    startCity: r.preview.startCity,
                    locked: true,
                    isPopular: false,
                    stagesCount: undefined as number | undefined,
                  }
                : {
                    name: r.name,
                    imageUrl: r.imageUrl,
                    difficulty: r.difficulty,
                    totalKm: r.totalKm,
                    startCity: r.startCity,
                    locked: false,
                    isPopular: r.isPopular,
                    stagesCount: r._count?.stages,
                  };
              return (
                <Animated.View
                  key={r.id}
                  entering={FadeInRight.delay(80 * i).duration(420)}
                  style={[styles.card, { width: CARD_W }]}
                >
                  <Card padding={0} elevation="floating">
                    <Image
                      source={{ uri: display.imageUrl ?? FALLBACK }}
                      style={styles.img}
                      contentFit="cover"
                      transition={300}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(12,10,9,0.9)']}
                      style={StyleSheet.absoluteFill}
                    />
                    {display.locked ? (
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={14} color={colors.cream} />
                      </View>
                    ) : null}
                    <View style={styles.cardBody}>
                      <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
                        <Badge label={DIFFICULTY_LABEL[display.difficulty] ?? display.difficulty} variant="gold" />
                        {display.isPopular ? <Badge label="popular" variant="success" size="sm" /> : null}
                        {display.locked ? <Badge label="Premium" variant="info" size="sm" /> : null}
                      </View>
                      <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['2'] }}>
                        {display.name}
                      </Text>
                      <Text variant="small" color={colors.stone300}>
                        {display.totalKm.toFixed(0)} km
                        {display.stagesCount !== undefined ? ` · ${display.stagesCount} etapas` : ''}
                      </Text>
                      <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
                        desde {display.startCity}
                      </Text>
                    </View>
                  </Card>
                </Animated.View>
              );
            })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: spacing['16'],
  },
  carousel: {
    paddingHorizontal: spacing['6'],
    gap: spacing['3'],
  },
  card: {
    height: 380,
  },
  img: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
  },
  cardBody: {
    position: 'absolute',
    bottom: 0,
    padding: spacing['5'],
  },
  lockBadge: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
