import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { animation, colors, radius, spacing } from '@design/tokens';
import { Text } from '@design/text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  haptic?: boolean;
};

const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
const horizontalPadding: Record<Size, number> = { sm: 14, md: 20, lg: 24 };

const variantStyle: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.amber400, text: colors.stone950 },
  secondary: { bg: colors.stone800, text: colors.cream, border: colors.stone700 },
  ghost: { bg: 'transparent', text: colors.amber400 },
  danger: { bg: colors.error, text: colors.white },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  iconLeft,
  iconRight,
  onPress,
  haptic = true,
  style,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, animation.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.snappy);
  }, [scale]);

  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      onPress?.(e);
    },
    [haptic, onPress],
  );

  const v = variantStyle[variant];
  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[fullWidth && { alignSelf: 'stretch' }, animatedStyle, style]}>
      <Pressable
        {...rest}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          {
            backgroundColor: v.bg,
            borderColor: v.border ?? 'transparent',
            borderWidth: v.border ? 1 : 0,
            height: heights[size],
            paddingHorizontal: horizontalPadding[size],
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text} />
        ) : (
          <View style={styles.row}>
            {iconLeft ? <View style={styles.icon}>{iconLeft}</View> : null}
            <Text variant="bodyBold" color={v.text}>
              {label}
            </Text>
            {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
