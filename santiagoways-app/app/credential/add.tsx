import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
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

type StampMethod = 'gps' | 'manual' | 'qr';

type ParsedQr = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  city?: string;
};

// Stamp QR format: sw://stamp?slug=...&name=...&lat=...&lng=...[&city=...]
// We only accept the `stamp` host so other sw://… deep links (e.g. routes)
// don't accidentally trigger a credential write.
function parseStampQr(raw: string): ParsedQr | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'sw:') return null;
    if (url.host !== 'stamp') return null;
    const slug = url.searchParams.get('slug');
    const name = url.searchParams.get('name');
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    if (!slug || !name || !lat || !lng) return null;
    const latN = Number(lat);
    const lngN = Number(lng);
    if (!Number.isFinite(latN) || !Number.isFinite(lngN)) return null;
    if (Math.abs(latN) > 90 || Math.abs(lngN) > 180) return null;
    const city = url.searchParams.get('city');
    return { slug, name, lat: latN, lng: lngN, city: city ?? undefined };
  } catch {
    return null;
  }
}

export default function AddStampScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const myQ = useMyPilgrimage();
  const add = useAddStamp();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [method, setMethod] = useState<StampMethod>('gps');
  const [busy, setBusy] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLockRef = useRef(false);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(async ({ granted }) => {
      if (!granted) return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  const submitParsedQr = useCallback(
    async (parsed: ParsedQr) => {
      setBusy(true);
      try {
        await add.mutateAsync({
          pilgrimageId: myQ.data?.id,
          placeSlug: parsed.slug,
          placeName: parsed.name,
          city: parsed.city,
          lat: parsed.lat,
          lng: parsed.lng,
          method: 'qr',
          userLat: coords?.lat,
          userLng: coords?.lng,
        });
        Analytics.credentialStamp(parsed.slug, 'qr');
        toast.success('Sello añadido.');
        router.back();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'No pudimos añadir el sello.';
        toast.error(msg);
      } finally {
        setBusy(false);
      }
    },
    [add, myQ.data?.id, coords, router],
  );

  const onBarcodeScanned = useCallback(
    (result: { data: string }) => {
      if (scanLockRef.current) return;
      const parsed = parseStampQr(result.data);
      if (!parsed) {
        scanLockRef.current = true;
        toast.error(t('credential.add.qr.invalid'));
        setTimeout(() => {
          scanLockRef.current = false;
        }, 1500);
        return;
      }
      scanLockRef.current = true;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScannerOpen(false);
      setName(parsed.name);
      if (parsed.city) setCity(parsed.city);
      void submitParsedQr(parsed);
    },
    [submitParsedQr],
  );

  const openScanner = useCallback(async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        toast.error(t('credential.add.qr.permission'));
        return;
      }
    }
    scanLockRef.current = false;
    setScannerOpen(true);
  }, [permission?.granted, requestPermission]);

  const submitManualOrGps = async () => {
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
        method: method === 'qr' ? 'manual' : method,
        userLat: coords.lat,
        userLng: coords.lng,
      });
      Analytics.credentialStamp(slug, method === 'qr' ? 'manual' : method);
      toast.success('Sello añadido.');
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No pudimos añadir el sello.';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (scannerOpen) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={onBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        <View
          style={{
            position: 'absolute',
            top: insets.top + spacing['2'],
            left: spacing['4'],
            right: spacing['4'],
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={() => setScannerOpen(false)}
            style={styles.scannerClose}
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color={colors.cream} />
          </Pressable>
          <View style={styles.scannerHint}>
            <Text variant="caption" color={colors.cream}>
              {t('credential.add.qr.scanning')}
            </Text>
          </View>
        </View>
        <View style={styles.scannerFrame} pointerEvents="none" />
      </View>
    );
  }

  const methodChips: StampMethod[] = ['gps', 'manual', 'qr'];

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
          {methodChips.map((m) => (
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
                name={m === 'gps' ? 'location' : m === 'manual' ? 'create-outline' : 'qr-code-outline'}
                size={16}
                color={method === m ? colors.stone950 : colors.cream}
              />
              <Text variant="caption" color={method === m ? colors.stone950 : colors.cream}>
                {t(m === 'qr' ? 'credential.method_qr' : `credential.${m}Stamp`)}
              </Text>
            </Pressable>
          ))}
        </View>

        {method === 'qr' ? (
          <Card
            style={{
              marginTop: spacing['6'],
              alignItems: 'center',
              gap: spacing['3'],
              paddingVertical: spacing['6'],
            }}
          >
            <Ionicons name="qr-code-outline" size={48} color={colors.amber400} />
            <Text variant="bodyBold" color={colors.cream}>
              {t('credential.add.qr.button')}
            </Text>
            <Text variant="caption" color={colors.stone400} style={{ textAlign: 'center' }}>
              {t('credential.add.qr.scanning')}
            </Text>
            <Button
              label={t('credential.add.qr.button')}
              onPress={openScanner}
              loading={busy || add.isPending}
              fullWidth
              style={{ marginTop: spacing['3'] }}
            />
          </Card>
        ) : (
          <>
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

            <Card
              style={{
                marginTop: spacing['6'],
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing['3'],
              }}
            >
              <Ionicons name="navigate" size={18} color={colors.amber400} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyBold" color={colors.cream}>
                  Tu ubicación actual
                </Text>
                <Text variant="caption" color={colors.stone400}>
                  {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '...'}
                </Text>
              </View>
            </Card>

            <Button
              label={t('common.save')}
              onPress={submitManualOrGps}
              loading={busy || add.isPending}
              disabled={!coords}
              fullWidth
              style={{ marginTop: spacing['8'] }}
            />
          </>
        )}
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
  scannerClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerHint: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    maxWidth: 240,
  },
  scannerFrame: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    right: '15%',
    bottom: '30%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
  },
});
