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

const palette: Record<Variant, { bg: string; fg: string }> = {
  success: { bg: 'rgba(16,185,129,0.15)', fg: colors.success },
  warning: { bg: 'rgba(245,158,11,0.15)', fg: colors.warning },
  error: { bg: 'rgba(239,68,68,0.15)', fg: colors.error },
  info: { bg: 'rgba(59,130,246,0.15)', fg: colors.info },
  gold: { bg: 'rgba(251,191,36,0.18)', fg: colors.amber400 },
  neutral: { bg: colors.stone800, fg: colors.stone300 },
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
        { backgroundColor: c.bg, paddingHorizontal: d.padX, paddingVertical: d.padY },
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
