// Local-notification scheduler. Wraps expo-notifications so callers can
// request named slots — the "tomorrow's stage", "departure reminder", and
// "albergue closing" — without juggling identifiers manually.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

async function ensureConfig() {
  if (configured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Camino',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('safety', {
      name: 'Seguridad',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  configured = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  await ensureConfig();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const SLOTS = {
  stageTomorrow: 'sw_stage_tomorrow',
  departureReminder: 'sw_departure_reminder',
  weeklyRecap: 'sw_weekly_recap',
} as const;

type Slot = keyof typeof SLOTS;

async function cancelSlot(slot: Slot) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    const d = (n.content.data ?? {}) as { slot?: string };
    if (d.slot === SLOTS[slot]) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

// Schedules a one-shot notification for tonight at 21:00 with the next stage's
// summary. Cancels any prior tomorrow-notification first.
export async function scheduleTomorrowStage(args: {
  stageNumber: number;
  stageName: string;
  distanceKm: number;
  elevationGain: number;
}) {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  await cancelSlot('stageTomorrow');

  const trigger = new Date();
  trigger.setHours(21, 0, 0, 0);
  if (trigger.getTime() <= Date.now()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Mañana: Etapa ${args.stageNumber}`,
      body: `${args.stageName} · ${args.distanceKm.toFixed(0)} km · +${args.elevationGain} m`,
      data: { slot: SLOTS.stageTomorrow },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

// Programs a recurring departure reminder at the user's chosen wake-up time.
// We use a daily trigger; client should pass hour/minute in 24h.
export async function scheduleDepartureReminder(args: { hour: number; minute: number }) {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  await cancelSlot('departureReminder');

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '☀️ Buenos días, peregrino',
      body: 'Hora de empezar la etapa. Buen Camino.',
      data: { slot: SLOTS.departureReminder },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: args.hour,
      minute: args.minute,
    },
  });
}

// Albergues typically close at 22:00. Schedules a single-shot 21:30 nudge if
// the time is still in the future today.
export async function scheduleAlbergueClosingAlert(albergueName: string) {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  const trigger = new Date();
  trigger.setHours(21, 30, 0, 0);
  if (trigger.getTime() <= Date.now()) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Cierre cercano',
      body: `${albergueName} cierra a las 22:00.`,
      data: { slot: 'albergue_closing' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function scheduleWeeklyRecap() {
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  await cancelSlot('weeklyRecap');
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tu semana en el Camino',
      body: 'Mira tu resumen: km, fotos, peregrinos conocidos.',
      data: { slot: SLOTS.weeklyRecap },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      // Sunday at 19:00. expo-notifications uses 1=Sunday on some platforms.
      weekday: 1,
      hour: 19,
      minute: 0,
    },
  });
}

export async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
