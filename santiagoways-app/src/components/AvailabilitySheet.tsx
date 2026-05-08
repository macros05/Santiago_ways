import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@design/text';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { BottomSheet } from '@components/BottomSheet';
import { colors, radius, spacing } from '@design/tokens';
import { api, ApiError } from '@lib/api';

type Props = {
  visible: boolean;
  onClose: () => void;
  albergueId: string;
  albergueName: string;
  city?: string;
  pricePerNight?: number | null;
};

type AvailabilityRoom = {
  name: string | null;
  price: number | null;
  currency: string;
  availability: number | null;
};

type AvailabilityResponse =
  | { configured: false; message: string }
  | {
      configured: true;
      checkin: string;
      checkout: string;
      guests: number;
      rooms: AvailabilityRoom[];
    };

const NIGHTS_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;
const GUEST_MIN = 1;
const GUEST_MAX = 8;

function isoDate(d: Date): string {
  // YYYY-MM-DD in local time — matches what the booking API expects.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

function shortDayLabel(d: Date): string {
  return d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
}

function bookingFallbackUrl(opts: {
  city?: string;
  checkin: string;
  checkout: string;
  guests: number;
}): string {
  const params = new URLSearchParams({
    ss: opts.city ?? 'Camino de Santiago',
    checkin: opts.checkin,
    checkout: opts.checkout,
    group_adults: String(opts.guests),
    no_rooms: '1',
    group_children: '0',
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function AvailabilitySheet({
  visible,
  onClose,
  albergueId,
  albergueName,
  city,
  pricePerNight,
}: Props) {
  const [checkinOffset, setCheckinOffset] = useState(0);
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AvailabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state every time the sheet is opened so old results don't bleed
  // into a fresh check on a different date.
  useEffect(() => {
    if (visible) {
      setResult(null);
      setError(null);
      setLoading(false);
    }
  }, [visible]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  const checkinDate = useMemo(() => addDays(today, checkinOffset), [today, checkinOffset]);
  const checkoutDate = useMemo(() => addDays(checkinDate, nights), [checkinDate, nights]);

  const dayChips = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ offset: i, date: addDays(today, i) })),
    [today],
  );

  const estimatedTotal =
    pricePerNight != null && pricePerNight > 0 ? pricePerNight * nights * guests : null;

  const check = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api<AvailabilityResponse>(`/albergues/${albergueId}/availability`, {
        query: {
          checkin: isoDate(checkinDate),
          checkout: isoDate(checkoutDate),
          guests,
        },
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No pudimos comprobar la disponibilidad.');
    } finally {
      setLoading(false);
    }
  };

  const openBooking = () => {
    Linking.openURL(
      bookingFallbackUrl({
        city,
        checkin: isoDate(checkinDate),
        checkout: isoDate(checkoutDate),
        guests,
      }),
    ).catch(() => undefined);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[640]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="h2" color={colors.cream}>
          Disponibilidad
        </Text>
        <Text variant="small" color={colors.stone400} style={{ marginTop: 4 }}>
          {albergueName}
        </Text>

        <Text variant="bodyMedium" color={colors.cream} style={{ marginTop: spacing['5'] }}>
          Llegada
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing['2'], paddingVertical: spacing['2'] }}
        >
          {dayChips.map(({ offset, date }) => {
            const active = offset === checkinOffset;
            return (
              <Pressable key={offset} onPress={() => setCheckinOffset(offset)}>
                <View
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: active ? colors.amber400 : colors.stone900,
                      borderColor: active ? colors.amber400 : colors.stone700,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    color={active ? colors.stone950 : colors.stone400}
                  >
                    {offset === 0 ? 'Hoy' : shortDayLabel(date)}
                  </Text>
                  <Text
                    variant="bodyBold"
                    color={active ? colors.stone950 : colors.cream}
                    style={{ marginTop: 2 }}
                  >
                    {date.getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text variant="bodyMedium" color={colors.cream} style={{ marginTop: spacing['4'] }}>
          Noches
        </Text>
        <View style={styles.chipsRow}>
          {NIGHTS_OPTIONS.map((n) => {
            const active = n === nights;
            return (
              <Pressable key={n} onPress={() => setNights(n)}>
                <View
                  style={[
                    styles.smallChip,
                    {
                      backgroundColor: active ? colors.amber400 : colors.stone900,
                      borderColor: active ? colors.amber400 : colors.stone700,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    color={active ? colors.stone950 : colors.cream}
                  >
                    {n}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text variant="bodyMedium" color={colors.cream} style={{ marginTop: spacing['4'] }}>
          Personas
        </Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setGuests((g) => Math.max(GUEST_MIN, g - 1))}
            disabled={guests <= GUEST_MIN}
            style={[styles.stepBtn, { opacity: guests <= GUEST_MIN ? 0.4 : 1 }]}
          >
            <Ionicons name="remove" size={18} color={colors.cream} />
          </Pressable>
          <Text variant="h2" color={colors.cream} style={{ minWidth: 32, textAlign: 'center' }}>
            {guests}
          </Text>
          <Pressable
            onPress={() => setGuests((g) => Math.min(GUEST_MAX, g + 1))}
            disabled={guests >= GUEST_MAX}
            style={[styles.stepBtn, { opacity: guests >= GUEST_MAX ? 0.4 : 1 }]}
          >
            <Ionicons name="add" size={18} color={colors.cream} />
          </Pressable>
        </View>

        <View style={styles.summary}>
          <Text variant="caption" color={colors.stone400}>
            {isoDate(checkinDate)} → {isoDate(checkoutDate)}
          </Text>
          {estimatedTotal != null ? (
            <Text variant="caption" color={colors.amber400}>
              ≈ {estimatedTotal.toFixed(0)}€
            </Text>
          ) : null}
        </View>

        <Button
          label={loading ? 'Comprobando…' : 'Comprobar disponibilidad'}
          fullWidth
          loading={loading}
          onPress={check}
          style={{ marginTop: spacing['4'] }}
        />

        {error ? (
          <Card style={styles.resultCard}>
            <View style={{ flexDirection: 'row', gap: spacing['2'], alignItems: 'center' }}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text variant="bodyMedium" color={colors.cream}>
                {error}
              </Text>
            </View>
            <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
              Puedes seguir buscando este albergue en Booking.com.
            </Text>
            <Button
              label="Buscar en Booking.com"
              variant="secondary"
              fullWidth
              onPress={openBooking}
              style={{ marginTop: spacing['3'] }}
            />
          </Card>
        ) : null}

        {result && !error ? (
          <Card style={styles.resultCard}>
            {result.configured ? (
              <>
                <View style={{ flexDirection: 'row', gap: spacing['2'], alignItems: 'center' }}>
                  <Ionicons
                    name={result.rooms.length > 0 ? 'checkmark-circle' : 'information-circle'}
                    size={18}
                    color={result.rooms.length > 0 ? colors.success : colors.amber400}
                  />
                  <Text variant="bodyMedium" color={colors.cream}>
                    {result.rooms.length > 0
                      ? `${result.rooms.length} opciones disponibles`
                      : 'Sin disponibilidad para esas fechas'}
                  </Text>
                </View>
                <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                  Continúa la reserva en Booking.com para ver tarifas y confirmar tu plaza.
                </Text>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: spacing['2'], alignItems: 'center' }}>
                  <Ionicons name="information-circle" size={18} color={colors.amber400} />
                  <Text variant="bodyMedium" color={colors.cream}>
                    Reservas externas no configuradas
                  </Text>
                </View>
                <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
                  {result.message}
                </Text>
              </>
            )}
            <Button
              label="Buscar en Booking.com"
              variant="secondary"
              fullWidth
              onPress={openBooking}
              style={{ marginTop: spacing['3'] }}
            />
          </Card>
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  dayChip: {
    width: 56,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  smallChip: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    marginTop: spacing['2'],
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.stone900,
    borderWidth: 1,
    borderColor: colors.stone700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing['4'],
    paddingHorizontal: spacing['1'],
  },
  resultCard: {
    marginTop: spacing['4'],
    gap: spacing['1'],
  },
});
