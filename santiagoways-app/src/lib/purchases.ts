import { Platform } from 'react-native';
import { api } from './api';

export type Plan = 'free' | 'buen_camino' | 'compostelero';

export type PurchasesPackage = {
  identifier: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    priceString: string;
    price: number;
    currencyCode?: string;
    subscriptionPeriod?: string | null;
  };
  packageType: string;
};

export type PurchasesOffering = {
  identifier: string;
  serverDescription: string;
  monthly?: PurchasesPackage | null;
  annual?: PurchasesPackage | null;
  availablePackages: PurchasesPackage[];
};

export type PurchasesOfferings = {
  current: PurchasesOffering | null;
  all: Record<string, PurchasesOffering>;
};

export type CustomerInfo = {
  originalAppUserId: string;
  entitlements: { active: Record<string, { identifier: string; isActive: boolean }> };
  activeSubscriptions: string[];
};

let mod: typeof import('react-native-purchases') | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

function loadModule(): typeof import('react-native-purchases') | null {
  if (mod) return mod;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('react-native-purchases');
    return mod;
  } catch {
    return null;
  }
}

export function isPurchasesAvailable(): boolean {
  return loadModule() !== null;
}

export async function initializePurchases(userId: string): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const m = loadModule();
    if (!m) {
      initialized = true;
      return;
    }
    const apiKey =
      Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
        : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
    if (!apiKey) {
      initialized = true;
      return;
    }
    try {
      const Purchases = (m as { default: typeof import('react-native-purchases').default }).default ?? m;
      // @ts-ignore - the SDK exports both default and named at runtime
      Purchases.setLogLevel?.((Purchases.LOG_LEVEL?.WARN ?? 'WARN'));
      // @ts-ignore
      await Purchases.configure({ apiKey, appUserID: userId });
    } catch (e) {
      console.warn('[purchases] init failed', e);
    } finally {
      initialized = true;
    }
  })();
  return initPromise;
}

export async function getCurrentOfferings(): Promise<PurchasesOfferings | null> {
  const m = loadModule();
  if (!m) return mockOfferings();
  try {
    // @ts-ignore
    const Purchases = m.default ?? m;
    // @ts-ignore
    const off = await Purchases.getOfferings();
    return off as PurchasesOfferings;
  } catch (e) {
    console.warn('[purchases] getOfferings failed', e);
    return mockOfferings();
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  const m = loadModule();
  if (!m) return null;
  try {
    // @ts-ignore
    const Purchases = m.default ?? m;
    // @ts-ignore
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo as CustomerInfo;
  } catch (e: unknown) {
    const code = (e as { userCancelled?: boolean })?.userCancelled;
    if (code) return null;
    throw e;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  const m = loadModule();
  if (!m) return null;
  try {
    // @ts-ignore
    const Purchases = m.default ?? m;
    // @ts-ignore
    const info = await Purchases.restorePurchases();
    return info as CustomerInfo;
  } catch (e) {
    console.warn('[purchases] restore failed', e);
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  const m = loadModule();
  if (!m) return null;
  try {
    // @ts-ignore
    const Purchases = m.default ?? m;
    // @ts-ignore
    const info = await Purchases.getCustomerInfo();
    return info as CustomerInfo;
  } catch {
    return null;
  }
}

export async function syncWithBackend(
  customerInfo: CustomerInfo,
): Promise<{ plan: Plan } | null> {
  const customerId = customerInfo?.originalAppUserId;
  if (!customerId) return null;
  try {
    return await api<{ plan: Plan }>('/subscriptions/sync', {
      method: 'POST',
      body: { revenueCatCustomerId: customerId },
    });
  } catch (e) {
    console.warn('[purchases] backend sync failed', e);
    return null;
  }
}

// Dev fallback offerings so the paywall renders without native SDK / sandbox.
function mockOfferings(): PurchasesOfferings {
  const monthlyBC: PurchasesPackage = {
    identifier: 'monthly_buen_camino',
    packageType: 'MONTHLY',
    product: {
      identifier: 'sw_buen_camino_monthly',
      title: 'Buen Camino mensual',
      description: 'Todas las rutas, sin anuncios.',
      priceString: '€3,99',
      price: 3.99,
      currencyCode: 'EUR',
      subscriptionPeriod: 'P1M',
    },
  };
  const annualBC: PurchasesPackage = {
    identifier: 'annual_buen_camino',
    packageType: 'ANNUAL',
    product: {
      identifier: 'sw_buen_camino_annual',
      title: 'Buen Camino anual',
      description: 'Ahorra 58% pagando al año.',
      priceString: '€19,99',
      price: 19.99,
      currencyCode: 'EUR',
      subscriptionPeriod: 'P1Y',
    },
  };
  const monthlyC: PurchasesPackage = {
    identifier: 'monthly_compostelero',
    packageType: 'MONTHLY',
    product: {
      identifier: 'sw_compostelero_monthly',
      title: 'Compostelero mensual',
      description: 'Todo + IA, salud y chat.',
      priceString: '€9,99',
      price: 9.99,
      currencyCode: 'EUR',
      subscriptionPeriod: 'P1M',
    },
  };
  const annualC: PurchasesPackage = {
    identifier: 'annual_compostelero',
    packageType: 'ANNUAL',
    product: {
      identifier: 'sw_compostelero_annual',
      title: 'Compostelero anual',
      description: 'Mejor precio anual.',
      priceString: '€59,99',
      price: 59.99,
      currencyCode: 'EUR',
      subscriptionPeriod: 'P1Y',
    },
  };

  const buen: PurchasesOffering = {
    identifier: 'buen_camino',
    serverDescription: 'Buen Camino',
    monthly: monthlyBC,
    annual: annualBC,
    availablePackages: [monthlyBC, annualBC],
  };
  const compostelero: PurchasesOffering = {
    identifier: 'compostelero',
    serverDescription: 'Compostelero',
    monthly: monthlyC,
    annual: annualC,
    availablePackages: [monthlyC, annualC],
  };

  return {
    current: buen,
    all: { buen_camino: buen, compostelero },
  };
}

export function planFromPackageId(pkgId: string): Plan {
  if (pkgId.includes('compostelero')) return 'compostelero';
  if (pkgId.includes('buen') || pkgId.includes('camino')) return 'buen_camino';
  return 'free';
}
