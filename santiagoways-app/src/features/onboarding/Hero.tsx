import { Dimensions, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@design/text';
import { colors, gradients, spacing } from '@design/tokens';
import { media } from '@/media';

const { width, height } = Dimensions.get('window');

export function Hero() {
  return (
    <View style={styles.root}>
      <Image source={media.onboardingHero} style={[StyleSheet.absoluteFill, { width, height }]} contentFit="cover" />
      <LinearGradient
        colors={['rgba(8,7,11,0.15)', 'rgba(8,7,11,0.45)', 'rgba(8,7,11,0.96)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Animated.View entering={FadeIn.delay(120).duration(700)} style={styles.eyebrow}>
          <Text variant="overline" color={colors.amber300}>
            Camino de Santiago
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(220).duration(700)}>
          <Text variant="displayLg" color={colors.cream} align="center" style={styles.title}>
            Santiago{'\n'}
            <Text variant="displayLg" color={colors.amber300} italic>
              Ways
            </Text>
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(380).duration(700)}>
          <Text variant="body" color={colors.stone200} align="center" style={styles.subtitle}>
            Tu compañero definitivo del Camino —{'\n'}rutas, albergues, diario y comunidad.
          </Text>
        </Animated.View>
      </View>
      {/* Bottom amber hairline echoing the horizon */}
      <LinearGradient
        colors={gradients.sunrise}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.horizonLine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    alignItems: 'center',
    paddingBottom: height * 0.3,
    paddingHorizontal: spacing['6'],
  },
  eyebrow: {
    marginBottom: spacing['4'],
  },
  title: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 24,
  },
  subtitle: {
    marginTop: spacing['5'],
    paddingHorizontal: spacing['4'],
    opacity: 0.95,
  },
  horizonLine: {
    position: 'absolute',
    bottom: height * 0.27,
    left: '22%',
    right: '22%',
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
});
