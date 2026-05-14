import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT, type Region } from 'react-native-maps';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@components/Avatar';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { Header } from '@components/Header';
import { Skeleton } from '@components/Skeleton';
import { colors, layout, radius, spacing } from '@design/tokens';
import { Text } from '@design/text';
import { useNearbyCompanions, type Companion } from '@hooks/useCompanions';
import { api } from '@lib/api';
import { Analytics } from '@lib/analytics';
import { t } from '@lib/i18n';
import { useAuth, type AuthUser } from '@stores/auth';
import { toast } from '@stores/toast';

type PositionedCompanion = Companion & { currentLat: number; currentLng: number };

function hasPosition(c: Companion): c is PositionedCompanion {
  return c.currentLat != null && c.currentLng != null;
}

const CompanionMarker = memo(function CompanionMarker({ c }: { c: PositionedCompanion }) {
  return (
    <Marker
      coordinate={{ latitude: c.currentLat, longitude: c.currentLng }}
      title={c.name}
      description={`${c.distanceKm.toFixed(1)} km`}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={styles.markerWrap}>
        <Avatar source={c.avatar} name={c.name} size="sm" />
      </View>
    </Marker>
  );
});

export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useAuth();
  const sharing = !!user?.shareLocation;
  const nearbyQ = useNearbyCompanions(sharing);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Analytics.communityNearbyView();
  }, []);

  const toggleShare = useCallback(
    async (next: boolean) => {
      if (busy) return;
      setBusy(true);
      try {
        const updated = await api<AuthUser>('/users/me', {
          method: 'PATCH',
          body: { shareLocation: next },
        });
        setUser(updated);
        if (next) {
          const perm = await Location.requestForegroundPermissionsAsync();
          if (perm.granted) {
            const pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            await api('/users/me/location', {
              method: 'POST',
              body: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            }).catch(() => {});
          }
          nearbyQ.refetch();
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : t('common.error');
        toast.error(msg);
      } finally {
        setBusy(false);
      }
    },
    [busy, setUser, nearbyQ],
  );

  const companions = useMemo(
    () => (nearbyQ.data ?? []).filter(hasPosition),
    [nearbyQ.data],
  );

  const region = useMemo<Region | null>(() => {
    if (companions.length === 0) return null;
    let minLat = companions[0]!.currentLat;
    let maxLat = minLat;
    let minLng = companions[0]!.currentLng;
    let maxLng = minLng;
    for (const c of companions) {
      if (c.currentLat < minLat) minLat = c.currentLat;
      if (c.currentLat > maxLat) maxLat = c.currentLat;
      if (c.currentLng < minLng) minLng = c.currentLng;
      if (c.currentLng > maxLng) maxLng = c.currentLng;
    }
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.6),
      longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.6),
    };
  }, [companions]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Header title={t('community.nearby.title')} onBack={() => router.back()} />

      <View style={[styles.toggleRow, { paddingTop: insets.top + 72 }]}>
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold" color={colors.cream}>
            {t('community.nearby.toggleShare')}
          </Text>
          <Text variant="caption" color={colors.stone400}>
            {t('community.nearby.toggleSubtitle')}
          </Text>
        </View>
        <Switch
          value={sharing}
          onValueChange={toggleShare}
          disabled={busy}
          trackColor={{ true: colors.amber400, false: colors.stone700 }}
          thumbColor={colors.cream}
        />
      </View>

      {!sharing ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color={colors.stone600} />
          <Text
            variant="bodyMedium"
            color={colors.cream}
            style={{ textAlign: 'center', marginTop: spacing['4'] }}
          >
            {t('community.nearby.empty.title')}
          </Text>
          <Text
            variant="caption"
            color={colors.stone400}
            style={{ textAlign: 'center', marginTop: spacing['2'] }}
          >
            {t('community.nearby.empty.body')}
          </Text>
          <Button
            label={t('community.nearby.empty.cta')}
            onPress={() => toggleShare(true)}
            loading={busy}
            style={{ marginTop: spacing['6'] }}
          />
        </View>
      ) : (
        <>
          <View style={styles.mapWrap}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFill}
              showsUserLocation
              region={region ?? undefined}
              initialRegion={
                region ?? {
                  latitude: 42.8,
                  longitude: -5.5,
                  latitudeDelta: 5,
                  longitudeDelta: 5,
                }
              }
            >
              {companions.map((c) => (
                <CompanionMarker key={c.id} c={c} />
              ))}
            </MapView>
          </View>

          <FlashList<PositionedCompanion>
            data={companions}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{
              paddingHorizontal: spacing['5'],
              paddingTop: spacing['4'],
              paddingBottom: layout.tabBarHeight + insets.bottom + spacing['8'],
            }}
            ItemSeparatorComponent={() => <View style={{ height: spacing['3'] }} />}
            ListEmptyComponent={
              nearbyQ.isLoading ? (
                <View style={{ gap: spacing['3'] }}>
                  <Skeleton height={68} borderRadius={radius.lg} />
                  <Skeleton height={68} borderRadius={radius.lg} />
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: spacing['6'] }}>
                  <Ionicons name="moon-outline" size={40} color={colors.stone600} />
                  <Text
                    variant="bodyMedium"
                    color={colors.stone400}
                    style={{ marginTop: spacing['3'] }}
                  >
                    {t('community.nearby.none')}
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => <CompanionRow companion={item} />}
          />
        </>
      )}
    </View>
  );
}

const CompanionRow = memo(function CompanionRow({ companion }: { companion: PositionedCompanion }) {
  return (
    <Card padding="3">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
        <Avatar source={companion.avatar} name={companion.name} size="md" />
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold" color={colors.cream}>
            {companion.name}
          </Text>
          <Text variant="caption" color={colors.stone400}>
            @{companion.username}
            {companion.currentStageName ? ` · ${companion.currentStageName}` : ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="bodyBold" color={colors.amber400}>
            {companion.distanceKm.toFixed(1)} km
          </Text>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['4'],
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: spacing['8'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapWrap: {
    height: 320,
    marginHorizontal: spacing['5'],
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.stone800,
  },
  markerWrap: {
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.amber400,
    padding: 2,
    backgroundColor: colors.stone950,
  },
});
