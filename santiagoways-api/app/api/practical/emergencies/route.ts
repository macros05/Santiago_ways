import { NextRequest } from 'next/server';
import { handleApiError, ok } from '@lib/http';

// Static emergency contacts. Local rather than DB-backed because they're
// small, slow-moving, and we want them available offline immediately.
const EMERGENCIES = {
  global: {
    emergency: '112',
    police: '091',
    civilGuard: '062',
    medical: '061',
  },
  byRegion: {
    galicia: {
      hospital: '+34 981 950 000', // CHUS Santiago
      pharmacyOnCall: '+34 981 581 575',
      tourist: '+34 981 555 129',
    },
    castilla: {
      hospital: '+34 947 281 800', // HUBU Burgos
      pharmacyOnCall: '+34 947 277 000',
    },
    navarra: {
      hospital: '+34 848 422 222', // Pamplona
      pharmacyOnCall: '+34 948 222 442',
    },
    larioja: {
      hospital: '+34 941 297 700', // Logroño
      pharmacyOnCall: '+34 941 246 727',
    },
    asturias: {
      hospital: '+34 985 108 000', // HUCA Oviedo
    },
    portugal: {
      emergency: '112',
      hospital: '+351 220 077 500', // Porto
      tourist: '+351 808 781 212',
    },
  },
} as const;

export async function GET(_req: NextRequest) {
  try {
    return ok(EMERGENCIES);
  } catch (e) {
    return handleApiError(e);
  }
}
