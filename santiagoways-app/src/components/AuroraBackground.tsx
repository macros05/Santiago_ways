import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '@design/tokens';

type AuroraBackgroundProps = {
  /** Where the warm sunrise bloom sits, as a fraction of height (0 = top). */
  bloom?: number;
  /** Dim the whole field for content-heavy screens. */
  subtle?: boolean;
  style?: ViewStyle;
};

/**
 * The app-wide ambient backdrop for "Liquid Dawn". A deep vertical night→ember
 * gradient with two soft colored blooms (cool aurora high, warm sunrise low)
 * that give every screen atmospheric depth behind the glass surfaces.
 *
 * Pure gradient layers — no images, no per-frame work — so it's cheap to mount
 * on any screen as the first child of a flex:1 container.
 */
export function AuroraBackground({ bloom = 0.62, subtle = false, style }: AuroraBackgroundProps) {
  const o = subtle ? 0.5 : 1;
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <LinearGradient
        colors={gradients.dawn}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        locations={[0, 0.32, 0.56, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Cool aurora bloom, upper area */}
      <View
        style={[
          styles.bloom,
          {
            top: '-18%',
            left: '-10%',
            backgroundColor: colors.aurora2,
            opacity: 0.16 * o,
          },
        ]}
      />
      <View
        style={[
          styles.bloom,
          {
            top: '4%',
            right: '-22%',
            backgroundColor: colors.aurora1,
            opacity: 0.14 * o,
          },
        ]}
      />
      {/* Warm sunrise bloom, anchored to `bloom` height */}
      <View
        style={[
          styles.bloom,
          {
            top: `${bloom * 100}%`,
            left: '-5%',
            backgroundColor: colors.horizon,
            opacity: 0.2 * o,
          },
        ]}
      />
      <View
        style={[
          styles.bloomSmall,
          {
            top: `${bloom * 100 + 8}%`,
            right: '-10%',
            backgroundColor: colors.amber500,
            opacity: 0.16 * o,
          },
        ]}
      />
      {/* Melt the bloom edges into a soft, liquid field. */}
      <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(8,7,11,0.18)' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bloom: {
    position: 'absolute',
    width: 460,
    height: 460,
    borderRadius: 230,
    // Large blur radius via shadow to fake a soft radial glow on iOS.
    shadowColor: '#000',
    shadowRadius: 120,
    shadowOpacity: 0,
  },
  bloomSmall: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
});
