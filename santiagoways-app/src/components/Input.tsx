import React, { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, duration, radius, spacing, typography } from '@design/tokens';
import { Text } from '@design/text';

type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helperText?: string;
  error?: string;
  secure?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, helperText, error, secure, containerStyle, leftIcon, value, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  const labelProgress = useSharedValue(value ? 1 : 0);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(labelProgress.value, [0, 1], [0, -22]) },
      { scale: interpolate(labelProgress.value, [0, 1], [1, 0.85]) },
    ],
    opacity: interpolate(labelProgress.value, [0, 1], [0.6, 1]),
  }));

  const borderColor = error
    ? colors.error
    : focused
    ? colors.amber400
    : colors.stone700;

  return (
    <View style={containerStyle}>
      <View style={[styles.wrapper, { borderColor }]}>
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <View style={styles.inputArea}>
          {label ? (
            <Animated.View style={[styles.labelWrapper, labelStyle]} pointerEvents="none">
              <Text variant="small" color={colors.stone400}>
                {label}
              </Text>
            </Animated.View>
          ) : null}
          <TextInput
            ref={ref}
            {...rest}
            value={value}
            secureTextEntry={hidden}
            onFocus={(e) => {
              setFocused(true);
              labelProgress.value = withTiming(1, { duration: duration.fast });
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              if (!value) labelProgress.value = withTiming(0, { duration: duration.fast });
              onBlur?.(e);
            }}
            placeholderTextColor={colors.stone500}
            style={styles.input}
          />
        </View>
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8} style={styles.icon}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.stone400}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color={colors.error} style={styles.helper}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color={colors.stone400} style={styles.helper}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.stone900,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing['4'],
    minHeight: 56,
  },
  inputArea: {
    flex: 1,
    justifyContent: 'center',
  },
  labelWrapper: {
    position: 'absolute',
    left: 0,
  },
  input: {
    color: colors.cream,
    fontFamily: typography.body,
    fontSize: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  icon: {
    paddingHorizontal: spacing['2'],
  },
  helper: {
    marginTop: spacing['1'],
    marginLeft: spacing['1'],
  },
});
