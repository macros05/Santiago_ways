import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { colors, radius, shadows, spacing } from '@design/tokens';
import type { FeaturedAlbergue } from '@hooks/useFeaturedAlbergues';

type Props = {
  albergue: FeaturedAlbergue;
};

export function FeaturedAlbergueCard({ albergue }: Props) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/albergue/${albergue.id}`)}>
      <Card
        elevation="floating"
        padding={0}
        style={styles.card}
      >
        {albergue.imageUrl ? (
          <Image
            source={{ uri: albergue.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <LinearGradient
            colors={[colors.stone800, colors.stone900]}
            style={styles.image}
          />
        )}
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={11} color={colors.stone950} />
          <Text variant="caption" color={colors.stone950}>
            Destacado
          </Text>
        </View>
        <View style={styles.body}>
          <Text variant="bodyBold" color={colors.cream} numberOfLines={1}>
            {albergue.name}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={12} color={colors.stone400} />
            <Text variant="caption" color={colors.stone400}>
              {albergue.city}
            </Text>
          </View>
          <View style={styles.metaRow}>
            {albergue.pricePerNight != null ? (
              <Text variant="bodyMedium" color={colors.amber400}>
                €{albergue.pricePerNight.toFixed(0)}/noche
              </Text>
            ) : null}
            {albergue.ratingAvg != null ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="star" size={12} color={colors.amber400} />
                <Text variant="caption" color={colors.stone300}>
                  {albergue.ratingAvg.toFixed(1)} ({albergue.ratingCount})
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.amber400,
    borderWidth: 1,
    ...shadows.md,
    shadowColor: colors.amber400,
  },
  image: {
    width: '100%',
    height: 140,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing['3'],
    left: spacing['3'],
    backgroundColor: colors.amber400,
    paddingHorizontal: spacing['2'],
    paddingVertical: 4,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  body: {
    padding: spacing['4'],
    gap: spacing['1'],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: 2,
  },
});
