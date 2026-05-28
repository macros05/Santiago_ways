import { Dimensions, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';
import { media } from '@/media';

const { width, height } = Dimensions.get('window');

export function Cta() {
  return (
    <View style={styles.root}>
      <Image source={media.onboardingCommunity} style={[StyleSheet.absoluteFill, { width, height }]} contentFit="cover" />
      <LinearGradient
        colors={['rgba(8,7,11,0.2)', 'rgba(8,7,11,0.55)', 'rgba(8,7,11,0.97)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View entering={FadeIn.duration(700)} style={styles.content}>
        <Animated.View entering={FadeIn.delay(120).duration(600)}>
          <Text variant="overline" color={colors.amber300} align="center">
            Buen Camino
          </Text>
        </Animated.View>
        <Text variant="display" color={colors.cream} align="center" style={{ marginTop: spacing['4'] }}>
          Comienza tu Camino
        </Text>
        <Animated.View entering={FadeInDown.delay(260).duration(600)}>
          <Text
            variant="body"
            color={colors.stone200}
            align="center"
            style={{ marginTop: spacing['4'], paddingHorizontal: spacing['6'] }}
          >
            La aventura empieza con un solo paso.{'\n'}Miles de peregrinos te esperan.
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: spacing['16'],
  },
  content: {
    alignItems: 'center',
    marginTop: spacing['16'],
  },
});
