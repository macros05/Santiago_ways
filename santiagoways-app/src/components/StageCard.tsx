import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { animation, colors, radius, shadows, spacing } from '@design/tokens';
import { Text } from '@design/text';
import { Badge } from './Badge';

type StageStatus = 'pending' | 'active' | 'completed';

export type StageCardData = {
  id: string;
  number: number;
  name: string;
  startPoint: string;
  endPoint: string;
  distanceKm: number;
  elevationGain: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  status?: StageStatus;
};

type Props = {
  stage: StageCardData;
  onPress?: () => void;
  style?: ViewStyle;
};

const difficultyVariant = (d: StageCardData['difficulty']) =>
  d === 'easy' ? 'success' : d === 'medium' ? 'warning' : 'error';

export function StageCard({ stage, onPress, style }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98, animation.snappy))}
        onPressOut={() => (scale.value = withSpring(1, animation.snappy))}
        style={styles.card}
      >
        <View style={styles.imageWrap}>
          {stage.imageUrl ? (
            <Image
              source={{ uri: stage.imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <LinearGradient
              colors={[colors.stone800, colors.stone900]}
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(12,10,9,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.imageHeader}>
            <Badge label={`Stage ${stage.number}`} variant="gold" size="sm" />
            {stage.status === 'completed' ? (
              <View style={styles.check}>
                <Ionicons name="checkmark" size={14} color={colors.stone950} />
              </View>
            ) : null}
          </View>
          <View style={styles.imageFooter}>
            <Text variant="h2" color={colors.cream} numberOfLines={1}>
              {stage.name}
            </Text>
            <Text variant="small" color={colors.stone300} numberOfLines={1}>
              {stage.startPoint} → {stage.endPoint}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Stat icon="walk" value={`${stage.distanceKm.toFixed(1)} km`} />
          <Stat icon="trending-up" value={`+${stage.elevationGain} m`} />
          <Badge
            label={stage.difficulty}
            variant={difficultyVariant(stage.difficulty)}
            size="sm"
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Stat({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={colors.stone400} />
      <Text variant="small" color={colors.stone200}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.stone900,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.stone700,
    ...shadows.md,
  },
  imageWrap: {
    height: 160,
    justifyContent: 'space-between',
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing['3'],
  },
  imageFooter: {
    padding: spacing['4'],
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.amber400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['4'],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
