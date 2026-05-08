import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Button } from '@components/Button';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';
import { t } from '@lib/i18n';
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
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  // Bottom-anchored CTA + dots respect the home indicator / nav bar.
  const ctaBottom = Math.max(insets.bottom, spacing['6']) + spacing['4'];
  const dotsBottom = ctaBottom + 132;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.stone950, colors.stone900]}
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

      <Animated.View entering={FadeInDown.duration(400)} style={[styles.dots, { bottom: dotsBottom }]}>
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
        <Animated.View entering={FadeIn.duration(300)} style={[styles.cta, { bottom: ctaBottom }]}>
          <Button
            label={t('auth.register')}
            onPress={() => router.push('/(auth)/register')}
            fullWidth
          />
          <Button
            label={t('onboarding.haveAccount')}
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            style={{ marginTop: spacing['3'] }}
          />
        </Animated.View>
      ) : (
        <View style={[styles.cta, { bottom: ctaBottom }]}>
          <Button
            label={t('common.continue')}
            onPress={() =>
              scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true })
            }
            fullWidth
          />
          <Text variant="caption" color={colors.stone400} align="center" style={{ marginTop: spacing['3'] }}>
            {t('onboarding.swipe')}
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
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2'],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  cta: {
    position: 'absolute',
    left: spacing['5'],
    right: spacing['5'],
  },
});
