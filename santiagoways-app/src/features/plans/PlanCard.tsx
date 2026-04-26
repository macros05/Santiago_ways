import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Button } from '@components/Button';
import { colors, radius, shadows, spacing } from '@design/tokens';

export type PlanFeature = {
  text: string;
  included: boolean;
  highlight?: boolean;
};

type Tier = 'free' | 'buen_camino' | 'compostelero';

type Props = {
  tier: Tier;
  title: string;
  subtitle?: string;
  priceLine: string;
  secondaryPrice?: string;
  features: PlanFeature[];
  ctaLabel: string;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  onPressCta: () => void;
  badge?: string;
  delay?: number;
};

const TIER_THEME: Record<
  Tier,
  { bg: ViewStyle; border: string; badgeBg: string; badgeColor: string }
> = {
  free: {
    bg: { backgroundColor: colors.stone900 },
    border: colors.stone700,
    badgeBg: colors.stone800,
    badgeColor: colors.stone300,
  },
  buen_camino: {
    bg: { backgroundColor: colors.stone800 },
    border: colors.amber400,
    badgeBg: colors.amber400,
    badgeColor: colors.stone950,
  },
  compostelero: {
    bg: { backgroundColor: colors.stone900 },
    border: '#FFD700',
    badgeBg: '#FFD700',
    badgeColor: colors.stone950,
  },
};

export function PlanCard({
  tier,
  title,
  subtitle,
  priceLine,
  secondaryPrice,
  features,
  ctaLabel,
  ctaDisabled,
  ctaLoading,
  onPressCta,
  badge,
  delay = 0,
}: Props) {
  const theme = TIER_THEME[tier];
  const isCompostelero = tier === 'compostelero';
  const isBuenCamino = tier === 'buen_camino';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 24 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 18, stiffness: 130, delay }}
      style={[
        styles.card,
        theme.bg,
        { borderColor: theme.border, borderWidth: isBuenCamino || isCompostelero ? 2 : 1 },
        isBuenCamino ? amberGlow : null,
        isCompostelero ? goldGlow : null,
      ]}
    >
      {isCompostelero ? (
        <LinearGradient
          colors={['rgba(255,215,0,0.10)', 'rgba(255,165,0,0.04)']}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {badge ? (
        <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
          <Text variant="caption" color={theme.badgeColor}>
            {badge}
          </Text>
        </View>
      ) : null}

      <View style={{ marginBottom: spacing['3'] }}>
        <Text variant="display" color={colors.cream}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="small" color={colors.stone400} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={{ marginBottom: spacing['5'] }}>
        <Text variant="h1" color={isCompostelero ? '#FFD700' : colors.amber400}>
          {priceLine}
        </Text>
        {secondaryPrice ? (
          <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
            {secondaryPrice}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: spacing['2'], marginBottom: spacing['5'] }}>
        {features.map((f, i) => (
          <FeatureRow key={i} feature={f} highlightTier={tier} />
        ))}
      </View>

      <Button
        label={ctaLabel}
        variant={tier === 'free' ? 'secondary' : 'primary'}
        size="lg"
        fullWidth
        disabled={ctaDisabled}
        loading={ctaLoading}
        onPress={onPressCta}
        style={
          isCompostelero
            ? { backgroundColor: '#FFD700' }
            : undefined
        }
      />
    </MotiView>
  );
}

function FeatureRow({
  feature,
  highlightTier,
}: {
  feature: PlanFeature;
  highlightTier: Tier;
}) {
  let icon: ReactNode;
  let color: string = colors.stone300;
  if (!feature.included) {
    icon = <Ionicons name="close" size={16} color={colors.stone500} />;
    color = colors.stone500;
  } else if (feature.highlight) {
    icon = <Ionicons name="star" size={14} color={highlightTier === 'compostelero' ? '#FFD700' : colors.amber400} />;
    color = colors.cream;
  } else {
    icon = (
      <Ionicons
        name="checkmark"
        size={16}
        color={highlightTier === 'free' ? colors.stone400 : colors.amber400}
      />
    );
    color = colors.stone200;
  }

  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>{icon}</View>
      <Text
        variant="small"
        color={color}
        style={{
          flex: 1,
          textDecorationLine: feature.included ? 'none' : 'line-through',
        }}
      >
        {feature.text}
      </Text>
    </View>
  );
}

const amberGlow: ViewStyle = {
  ...shadows.lg,
  shadowColor: colors.amber400,
};

const goldGlow: ViewStyle = {
  ...shadows.lg,
  shadowColor: '#FFD700',
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing['6'],
    overflow: 'hidden',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    paddingHorizontal: spacing['3'],
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  featureIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
