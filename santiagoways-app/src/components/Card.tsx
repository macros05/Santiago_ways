import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '@design/tokens';
import { Glass } from './Glass';

type Elevation = 'flat' | 'raised' | 'floating' | 'glass';

type CardProps = Omit<ViewProps, 'style'> & {
  elevation?: Elevation;
  padding?: keyof typeof spacing | 0;
  style?: StyleProp<ViewStyle>;
};

const solidStyle: Record<Exclude<Elevation, 'glass'>, ViewStyle> = {
  flat: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassBorder },
  raised: { ...shadows.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassBorder },
  floating: { ...shadows.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassBorder },
};

/**
 * Surface primitive. `flat`/`raised`/`floating` render an opaque elevated
 * surface; `glass` delegates to the frosted <Glass> material for hero contexts.
 */
export function Card({
  elevation = 'flat',
  padding = '4',
  style,
  children,
  ...rest
}: CardProps) {
  const padValue = padding === 0 ? 0 : spacing[padding];

  if (elevation === 'glass') {
    return (
      <Glass radius="xl" elevation="md" style={style as ViewStyle}>
        <View style={{ padding: padValue }}>{children}</View>
      </Glass>
    );
  }

  return (
    <View
      {...rest}
      style={[styles.base, solidStyle[elevation], { padding: padValue }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.stone900,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
});
