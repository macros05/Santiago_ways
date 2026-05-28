import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { colors, layout, radius, spacing } from '@design/tokens';
import { api, ApiError } from '@lib/api';
import { useAuth, type AuthUser } from '@stores/auth';
import { usePrefs } from '@stores/prefs';
import { toast } from '@stores/toast';

const LANGS: Array<{ value: 'es' | 'en'; label: string; native: string; flag: string }> = [
  { value: 'es', label: 'Español', native: 'Castellano', flag: '🇪🇸' },
  { value: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
];

export default function LanguageSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const localePref = usePrefs((s) => s.locale);
  const setLocalePref = usePrefs((s) => s.setLocale);
  const [pending, setPending] = useState<'es' | 'en' | null>(null);

  // The user-profile language is the source of truth when authenticated; we
  // mirror it into the local prefs store (which also drives the i18n locale)
  // for guests and offline boots.
  const current = user?.language ?? localePref;

  const change = async (lang: 'es' | 'en') => {
    if (lang === current || pending) return;
    setPending(lang);
    // Apply the change locally first so the UI flips even if the network call
    // is slow or fails.
    await setLocalePref(lang);
    try {
      if (user) {
        const updated = await api<AuthUser>('/users/me', {
          method: 'PATCH',
          body: { language: lang },
        });
        setUser({ ...user, ...updated });
      }
      toast.success(lang === 'es' ? 'Idioma cambiado a Español.' : 'Language switched to English.');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No pudimos sincronizar con el servidor.');
    } finally {
      setPending(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header title="Idioma" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['3'],
        }}
      >
        {LANGS.map((lang) => {
          const active = current === lang.value;
          return (
            <Pressable key={lang.value} onPress={() => change(lang.value)} disabled={!!pending}>
              <Card
                style={[
                  styles.option,
                  active ? { borderColor: colors.amber400, borderWidth: 1.5 } : null,
                ]}
              >
                <Text style={{ fontSize: 26 }}>{lang.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" color={colors.cream}>{lang.label}</Text>
                  <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
                    {lang.native}
                  </Text>
                </View>
                {active ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.amber400} />
                ) : (
                  <View style={styles.bullet} />
                )}
              </Card>
            </Pressable>
          );
        })}

        <Text variant="caption" color={colors.stone500} style={{ marginTop: spacing['4'] }}>
          Por ahora el contenido del Camino (rutas, etapas, posts) se mantiene en su idioma
          original. La interfaz se traducirá completamente en próximas versiones.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  bullet: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.stone600,
  },
});
