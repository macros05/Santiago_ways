import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Button } from '@components/Button';
import { Text } from '@design/text';
import { colors, gradients, spacing } from '@design/tokens';
import { t } from '@lib/i18n';
import { Hero } from '@features/onboarding/Hero';
import { Routes } from '@features/onboarding/Routes';
import { Cta } from '@features/onboarding/Cta';
import { Analytics } from '@lib/analytics';
import { useAuth } from '@stores/auth';

const { width } = Dimensions.get('window');
const PROGRESS_KEY = 'sw_onboarding_progress_v1';

const SCREENS = [
  { key: 'hero', component: Hero },
  { key: 'routes', component: Routes },
  { key: 'cta', component: Cta },
] as const;

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const enterGuest = useAuth((s) => s.enterGuestMode);
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    AsyncStorage.getItem(PROGRESS_KEY)
      .then((raw) => {
        if (raw) {
          const n = Math.max(0, Math.min(SCREENS.length - 1, Number(raw)));
          if (n > 0) {
            setPage(n);
            requestAnimationFrame(() => {
              scrollRef.current?.scrollTo({ x: width * n, animated: false });
            });
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(PROGRESS_KEY, String(page)).catch(() => {});
    const slot = SCREENS[page]?.key;
    if (slot) Analytics.onboardingStep(slot);
  }, [page, hydrated]);

  const onScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  const skipToEnd = () => {
    Analytics.onboardingSkipped(SCREENS[page]?.key ?? 'unknown');
    scrollRef.current?.scrollTo({ x: width * (SCREENS.length - 1), animated: true });
    setPage(SCREENS.length - 1);
  };

  const goRegister = () => {
    Analytics.onboardingCompleted(Date.now() - startedAt.current);
    AsyncStorage.removeItem(PROGRESS_KEY).catch(() => {});
    router.push('/(auth)/register');
  };

  const exploreWithoutAccount = async () => {
    Analytics.onboardingExploreWithoutAccount();
    AsyncStorage.removeItem(PROGRESS_KEY).catch(() => {});
    await enterGuest();
    router.replace('/(tabs)/explore');
  };

  const ctaBottom = Math.max(insets.bottom, spacing['6']) + spacing['4'];
  const dotsBottom = ctaBottom + 156;
  const skipTop = insets.top + spacing['3'];

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.dawn} style={StyleSheet.absoluteFill} />
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

      {/* Skip — top-right, only visible on non-final steps. */}
      {page < SCREENS.length - 1 ? (
        <Pressable
          onPress={skipToEnd}
          hitSlop={12}
          style={[styles.skip, { top: skipTop }]}
          accessibilityRole="button"
          accessibilityLabel={t('common.skip')}
        >
          <Text variant="small" color={colors.stone300}>
            {t('common.skip')}
          </Text>
        </Pressable>
      ) : null}

      <Animated.View entering={FadeInDown.duration(400)} style={[styles.dots, { bottom: dotsBottom }]}>
        {SCREENS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === page ? colors.amber300 : 'rgba(255,255,255,0.25)',
                width: i === page ? 26 : 8,
              },
            ]}
          />
        ))}
      </Animated.View>

      {page === SCREENS.length - 1 ? (
        <Animated.View entering={FadeIn.duration(300)} style={[styles.cta, { bottom: ctaBottom }]}>
          <Button label={t('auth.register')} onPress={goRegister} fullWidth />
          <Button
            label={t('onboarding.exploreWithoutAccount')}
            variant="ghost"
            onPress={exploreWithoutAccount}
            fullWidth
            style={{ marginTop: spacing['3'] }}
          />
          <Button
            label={t('onboarding.haveAccount')}
            variant="ghost"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
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
    backgroundColor: colors.ink,
  },
  skip: {
    position: 'absolute',
    right: spacing['5'],
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
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
