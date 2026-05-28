import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { colors, fontSize, lineHeight, tracking, typography, weight } from './tokens';

type Variant =
  | 'displayLg'
  | 'display'
  | 'displaySm'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyMedium'
  | 'bodyBold'
  | 'small'
  | 'caption'
  | 'overline'
  | 'mono';

type TextProps = RNTextProps & {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  italic?: boolean;
};

// Display variants use Fraunces (serif, soulful). Headings/body use the system
// UI font (SF Pro / Roboto) via `fontWeight` for a crisp, Apple-grade finish.
const styles: Record<Variant, TextStyle> = StyleSheet.create({
  displayLg: {
    fontFamily: typography.display,
    fontSize: fontSize['5xl'],
    lineHeight: lineHeight['5xl'],
    letterSpacing: tracking.tighter,
  },
  display: {
    fontFamily: typography.display,
    fontSize: fontSize['4xl'],
    lineHeight: lineHeight['4xl'],
    letterSpacing: tracking.tight,
  },
  displaySm: {
    fontFamily: typography.displaySemibold,
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    letterSpacing: tracking.tight,
  },
  h1: {
    fontFamily: typography.bodyBold,
    fontWeight: weight.bold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    letterSpacing: tracking.tight,
  },
  h2: {
    fontFamily: typography.bodyBold,
    fontWeight: weight.bold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    letterSpacing: tracking.tight,
  },
  h3: {
    fontFamily: typography.bodyMedium,
    fontWeight: weight.semibold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    letterSpacing: tracking.normal,
  },
  body: {
    fontFamily: typography.body,
    fontWeight: weight.regular,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    letterSpacing: tracking.normal,
  },
  bodyMedium: {
    fontFamily: typography.bodyMedium,
    fontWeight: weight.medium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    letterSpacing: tracking.normal,
  },
  bodyBold: {
    fontFamily: typography.bodyBold,
    fontWeight: weight.semibold,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    letterSpacing: tracking.normal,
  },
  small: {
    fontFamily: typography.body,
    fontWeight: weight.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: tracking.normal,
  },
  caption: {
    fontFamily: typography.bodyMedium,
    fontWeight: weight.medium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: tracking.wide,
  },
  // Tiny all-caps label — used for section eyebrows / metadata.
  overline: {
    fontFamily: typography.bodyMedium,
    fontWeight: weight.semibold,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: tracking.widest,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: typography.mono,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
});

export function Text({
  variant = 'body',
  color = colors.cream,
  align,
  italic,
  style,
  children,
  ...rest
}: TextProps) {
  return (
    <RNText
      {...rest}
      style={[
        styles[variant],
        { color },
        align ? { textAlign: align } : null,
        italic ? { fontFamily: typography.displayItalic } : null,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
