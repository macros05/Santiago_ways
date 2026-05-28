import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { animation, colors, glow, gradients, radius, spacing } from '@design/tokens';
import { Text } from '@design/text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
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

const heights: Record<Size, number> = { sm: 38, md: 50, lg: 58 };
const horizontalPadding: Record<Size, number> = { sm: 16, md: 22, lg: 26 };

// Text colors per variant (the visual fill is rendered as a layer below).
const textColor: Record<Variant, string> = {
  primary: colors.stone950,
  secondary: colors.cream,
  ghost: colors.amber400,
  danger: colors.white,
  glass: colors.cream,
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
    scale.value = withSpring(0.96, animation.snappy);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, animation.snappy);
  }, [scale]);

  const handlePress = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPress']>>[0]) => {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      onPress?.(e);
    },
    [haptic, onPress],
  );

  const isDisabled = disabled || loading;
  const h = heights[size];
  const tint = textColor[variant];

  return (
    <Animated.View
      style={[
        fullWidth && { alignSelf: 'stretch' },
        variant === 'primary' && !isDisabled ? glow.amber : null,
        animatedStyle,
        style,
      ]}
    >
      <Pressable
        {...rest}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          {
            height: h,
            paddingHorizontal: horizontalPadding[size],
            opacity: isDisabled ? 0.45 : 1,
          },
        ]}
      >
        <Fill variant={variant} />
        {loading ? (
          <ActivityIndicator color={tint} />
        ) : (
          <View style={styles.row}>
            {iconLeft ? <View style={styles.icon}>{iconLeft}</View> : null}
            <Text variant="bodyBold" color={tint} style={styles.label}>
              {label}
            </Text>
            {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** The visual surface layer behind the button label. */
function Fill({ variant }: { variant: Variant }) {
  if (variant === 'primary') {
    return (
      <>
        <LinearGradient
          colors={gradients.sunrise}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[colors.glassHighlight, 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      </>
    );
  }
  if (variant === 'danger') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.error }]} />;
  }
  if (variant === 'ghost') {
    return null;
  }
  // secondary + glass → frosted material with a hairline border.
  return (
    <>
      <BlurView intensity={26} tint="dark" style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              Platform.OS === 'android'
                ? 'rgba(41,37,36,0.82)'
                : variant === 'glass'
                  ? colors.glassFill
                  : colors.glassFillStrong,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.glassBorder,
            borderRadius: radius.full,
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  label: {
    letterSpacing: 0.2,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
