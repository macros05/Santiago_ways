import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Button } from '@components/Button';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';
import { Hero } from '@features/onboarding/Hero';
import { Routes } from '@features/onboarding/Routes';
import { Community } from '@features/onboarding/Community';
import { Features } from '@features/onboarding/Features';
import { Cta } from '@features/onboarding/Cta';

const { width } = Dimensions.get('window');

const SCREENS = [
  { key: 'hero', component: Hero },
  { key: 'routes', component: Routes },
  { key: 'community', component: Community },
  { key: 'features', component: Features },
  { key: 'cta', component: Cta },
] as const;

export default function Welcome() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.stone950, '#1a1108']}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SCREENS.map(({ key, component: C }) => (
          <View key={key} style={{ width }}>
            <C />
          </View>
        ))}
      </ScrollView>

      <Animated.View entering={FadeInDown.duration(400)} style={styles.dots}>
        {SCREENS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === page ? colors.amber400 : colors.stone700,
                width: i === page ? 24 : 8,
              },
            ]}
          />
        ))}
      </Animated.View>

      {page === SCREENS.length - 1 ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.cta}>
          <Button
            label="Crear cuenta"
            onPress={() => router.push('/(auth)/register')}
            fullWidth
          />
          <Button
            label="Ya tengo cuenta"
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            style={{ marginTop: spacing['3'] }}
          />
        </Animated.View>
      ) : (
        <View style={styles.cta}>
          <Button
            label="Continuar"
            onPress={() =>
              scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true })
            }
            fullWidth
          />
          <Text variant="caption" color={colors.stone400} align="center" style={{ marginTop: spacing['3'] }}>
            Desliza para continuar
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.stone950,
  },
  dots: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  cta: {
    position: 'absolute',
    bottom: 50,
    left: spacing['5'],
    right: spacing['5'],
  },
});
