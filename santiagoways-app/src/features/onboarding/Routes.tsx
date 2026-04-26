import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Text } from '@design/text';
import { Badge } from '@components/Badge';
import { Card } from '@components/Card';
import { colors, radius, spacing } from '@design/tokens';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.72;

const ROUTES = [
  {
    name: 'Camino Francés',
    km: '779 km',
    diff: 'Medio',
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    color: colors.amber400,
  },
  {
    name: 'Camino Portugués',
    km: '240 km',
    diff: 'Fácil',
    img: 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=800',
    color: colors.success,
  },
  {
    name: 'Camino del Norte',
    km: '825 km',
    diff: 'Difícil',
    img: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800',
    color: colors.info,
  },
] as const;

export function Routes() {
  return (
    <View style={styles.root}>
      <Text variant="display" color={colors.cream} align="center">
        Elige tu Camino
      </Text>
      <Text
        variant="body"
        color={colors.stone400}
        align="center"
        style={{ marginTop: spacing['3'], paddingHorizontal: spacing['8'] }}
      >
        Tres rutas legendarias hacia Santiago de Compostela.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + spacing['3']}
        decelerationRate="fast"
        contentContainerStyle={styles.carousel}
        style={{ marginTop: spacing['8'] }}
      >
        {ROUTES.map((r, i) => (
          <Animated.View
            key={r.name}
            entering={FadeInRight.delay(150 * i).duration(500)}
            style={[styles.card, { width: CARD_W }]}
          >
            <Card padding={0} elevation="floating">
              <Image source={{ uri: r.img }} style={styles.img} contentFit="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(12,10,9,0.85)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardBody}>
                <Badge label={r.diff} variant="gold" />
                <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['2'] }}>
                  {r.name}
                </Text>
                <Text variant="small" color={colors.stone300}>
                  {r.km}
                </Text>
              </View>
            </Card>
          </Animated.View>
        ))}
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
});
