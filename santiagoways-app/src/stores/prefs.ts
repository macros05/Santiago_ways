import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type DistanceUnit = 'km' | 'mi';

type PrefsState = {
  hydrated: boolean;
  units: DistanceUnit;
  pushEnabled: boolean;
  hydrate: () => Promise<void>;
  setUnits: (units: DistanceUnit) => Promise<void>;
  setPushEnabled: (enabled: boolean) => Promise<void>;
};

const STORAGE_KEY = 'sw_prefs_v1';

type Persisted = Pick<PrefsState, 'units' | 'pushEnabled'>;

const DEFAULTS: Persisted = {
  units: 'km',
  pushEnabled: true,
};

async function persist(next: Persisted) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export const usePrefs = create<PrefsState>((set, get) => ({
  hydrated: false,
  units: DEFAULTS.units,
  pushEnabled: DEFAULTS.pushEnabled,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        set({
          units: parsed.units === 'mi' ? 'mi' : 'km',
          pushEnabled: parsed.pushEnabled !== false,
          hydrated: true,
        });
        return;
      }
    } catch {
      // Corrupt or missing — fall through to defaults below.
    }
    set({ hydrated: true });
  },

  setUnits: async (units) => {
    set({ units });
    await persist({ units, pushEnabled: get().pushEnabled });
  },

  setPushEnabled: async (pushEnabled) => {
    set({ pushEnabled });
    await persist({ units: get().units, pushEnabled });
  },
}));
