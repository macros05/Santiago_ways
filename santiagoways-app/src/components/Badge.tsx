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
  success: { bg: 'rgba(52,211,153,0.14)', fg: colors.success, border: 'rgba(52,211,153,0.30)' },
  warning: { bg: 'rgba(251,191,36,0.14)', fg: colors.warning, border: 'rgba(251,191,36,0.30)' },
  error: { bg: 'rgba(251,113,133,0.14)', fg: colors.error, border: 'rgba(251,113,133,0.30)' },
  info: { bg: 'rgba(96,165,250,0.14)', fg: colors.info, border: 'rgba(96,165,250,0.30)' },
  gold: { bg: colors.glassFillAmber, fg: colors.amber300, border: colors.amberTintStrong },
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
