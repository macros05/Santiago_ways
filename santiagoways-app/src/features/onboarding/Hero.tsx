import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

// A simplified Camino path SVG (Saint-Jean → Santiago, west).
const PATH = 'M30 80 C70 90, 110 60, 150 70 S230 100, 280 80 S340 50, 380 70';
const PATH_LENGTH = 600; // approximation for stroke-dasharray

export function Hero() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      300,
      withTiming(1, { duration: 2200, easing: Easing.out(Easing.cubic) }),
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LENGTH * (1 - progress.value),
  }));

  return (
    <View style={styles.root}>
      <View style={styles.glow} />
      <Animated.View entering={FadeIn.delay(100).duration(700)} style={styles.title}>
        <Text variant="displayLg" color={colors.cream} align="center">
          Santiago
          {'\n'}
          <Text variant="displayLg" color={colors.amber400} italic>
            Ways
          </Text>
        </Text>
        <Text
          variant="bodyMedium"
          color={colors.stone300}
          align="center"
          style={{ marginTop: spacing['4'], paddingHorizontal: spacing['6'] }}
        >
          Tu compañero definitivo{'\n'}del Camino de Santiago
        </Text>
      </Animated.View>
      <View style={styles.svgWrap}>
        <Svg width={width - 40} height={120} viewBox="0 0 400 120">
          <AnimatedPath
            d={PATH}
            stroke={colors.amber400}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${PATH_LENGTH} ${PATH_LENGTH}`}
            animatedProps={animatedProps}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: height * 0.15,
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    top: height * 0.18,
    width: 360,
    height: 360,
    borderRadius: 360,
    backgroundColor: 'rgba(251,191,36,0.18)',
    transform: [{ scale: 1.3 }],
  },
  title: {
    alignItems: 'center',
  },
  svgWrap: {
    position: 'absolute',
    bottom: height * 0.32,
    alignItems: 'center',
  },
});
