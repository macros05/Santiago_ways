import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius as radiusTokens, shadows, spacing } from '@design/tokens';

type GlassTone = 'neutral' | 'amber' | 'strong';
type GlassElevation = 'none' | 'sm' | 'md' | 'lg';

type GlassProps = Omit<ViewProps, 'style'> & {
  /** Frost strength of the underlying BlurView (0–100). */
  intensity?: number;
  tone?: GlassTone;
  elevation?: GlassElevation;
  radius?: keyof typeof radiusTokens;
  padding?: keyof typeof spacing | 0;
  /** Show the diagonal top-left light sheen that sells the "liquid" look. */
  sheen?: boolean;
  /** Render a luminous hairline along the top edge. */
  highlight?: boolean;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

const toneFill: Record<GlassTone, string> = {
  neutral: colors.glassFill,
  amber: colors.glassFillAmber,
  strong: colors.glassFillStrong,
};

const elevationShadow: Record<GlassElevation, ViewStyle> = {
  none: {},
  sm: shadows.sm,
  md: shadows.md,
  lg: shadows.lg,
};

/**
 * The signature "liquid glass" surface: a frosted BlurView, a low-alpha tint, a
 * gradient sheen and a light-catching hairline border. Compose cards, sheets,
 * pills and toolbars from it so the whole app shares one material language.
 *
 * Android note: BlurView is far less convincing on Android, so we lean on a
 * slightly stronger solid tint there to keep contrast and depth.
 */
export function Glass({
  intensity = 28,
  tone = 'neutral',
  elevation = 'md',
  radius = 'xl',
  padding = 0,
  sheen = true,
  highlight = true,
  bordered = true,
  style,
  children,
  ...rest
}: GlassProps) {
  const r = radiusTokens[radius];
  const pad = padding === 0 ? 0 : spacing[padding];
  const androidFallback =
    Platform.OS === 'android' ? { backgroundColor: 'rgba(28,25,23,0.72)' } : null;

  return (
    <View
      {...rest}
      style={[
        { borderRadius: r },
        elevationShadow[elevation],
        style,
      ]}
    >
      <View style={[styles.clip, { borderRadius: r }]}>
        <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: toneFill[tone] }, androidFallback]} />
        {sheen ? (
          <LinearGradient
            colors={gradients.glassSheen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : null}
        {bordered ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: r, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassBorder },
            ]}
          />
        ) : null}
        {highlight ? (
          <LinearGradient
            colors={[colors.glassHighlight, 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.topHighlight}
            pointerEvents="none"
          />
        ) : null}
        <View style={{ padding: pad }}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: '8%',
    right: '8%',
    height: 1.5,
    opacity: 0.7,
  },
});
