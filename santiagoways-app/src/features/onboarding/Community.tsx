import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { Avatar } from '@components/Avatar';
import { colors, spacing } from '@design/tokens';

const { width } = Dimensions.get('window');

const TESTIMONIALS = [
  {
    name: 'María, 🇪🇸',
    quote: 'El Camino me ha cambiado la vida. Y SantiagoWays ha sido mi guía.',
  },
  {
    name: 'Thomas, 🇩🇪',
    quote: 'Found my albergue every night, met pilgrims from 20 countries.',
  },
  {
    name: 'Aiko, 🇯🇵',
    quote: 'A new pilgrim family in every village.',
  },
] as const;

export function Community() {
  return (
    <View style={styles.root}>
      <Text variant="display" color={colors.cream} align="center">
        Camina junto
      </Text>
      <Text
        variant="body"
        color={colors.stone400}
        align="center"
        style={{ marginTop: spacing['3'], paddingHorizontal: spacing['8'] }}
      >
        Miles de peregrinos comparten su Camino contigo en tiempo real.
      </Text>

      <View style={{ marginTop: spacing['10'], gap: spacing['4'], paddingHorizontal: spacing['5'] }}>
        {TESTIMONIALS.map((t, i) => (
          <Animated.View
            key={t.name}
            entering={FadeIn.delay(200 * (i + 1)).duration(500)}
          >
            <Card elevation="raised">
              <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
                <Avatar name={t.name} size="md" />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyBold" color={colors.cream}>
                    {t.name}
                  </Text>
                  <Text
                    variant="small"
                    color={colors.stone300}
                    style={{ marginTop: 4 }}
                  >
                    “{t.quote}”
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}
      </View>

      <View style={[styles.dots, { width }]} pointerEvents="none">
        {[...Array(20).keys()].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                left: 20 + (i * (width - 40)) / 20,
                top: 20 + (Math.sin(i) + 1) * 30,
                opacity: 0.3 + (i % 4) * 0.2,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: spacing['16'],
  },
  dots: {
    position: 'absolute',
    bottom: 250,
    height: 100,
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amber400,
  },
});
