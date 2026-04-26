import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { colors, fontSize, lineHeight, typography } from './tokens';

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
  | 'mono';

type TextProps = RNTextProps & {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  italic?: boolean;
};

const styles: Record<Variant, TextStyle> = StyleSheet.create({
  displayLg: { fontFamily: typography.display, fontSize: fontSize['5xl'], lineHeight: lineHeight['5xl'] },
  display: { fontFamily: typography.display, fontSize: fontSize['4xl'], lineHeight: lineHeight['4xl'] },
  displaySm: { fontFamily: typography.display, fontSize: fontSize['3xl'], lineHeight: lineHeight['3xl'] },
  h1: { fontFamily: typography.bodyBold, fontSize: fontSize['2xl'], lineHeight: lineHeight['2xl'] },
  h2: { fontFamily: typography.bodyBold, fontSize: fontSize.xl, lineHeight: lineHeight.xl },
  h3: { fontFamily: typography.bodyMedium, fontSize: fontSize.lg, lineHeight: lineHeight.lg },
  body: { fontFamily: typography.body, fontSize: fontSize.base, lineHeight: lineHeight.base },
  bodyMedium: { fontFamily: typography.bodyMedium, fontSize: fontSize.base, lineHeight: lineHeight.base },
  bodyBold: { fontFamily: typography.bodyBold, fontSize: fontSize.base, lineHeight: lineHeight.base },
  small: { fontFamily: typography.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm },
  caption: { fontFamily: typography.bodyMedium, fontSize: fontSize.xs, lineHeight: lineHeight.xs },
  mono: { fontFamily: typography.mono, fontSize: fontSize.base, lineHeight: lineHeight.base },
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
