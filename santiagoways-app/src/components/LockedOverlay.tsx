import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import type { Plan } from '@lib/purchases';

const PLAN_LABEL: Record<Plan, string> = {
  free: 'Peregrino',
  buen_camino: 'Buen Camino',
  compostelero: 'Compostelero',
};

type Props = {
  requiredPlan: Plan;
  message?: string;
  ctaLabel?: string;
  intensity?: number;
  style?: ViewStyle;
  onPress?: () => void;
  borderRadius?: number;
};

export function LockedOverlay({
  requiredPlan,
  message,
  ctaLabel = 'Desbloquear',
  intensity = 24,
  style,
  onPress,
  borderRadius = radius.lg,
}: Props) {
  const router = useRouter();
  const accent = requiredPlan === 'compostelero' ? '#FFD700' : colors.amber400;
  return (
    <Pressable
      onPress={onPress ?? (() => router.push('/plans'))}
      style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }, style]}
    >
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.dim]} />
      <View style={styles.content}>
        <View style={[styles.lockIcon, { borderColor: accent }]}>
          <Ionicons name="lock-closed" size={20} color={accent} />
        </View>
        <Text variant="bodyBold" color={colors.cream} align="center">
          {message ?? `Plan ${PLAN_LABEL[requiredPlan]} requerido`}
        </Text>
        <View style={[styles.cta, { backgroundColor: accent }]}>
          <Text variant="caption" color={colors.stone950}>
            {ctaLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dim: {
    backgroundColor: 'rgba(12,10,9,0.55)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4'],
    gap: spacing['2'],
  },
  lockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cta: {
    marginTop: spacing['2'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
  },
});
