import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@design/tokens';

export type MarkerType =
  | 'albergue'
  | 'waypoint'
  | 'pilgrim'
  | 'danger'
  | 'church'
  | 'fountain'
  | 'viewpoint'
  | 'bar'
  | 'info';

const ICON: Record<MarkerType, keyof typeof Ionicons.glyphMap> = {
  albergue: 'bed',
  waypoint: 'flag',
  pilgrim: 'walk',
  danger: 'warning',
  church: 'business',
  fountain: 'water',
  viewpoint: 'eye',
  bar: 'cafe',
  info: 'information-circle',
};

const TINT: Record<MarkerType, string> = {
  albergue: colors.amber400,
  waypoint: colors.cream,
  pilgrim: colors.amber400,
  danger: colors.error,
  church: colors.info,
  fountain: colors.info,
  viewpoint: colors.success,
  bar: colors.warning,
  info: colors.stone300,
};

type Props = {
  type: MarkerType;
  size?: number;
  pulse?: boolean;
};

export function MapMarker({ type, size = 36, pulse }: Props) {
  const pulseValue = useSharedValue(0);

  useEffect(() => {
    if (pulse) {
      pulseValue.value = withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      );
    }
  }, [pulse, pulseValue]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulseValue.value * 1.4 }],
    opacity: 1 - pulseValue.value,
  }));

  const tint = TINT[type];

  return (
    <View style={{ width: size * 1.8, height: size * 1.8, alignItems: 'center', justifyContent: 'center' }}>
      {pulse ? (
        <Animated.View
          style={[
            styles.pulse,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: tint },
            pulseStyle,
          ]}
        />
      ) : null}
      <View
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.ink,
            borderColor: tint,
          },
        ]}
      >
        <Ionicons name={ICON[type]} size={size * 0.5} color={tint} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulse: {
    position: 'absolute',
  },
  bubble: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
});
