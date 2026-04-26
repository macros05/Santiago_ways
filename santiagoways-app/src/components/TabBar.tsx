import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
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
import { animation, colors, layout, spacing } from '@design/tokens';
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
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
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
    scale.value = withSpring(focused ? 1.08 : 1, animation.bouncy);
  }, [focused, scale]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
  }));

  const itemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.item} hitSlop={8}>
      <Animated.View style={[styles.itemInner, itemStyle]}>
        <Ionicons
          name={iconName}
          size={22}
          color={focused ? colors.amber400 : colors.stone400}
        />
        <Text
          variant="caption"
          color={focused ? colors.amber400 : colors.stone400}
          style={{ marginTop: 2 }}
        >
          {label}
        </Text>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
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
    borderColor: colors.stone800,
    backgroundColor: 'rgba(12,10,9,0.6)',
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
  indicator: {
    marginTop: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.amber400,
  },
});
