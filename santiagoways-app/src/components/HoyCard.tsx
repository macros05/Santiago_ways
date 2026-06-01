// src/components/HoyCard.tsx
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';

type Props = {
  quote: string;
  weather?: { label: string; tempC: number } | null;
};

/** One calm "Hoy" card: a Fraunces pull-quote + a small green weather meta line.
 *  Replaces the three stacked widgets (quote, weather, daily tip). */
export function HoyCard({ quote, weather }: Props) {
  return (
    <View style={{ paddingHorizontal: spacing['5'], marginTop: spacing['6'] }}>
      <Card padding="4">
        <Text variant="display" color={colors.cream} italic style={{ fontSize: 20, lineHeight: 28 }}>
          {quote}
        </Text>
        {weather ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'], marginTop: spacing['3'] }}>
            <Ionicons name="partly-sunny-outline" size={14} color={colors.musgo} />
            <Text variant="caption" color={colors.musgo}>
              {weather.label} · {weather.tempC.toFixed(0)}°C
            </Text>
          </View>
        ) : null}
      </Card>
    </View>
  );
}
