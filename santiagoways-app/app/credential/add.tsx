import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { useAddStamp } from '@hooks/useCredential';
import { useMyPilgrimage } from '@hooks/usePilgrimage';
import { Analytics } from '@lib/analytics';
import { toast } from '@stores/toast';
import { t } from '@lib/i18n';

// GPS-based stamping flow. We capture the user's current location and pass
// it as both the place coordinates and userLat/userLng — the API enforces
// proximity for `gps` method, so this works only when the user is at the
// place. For other methods (manual / scanned QR) we'd take coordinates
// from the registered point.
export default function AddStampScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const myQ = useMyPilgrimage();
  const add = useAddStamp();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [method, setMethod] = useState<'gps' | 'manual'>('gps');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(async ({ granted }) => {
      if (!granted) return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Falta el nombre del lugar.');
      return;
    }
    if (!coords) {
      toast.error('No tenemos tu ubicación.');
      return;
    }
    setBusy(true);
    try {
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)}-${Date.now()}`;
      await add.mutateAsync({
        pilgrimageId: myQ.data?.id,
        placeSlug: slug,
        placeName: name.trim(),
        city: city.trim() || undefined,
        lat: coords.lat,
        lng: coords.lng,
        method,
        userLat: coords.lat,
        userLng: coords.lng,
      });
      Analytics.credentialStamp(slug, method);
      toast.success('Sello añadido.');
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No pudimos añadir el sello.';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
      <Header title={t('credential.addStamp')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
          {(['gps', 'manual'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMethod(m)}
              style={[
                styles.methodChip,
                {
                  backgroundColor: method === m ? colors.amber400 : colors.stone900,
                  borderColor: method === m ? colors.amber400 : colors.stone700,
                  flex: 1,
                },
              ]}
            >
              <Ionicons
                name={m === 'gps' ? 'location' : 'create-outline'}
                size={16}
                color={method === m ? colors.stone950 : colors.cream}
              />
              <Text variant="caption" color={method === m ? colors.stone950 : colors.cream}>
                {t(`credential.${m}Stamp`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Lugar"
          value={name}
          onChangeText={setName}
          maxLength={120}
          containerStyle={{ marginTop: spacing['6'] }}
        />
        <Input
          label="Ciudad"
          value={city}
          onChangeText={setCity}
          maxLength={80}
          containerStyle={{ marginTop: spacing['4'] }}
        />

        <Card style={{ marginTop: spacing['6'], flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
          <Ionicons name="navigate" size={18} color={colors.amber400} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyBold" color={colors.cream}>Tu ubicación actual</Text>
            <Text variant="caption" color={colors.stone400}>
              {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '...'}
            </Text>
          </View>
        </Card>

        <Button
          label={t('common.save')}
          onPress={submit}
          loading={busy || add.isPending}
          disabled={!coords}
          fullWidth
          style={{ marginTop: spacing['8'] }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  methodChip: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['3'],
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
