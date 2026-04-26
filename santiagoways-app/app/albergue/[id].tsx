import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Text } from '@design/text';
import { Card } from '@components/Card';
import { Badge } from '@components/Badge';
import { Button } from '@components/Button';
import { Avatar } from '@components/Avatar';
import { Skeleton } from '@components/Skeleton';
import { colors, radius, spacing } from '@design/tokens';
import { api } from '@lib/api';

type Albergue = {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  pricePerNight: number | null;
  totalBeds: number | null;
  amenities: string[];
  description: string | null;
  imageUrl: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { name: string; username: string; avatar: string | null };
  }>;
};

const AMENITY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  wifi: 'wifi',
  kitchen: 'restaurant-outline',
  laundry: 'shirt-outline',
  breakfast: 'cafe',
  'pilgrim-meal': 'pizza-outline',
  donativo: 'heart',
  pool: 'water',
};

export default function AlbergueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const albergueQ = useQuery({
    queryKey: ['albergue', id],
    queryFn: () => api<Albergue>(`/albergues/${id}`),
    enabled: !!id,
  });
  const a = albergueQ.data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Header onBack={() => router.back()} title={a?.name} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing['16'] }}>
        <View style={styles.hero}>
          {a?.imageUrl ? (
            <Image source={{ uri: a.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient colors={[colors.stone800, colors.stone900]} style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={['rgba(12,10,9,0.2)', 'rgba(12,10,9,0.95)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroFooter}>
            {a ? (
              <>
                <Badge label={a.type} variant="gold" />
                <Text variant="display" color={colors.cream} style={{ marginTop: spacing['3'] }}>
                  {a.name}
                </Text>
                <Text variant="body" color={colors.stone300} style={{ marginTop: 4 }}>
                  {a.address}, {a.city}
                </Text>
              </>
            ) : (
              <Skeleton height={64} />
            )}
          </View>
        </View>

        <View style={{ padding: spacing['5'], gap: spacing['4'] }}>
          {a ? (
            <Card style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Stat label="Precio" value={a.pricePerNight === 0 ? 'Donativo' : a.pricePerNight ? `${a.pricePerNight}€` : '—'} />
              <Stat label="Camas" value={String(a.totalBeds ?? '—')} />
              <Stat label="Rating" value={a.ratingAvg ? a.ratingAvg.toFixed(1) : '—'} />
            </Card>
          ) : null}

          {a?.description ? (
            <Text variant="body" color={colors.stone200}>{a.description}</Text>
          ) : null}

          <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['4'] }}>Servicios</Text>
          <View style={styles.amenities}>
            {(a?.amenities ?? []).map((am) => (
              <View key={am} style={styles.amenity}>
                <Ionicons name={AMENITY_ICON[am] ?? 'checkmark-circle'} size={18} color={colors.amber400} />
                <Text variant="small" color={colors.stone200}>{am}</Text>
              </View>
            ))}
          </View>

          <Button
            label="Comprobar disponibilidad"
            fullWidth
            style={{ marginTop: spacing['3'] }}
            onPress={() => null}
          />

          <Text variant="h2" color={colors.cream} style={{ marginTop: spacing['6'] }}>Opiniones</Text>
          {(a?.reviews ?? []).length === 0 ? (
            <Text variant="small" color={colors.stone400}>Aún no hay opiniones.</Text>
          ) : (
            (a?.reviews ?? []).map((r) => (
              <Card key={r.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                  <Avatar source={r.user.avatar} name={r.user.name} size="sm" />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" color={colors.cream}>{r.user.name}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Ionicons key={i} name="star" size={14} color={colors.amber400} />
                      ))}
                    </View>
                  </View>
                </View>
                {r.comment ? (
                  <Text variant="body" color={colors.stone300} style={{ marginTop: spacing['3'] }}>
                    {r.comment}
                  </Text>
                ) : null}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text variant="caption" color={colors.stone400}>{label}</Text>
      <Text variant="bodyBold" color={colors.cream} style={{ marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 280,
    justifyContent: 'flex-end',
  },
  heroFooter: {
    padding: spacing['5'],
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.stone900,
    borderColor: colors.stone700,
    borderWidth: 1,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
  },
});
