import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { animation, colors, gradients, layout, spacing } from '@design/tokens';
import { Text } from '@design/text';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  explore: { active: 'compass', inactive: 'compass-outline' },
  route: { active: 'trail-sign', inactive: 'trail-sign-outline' },
  map: { active: 'map', inactive: 'map-outline' },
  community: { active: 'people', inactive: 'people-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

type TabBarProps = BottomTabBarProps & {
  hidden?: SharedValue<number>; // 0 visible, 1 hidden
};

export function TabBar({ state, descriptors, navigation, hidden }: TabBarProps) {
  const insets = useSafeAreaInsets();

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: hidden ? hidden.value * (layout.tabBarHeight + insets.bottom + 16) : 0,
      },
    ],
    opacity: hidden ? 1 - hidden.value : 1,
  }));

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { paddingBottom: insets.bottom, height: layout.tabBarHeight + insets.bottom },
        wrapperStyle,
      ]}
    >
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
      {/* Top light-catching hairline */}
      <LinearGradient
        colors={[colors.glassHighlight, 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topHairline}
        pointerEvents="none"
      />
      <View style={styles.row}>
        {state.routes.map((route, idx) => {
          const { options } = descriptors[route.key]!;
          const focused = state.index === idx;
          const label = (options.tabBarLabel as string) ?? options.title ?? route.name;
          const iconKey = route.name.toLowerCase();
          const icons = ICONS[iconKey] ?? ICONS.explore!;
          const iconName = focused ? icons.active : icons.inactive;
          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={label}
              iconName={iconName}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

type TabItemProps = {
  focused: boolean;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function TabItem({ focused, label, iconName, onPress }: TabItemProps) {
  const scale = useSharedValue(focused ? 1.05 : 1);
  useEffect(() => {
    scale.value = withSpring(focused ? 1.06 : 1, animation.bouncy);
  }, [focused, scale]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: 220 }),
    transform: [{ scale: withSpring(focused ? 1 : 0.6, animation.gentle) }],
  }));

  const itemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.item} hitSlop={8}>
      <Animated.View style={[styles.itemInner, itemStyle]}>
        <View style={styles.iconWrap}>
          <Animated.View style={[styles.pill, pillStyle]}>
            <LinearGradient
              colors={gradients.sunrise}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Ionicons
            name={iconName}
            size={22}
            color={focused ? colors.stone950 : colors.stone400}
          />
        </View>
        <Text
          variant="caption"
          color={focused ? colors.amber300 : colors.stone500}
          style={{ marginTop: 3 }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  tint: {
    backgroundColor: 'rgba(8,7,11,0.55)',
  },
  topHairline: {
    position: 'absolute',
    top: 0,
    left: '6%',
    right: '6%',
    height: 1.5,
    opacity: 0.6,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing['2'],
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2'],
  },
  iconWrap: {
    width: 46,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
