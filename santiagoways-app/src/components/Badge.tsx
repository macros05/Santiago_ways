import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@design/tokens';
import { Text } from '@design/text';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'gold' | 'neutral';
type Size = 'sm' | 'md';

type BadgeProps = {
  label: string;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
};

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  success: { bg: 'rgba(79,122,82,0.14)', fg: colors.success, border: 'rgba(79,122,82,0.30)' },
  warning: { bg: 'rgba(199,125,74,0.14)', fg: colors.warning, border: 'rgba(199,125,74,0.30)' },
  error: { bg: 'rgba(194,85,61,0.14)', fg: colors.error, border: 'rgba(194,85,61,0.30)' },
  info: { bg: 'rgba(168,162,158,0.14)', fg: colors.info, border: 'rgba(168,162,158,0.30)' },
  gold: { bg: colors.goldTintSoft, fg: colors.gold, border: colors.goldTintStrong },
  neutral: { bg: colors.glassFill, fg: colors.stone300, border: colors.glassBorder },
};

const dims: Record<Size, { padX: number; padY: number; font: 'caption' | 'small' }> = {
  sm: { padX: spacing['2'], padY: 2, font: 'caption' },
  md: { padX: spacing['3'], padY: 4, font: 'small' },
};

export function Badge({ label, variant = 'neutral', size = 'sm', style }: BadgeProps) {
  const c = palette[variant];
  const d = dims[size];
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: c.bg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.border,
          paddingHorizontal: d.padX,
          paddingVertical: d.padY,
        },
        style,
      ]}
    >
      <Text variant={d.font} color={c.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
});
