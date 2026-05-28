import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { colors, layout, spacing } from '@design/tokens';
import { Text } from '@design/text';

type HeaderProps = {
  title?: string;
  leftAction?: React.ReactNode | 'back';
  onBack?: () => void;
  rightAction?: React.ReactNode;
  blur?: boolean;
  scrollY?: SharedValue<number>;
  style?: ViewStyle;
};

export function Header({
  title,
  leftAction = 'back',
  onBack,
  rightAction,
  blur = true,
  scrollY,
  style,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const titleOpacity = useAnimatedStyle(() => ({
    opacity: scrollY ? Math.min(1, Math.max(0, (scrollY.value - 40) / 40)) : 1,
  }));

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }, style]}>
      {blur ? (
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink }]} />
      )}
      <View style={[styles.bar, { height: layout.headerHeight }]}>
        <View style={styles.side}>
          {leftAction === 'back' ? (
            <Pressable onPress={onBack} hitSlop={12} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={26} color={colors.cream} />
            </Pressable>
          ) : (
            leftAction
          )}
        </View>

        <Animated.View style={[styles.title, titleOpacity]} pointerEvents="none">
          {title ? (
            <Text variant="bodyBold" color={colors.cream} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
        </Animated.View>

        <View style={[styles.side, { alignItems: 'flex-end' }]}>{rightAction}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['3'],
  },
  side: {
    width: 60,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
