import { Dimensions, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';

const { width, height } = Dimensions.get('window');

export function Cta() {
  return (
    <View style={styles.root}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1571844906443-c0d1bcc8e5cd?w=1200' }}
        style={[StyleSheet.absoluteFill, { width, height }]}
        contentFit="cover"
      />
      <LinearGradient
        colors={['rgba(12,10,9,0.4)', 'rgba(12,10,9,0.95)']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View entering={FadeIn.duration(700)} style={styles.content}>
        <Text variant="display" color={colors.cream} align="center">
          Comienza tu Camino
        </Text>
        <Text
          variant="body"
          color={colors.stone300}
          align="center"
          style={{ marginTop: spacing['4'], paddingHorizontal: spacing['6'] }}
        >
          La aventura empieza con un solo paso.
        </Text>
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
