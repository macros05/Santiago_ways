import React, { useCallback, useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { animation, colors, radius, spacing } from '@design/tokens';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  snapPoints?: number[]; // heights from bottom in px; use [0.5*H, 0.9*H] etc
  children: React.ReactNode;
  style?: ViewStyle;
};

export function BottomSheet({
  visible,
  onClose,
  snapPoints = [SCREEN_HEIGHT * 0.5],
  children,
  style,
}: BottomSheetProps) {
  const maxSnap = Math.max(...snapPoints);
  const sheetHeight = maxSnap;
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const closeSheet = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(SCREEN_HEIGHT - maxSnap, animation.gentle);
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, animation.gentle);
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, maxSnap, translateY, backdropOpacity]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const next = SCREEN_HEIGHT - maxSnap + e.translationY;
      translateY.value = Math.max(SCREEN_HEIGHT - maxSnap, next);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withSpring(SCREEN_HEIGHT, animation.snappy);
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(closeSheet)();
      } else {
        translateY.value = withSpring(SCREEN_HEIGHT - maxSnap, animation.gentle);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible && translateY.value >= SCREEN_HEIGHT) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.dim} />
        </Pressable>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, { height: sheetHeight }, sheetStyle, style]}>
          <View style={styles.handle} />
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.stone900,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.stone700,
    paddingTop: spacing['3'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.stone600,
    marginBottom: spacing['3'],
  },
  content: {
    flex: 1,
    padding: spacing['5'],
  },
});
