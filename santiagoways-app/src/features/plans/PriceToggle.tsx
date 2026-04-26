import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '@design/text';
import { animation, colors, radius, spacing } from '@design/tokens';

export type Period = 'monthly' | 'annual';

type Props = {
  value: Period;
  onChange: (next: Period) => void;
  savingsLabel?: string;
};

const TRACK_W = 280;
const PILL_W = TRACK_W / 2;

export function PriceToggle({ value, onChange, savingsLabel }: Props) {
  const offset = useSharedValue(value === 'annual' ? PILL_W : 0);

  useEffect(() => {
    offset.value = withSpring(value === 'annual' ? PILL_W : 0, animation.snappy);
  }, [value, offset]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const handle = (p: Period) => {
    Haptics.selectionAsync().catch(() => {});
    onChange(p);
  };

  return (
    <View style={{ alignItems: 'center', gap: spacing['2'] }}>
      <View style={styles.track}>
        <Animated.View style={[styles.pill, pillStyle]} />
        <Pressable style={styles.option} onPress={() => handle('monthly')}>
          <Text
            variant="bodyBold"
            color={value === 'monthly' ? colors.stone950 : colors.stone300}
          >
            Mensual
          </Text>
        </Pressable>
        <Pressable style={styles.option} onPress={() => handle('annual')}>
          <Text
            variant="bodyBold"
            color={value === 'annual' ? colors.stone950 : colors.stone300}
          >
            Anual
          </Text>
        </Pressable>
      </View>
      {savingsLabel && value === 'annual' ? (
        <Text variant="caption" color={colors.amber400}>
          {savingsLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.stone900,
    borderWidth: 1,
    borderColor: colors.stone700,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: PILL_W - 4,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.amber400,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
