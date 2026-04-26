import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const translations = {
  en: {
    common: {
      continue: 'Continue',
      cancel: 'Cancel',
      next: 'Next',
      back: 'Back',
      done: 'Done',
      save: 'Save',
      delete: 'Delete',
      retry: 'Retry',
    },
    onboarding: {
      slogan: 'Your ultimate Camino companion',
      cta: 'Start your journey',
      haveAccount: 'I already have an account',
    },
    auth: {
      register: 'Create account',
      login: 'Sign in',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      username: 'Username',
      nationality: 'Nationality',
      forgotPassword: 'Forgot password?',
      signInGoogle: 'Continue with Google',
      signInApple: 'Continue with Apple',
    },
    explore: {
      goodMorning: 'Buenos días',
      goodAfternoon: 'Buenas tardes',
      goodEvening: 'Buenas noches',
      yourRoute: 'Your Route',
      nearbyAlbergues: 'Nearby Albergues',
      trending: 'Trending on the Camino',
      weather: 'Weather along your route',
      todaysTip: "Today's pilgrim tip",
      continueButton: 'Continue',
    },
    tabs: {
      explore: 'Explore',
      route: 'My Route',
      map: 'Map',
      community: 'Community',
      profile: 'Profile',
    },
  },
  es: {
    common: {
      continue: 'Continuar',
      cancel: 'Cancelar',
      next: 'Siguiente',
      back: 'Atrás',
      done: 'Hecho',
      save: 'Guardar',
      delete: 'Eliminar',
      retry: 'Reintentar',
    },
    onboarding: {
      slogan: 'Tu compañero definitivo del Camino',
      cta: 'Comienza tu camino',
      haveAccount: 'Ya tengo cuenta',
    },
    auth: {
      register: 'Crear cuenta',
      login: 'Iniciar sesión',
      email: 'Correo',
      password: 'Contraseña',
      name: 'Nombre',
      username: 'Usuario',
      nationality: 'Nacionalidad',
      forgotPassword: '¿Olvidaste tu contraseña?',
      signInGoogle: 'Continuar con Google',
      signInApple: 'Continuar con Apple',
    },
    explore: {
      goodMorning: 'Buenos días',
      goodAfternoon: 'Buenas tardes',
      goodEvening: 'Buenas noches',
      yourRoute: 'Tu Camino',
      nearbyAlbergues: 'Albergues cerca',
      trending: 'Lo más visto en el Camino',
      weather: 'Tiempo en tu ruta',
      todaysTip: 'Consejo del día',
      continueButton: 'Continuar',
    },
    tabs: {
      explore: 'Descubrir',
      route: 'Mi Camino',
      map: 'Mapa',
      community: 'Comunidad',
      profile: 'Perfil',
    },
  },
} as const;

export const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = 'es';
i18n.locale = Localization.getLocales()[0]?.languageCode === 'en' ? 'en' : 'es';

export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
