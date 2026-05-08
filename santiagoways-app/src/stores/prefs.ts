import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { setLocale } from '@lib/i18n';

export type DistanceUnit = 'km' | 'mi';
export type Locale = 'es' | 'en';

type PrefsState = {
  hydrated: boolean;
  units: DistanceUnit;
  pushEnabled: boolean;
  locale: Locale;
  hydrate: () => Promise<void>;
  setUnits: (units: DistanceUnit) => Promise<void>;
  setPushEnabled: (enabled: boolean) => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
};

const STORAGE_KEY = 'sw_prefs_v1';

type Persisted = { units: DistanceUnit; pushEnabled: boolean; locale: Locale };

const DEFAULTS: Persisted = {
  units: 'km',
  pushEnabled: true,
  locale: 'es',
};

async function persist(next: Persisted) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export const usePrefs = create<PrefsState>((set, get) => ({
  hydrated: false,
  units: DEFAULTS.units,
  pushEnabled: DEFAULTS.pushEnabled,
  locale: DEFAULTS.locale,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        const locale: Locale = parsed.locale === 'en' ? 'en' : 'es';
        set({
          units: parsed.units === 'mi' ? 'mi' : 'km',
          pushEnabled: parsed.pushEnabled !== false,
          locale,
          hydrated: true,
        });
        setLocale(locale);
        return;
      }
    } catch {
      // Corrupt or missing — fall through to defaults below.
    }
    setLocale(DEFAULTS.locale);
    set({ hydrated: true });
  },

  setUnits: async (units) => {
    set({ units });
    await persist({ units, pushEnabled: get().pushEnabled, locale: get().locale });
  },

  setPushEnabled: async (pushEnabled) => {
    set({ pushEnabled });
    await persist({ units: get().units, pushEnabled, locale: get().locale });
  },

  setLocale: async (locale) => {
    set({ locale });
    setLocale(locale);
    await persist({ units: get().units, pushEnabled: get().pushEnabled, locale });
  },
}));
