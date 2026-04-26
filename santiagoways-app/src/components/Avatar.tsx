import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '@design/tokens';
import { Text } from '@design/text';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<Size, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };
const fontSizes: Record<Size, number> = { xs: 10, sm: 12, md: 14, lg: 18, xl: 28 };

type AvatarProps = {
  source?: string | null;
  name?: string;
  size?: Size;
  online?: boolean;
  style?: ViewStyle;
};

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

export function Avatar({ source, name, size = 'md', online, style }: AvatarProps) {
  const dim = sizes[size];
  const dotSize = Math.max(8, dim * 0.22);

  return (
    <View
      style={[
        { width: dim, height: dim, borderRadius: radius.full },
        styles.wrapper,
        style,
      ]}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={{ width: dim, height: dim, borderRadius: radius.full }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <LinearGradient
          colors={[colors.amber300, colors.amber500]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fallback, { width: dim, height: dim, borderRadius: radius.full }]}
        >
          <Text
            variant="bodyBold"
            color={colors.stone950}
            style={{ fontSize: fontSizes[size] }}
          >
            {initials(name)}
          </Text>
        </LinearGradient>
      )}
      {online ? (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderWidth: Math.max(1, dotSize * 0.18),
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.stone800,
    overflow: 'visible',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    borderColor: colors.stone950,
  },
});
