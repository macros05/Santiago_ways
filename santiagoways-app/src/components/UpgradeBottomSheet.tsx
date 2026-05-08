import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Button } from '@components/Button';
import { BottomSheet } from '@components/BottomSheet';
import { colors, radius, spacing } from '@design/tokens';
import type { Plan } from '@lib/purchases';

const PLAN_LABEL: Record<Plan, string> = {
  free: 'Peregrino',
  buen_camino: 'Buen Camino',
  compostelero: 'Compostelero',
};

type Props = {
  visible: boolean;
  onClose: () => void;
  requiredPlan: Plan;
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  bullets: string[];
};

export function UpgradeBottomSheet({
  visible,
  onClose,
  requiredPlan,
  iconName = 'lock-closed',
  title,
  bullets,
}: Props) {
  const router = useRouter();
  const accent = requiredPlan === 'compostelero' ? colors.gold : colors.amber400;

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[480]}>
      <View style={{ alignItems: 'center', gap: spacing['3'] }}>
        <View style={[styles.iconWrap, { borderColor: accent }]}>
          <Ionicons name={iconName} size={28} color={accent} />
        </View>
        <Text variant="display" align="center" color={colors.cream}>
          {title}
        </Text>
        <Text variant="small" align="center" color={colors.stone400}>
          Plan {PLAN_LABEL[requiredPlan]}
        </Text>
      </View>

      <View style={{ gap: spacing['3'], marginTop: spacing['6'] }}>
        {bullets.map((b, i) => (
          <View key={i} style={styles.bullet}>
            <Ionicons name="checkmark-circle" size={20} color={accent} />
            <Text variant="body" color={colors.stone200} style={{ flex: 1 }}>
              {b}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ gap: spacing['2'], marginTop: spacing['8'] }}>
        <Button
          label="Ver planes"
          variant="primary"
          fullWidth
          onPress={() => {
            onClose();
            setTimeout(() => router.push('/plans'), 200);
          }}
          style={requiredPlan === 'compostelero' ? { backgroundColor: colors.gold } : undefined}
        />
        <Pressable
          style={{ alignItems: 'center', paddingVertical: spacing['3'] }}
          onPress={onClose}
        >
          <Text variant="small" color={colors.stone400}>
            Ahora no
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: colors.modalDim,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
  },
});
