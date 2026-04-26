import React, { useEffect, useState } from 'react';
import { TextStyle } from 'react-native';
import { useSharedValue, useAnimatedReaction, runOnJS, withTiming, Easing } from 'react-native-reanimated';
import { Text } from '@design/text';
import { colors } from '@design/tokens';

type Props = {
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  color?: string;
  style?: TextStyle;
};

export function KmCounter({
  value,
  decimals = 1,
  duration = 900,
  suffix = ' km',
  color = colors.cream,
  style,
}: Props) {
  const animated = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animated.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, animated]);

  useAnimatedReaction(
    () => animated.value,
    (current) => {
      runOnJS(setDisplay)(current);
    },
  );

  return (
    <Text variant="display" color={color} style={style}>
      {display.toFixed(decimals)}
      {suffix}
    </Text>
  );
}
