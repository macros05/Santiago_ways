import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '@design/tokens';

type Elevation = 'flat' | 'raised' | 'floating';

type CardProps = ViewProps & {
  elevation?: Elevation;
  padding?: keyof typeof spacing | 0;
  style?: ViewStyle;
};

const elevationStyle: Record<Elevation, ViewStyle> = {
  flat: { borderWidth: 1, borderColor: colors.stone700 },
  raised: { ...shadows.md, borderWidth: 1, borderColor: colors.stone700 },
  floating: { ...shadows.lg },
};

export function Card({
  elevation = 'flat',
  padding = '4',
  style,
  children,
  ...rest
}: CardProps) {
  const padValue = padding === 0 ? 0 : spacing[padding];
  return (
    <View
      {...rest}
      style={[
        styles.base,
        elevationStyle[elevation],
        { padding: padValue },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.stone900,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
