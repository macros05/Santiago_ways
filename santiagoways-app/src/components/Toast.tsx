import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { animation, colors, radius, shadows, spacing } from '@design/tokens';
import { Text } from '@design/text';
import { useToastStore } from '@stores/toast';

const ICONS = {
  success: 'checkmark-circle' as const,
  error: 'close-circle' as const,
  info: 'information-circle' as const,
};

const COLOR = {
  success: colors.success,
  error: colors.error,
  info: colors.info,
};

export function ToastHost() {
  const toast = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-160);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!toast) return;
    translateY.value = withSpring(0, animation.gentle);
    opacity.value = withTiming(1, { duration: 200 });

    const duration = toast.duration ?? 2800;
    translateY.value = withDelay(
      duration,
      withSequence(
        withTiming(-160, { duration: 250 }),
        withTiming(-160, { duration: 0 }, () => runOnJS(dismiss)()),
      ),
    );
    opacity.value = withDelay(duration, withTiming(0, { duration: 250 }));
  }, [toast, translateY, opacity, dismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!toast) return null;

  return (
    <Animated.View
      style={[styles.wrapper, { top: insets.top + spacing['2'] }, animatedStyle]}
      pointerEvents="none"
    >
      <View style={styles.toast}>
        <Ionicons name={ICONS[toast.type]} size={20} color={COLOR[toast.type]} />
        <Text variant="bodyMedium" color={colors.cream} style={styles.message}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing['4'],
    right: spacing['4'],
    zIndex: 2000,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: colors.stone800,
    borderColor: colors.stone700,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    ...shadows.lg,
  },
  message: {
    flexShrink: 1,
  },
});
