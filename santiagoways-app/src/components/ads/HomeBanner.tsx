import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { useShowAds } from '@hooks/useSubscription';

type Sponsorship = {
  id: string;
  title: string;
  subtitle: string;
  ctaUrl: string;
  imageUrl?: string;
  accent?: string;
};

const SPONSORSHIPS: Sponsorship[] = [
  {
    id: 'gear-1',
    title: 'Botas Camino · Salomon X Ultra 4',
    subtitle: 'Para 800 km de Meseta. Envío gratis.',
    ctaUrl: 'https://santiagoways.app/r/salomon',
    accent: '#8B5CF6',
  },
  {
    id: 'insurance-1',
    title: 'Seguro Camino · IATI Estrella',
    subtitle: 'Cobertura completa desde 2,90€/día.',
    ctaUrl: 'https://santiagoways.app/r/iati',
    accent: '#10B981',
  },
  {
    id: 'guide-1',
    title: 'Guía oficial Buen Camino',
    subtitle: 'Albergues y consejos de la Asociación de Amigos.',
    ctaUrl: 'https://santiagoways.app/r/guidebook',
    accent: '#F97316',
  },
];

function pickAd(): Sponsorship {
  const idx = new Date().getDate() % SPONSORSHIPS.length;
  return SPONSORSHIPS[idx]!;
}

export function HomeBanner() {
  const showAds = useShowAds();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  if (!showAds || dismissed) return null;

  const ad = pickAd();

  return (
    <View style={{ paddingHorizontal: spacing['5'] }}>
      <Pressable
        onPress={() => Linking.openURL(ad.ctaUrl).catch(() => {})}
        style={[styles.banner, { borderLeftColor: ad.accent ?? colors.amber400 }]}
      >
        {ad.imageUrl ? (
          <Image source={{ uri: ad.imageUrl }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, { backgroundColor: ad.accent ?? colors.amber400, opacity: 0.18 }]}>
            <Ionicons name="star" size={20} color={ad.accent ?? colors.amber400} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold" color={colors.cream} numberOfLines={1}>
            {ad.title}
          </Text>
          <Text variant="caption" color={colors.stone400} numberOfLines={2}>
            {ad.subtitle}
          </Text>
        </View>
        <Pressable
          hitSlop={10}
          onPress={() => setDismissed(true)}
          style={styles.dismiss}
        >
          <Ionicons name="close" size={16} color={colors.stone400} />
        </Pressable>
      </Pressable>
      <View style={styles.footerRow}>
        <Text variant="caption" color={colors.stone500}>
          Publicidad
        </Text>
        <Pressable hitSlop={6} onPress={() => router.push('/plans')}>
          <Text variant="caption" color={colors.amber400}>
            Eliminar anuncios →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 80,
    backgroundColor: colors.stone900,
    borderWidth: 1,
    borderColor: colors.stone700,
    borderLeftWidth: 3,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing['3'],
    paddingLeft: spacing['3'],
    gap: spacing['3'],
    overflow: 'hidden',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismiss: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.stone800,
  },
  footerRow: {
    marginTop: spacing['1'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['1'],
  },
});
