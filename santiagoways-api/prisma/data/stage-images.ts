// Curated pool of free Unsplash photos categorized by environment.
// We pick deterministically per stage so the same stage always shows the same image.

export const STAGE_IMAGE_POOL = {
  pyrenees: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80',
  ],
  mountain: [
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=1200&q=80',
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80',
  ],
  meseta: [
    'https://images.unsplash.com/photo-1502303756774-9da9b3b56a37?w=1200&q=80',
    'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
    'https://images.unsplash.com/photo-1505765050516-f72dcac9c60a?w=1200&q=80',
  ],
  forest: [
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    'https://images.unsplash.com/photo-1444090542259-0af8fa96557e?w=1200&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
  ],
  coast: [
    'https://images.unsplash.com/photo-1559521783-1d1599583485?w=1200&q=80',
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1200&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
    'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1200&q=80',
  ],
  vineyard: [
    'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=80',
    'https://images.unsplash.com/photo-1506805611552-5fa11dde15be?w=1200&q=80',
    'https://images.unsplash.com/photo-1543699565-003b8adda5fc?w=1200&q=80',
  ],
  city: [
    'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1200&q=80',
    'https://images.unsplash.com/photo-1599661046827-9a692a55a78f?w=1200&q=80',
    'https://images.unsplash.com/photo-1471919743851-c4df8b6ee133?w=1200&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
  ],
  village: [
    'https://images.unsplash.com/photo-1488751045188-3c55bbf9a3fa?w=1200&q=80',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80',
    'https://images.unsplash.com/photo-1530841344095-502ed862e2bb?w=1200&q=80',
    'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1200&q=80',
  ],
  santiago: [
    'https://images.unsplash.com/photo-1599661046827-9a692a55a78f?w=1200&q=80',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
  ],
} as const;

type StageContext = {
  routeSlug: string;
  number: number;
  startPoint: string;
  endPoint: string;
  elevationGain: number;
};

const CITY_KEYWORDS = [
  'Pamplona', 'Logroño', 'Burgos', 'León', 'Astorga', 'Ponferrada',
  'Sarria', 'Porto', 'Pontevedra', 'Barcelos', 'San Sebastián',
  'Bilbao', 'Santander', 'Gijón', 'Avilés', 'Oviedo', 'Lugo',
  'Sevilla', 'Mérida', 'Cáceres', 'Salamanca', 'Zamora', 'Jaca',
];

export function getStageImage(ctx: StageContext): string {
  // Santiago always wins
  if (/Santiago de Compostela/i.test(ctx.endPoint)) {
    return pick(STAGE_IMAGE_POOL.santiago, ctx.routeSlug + ctx.number);
  }
  // Coast for Norte (always coastal stages 1-22 approx)
  if (ctx.routeSlug === 'camino-del-norte' && ctx.number <= 22) {
    return pick(STAGE_IMAGE_POOL.coast, ctx.routeSlug + ctx.number);
  }
  // Pyrenees opening of Francés / Aragonés
  if (
    (ctx.routeSlug === 'camino-frances' && ctx.number === 1) ||
    (ctx.routeSlug === 'camino-aragones' && ctx.number === 1)
  ) {
    return pick(STAGE_IMAGE_POOL.pyrenees, ctx.routeSlug + ctx.number);
  }
  // Hard mountain (high elevation gain)
  if (ctx.elevationGain >= 800) {
    return pick(STAGE_IMAGE_POOL.mountain, ctx.routeSlug + ctx.number);
  }
  // Meseta of Francés (stages 13-19 roughly) and central Plata
  if (ctx.routeSlug === 'camino-frances' && ctx.number >= 13 && ctx.number <= 19) {
    return pick(STAGE_IMAGE_POOL.meseta, ctx.routeSlug + ctx.number);
  }
  if (ctx.routeSlug === 'via-de-la-plata' && ctx.number >= 18 && ctx.number <= 23) {
    return pick(STAGE_IMAGE_POOL.meseta, ctx.routeSlug + ctx.number);
  }
  // Vineyards in Rioja and Bierzo
  if (
    ctx.routeSlug === 'camino-frances' &&
    (ctx.number === 6 || ctx.number === 7 || ctx.number === 8 || ctx.number === 25)
  ) {
    return pick(STAGE_IMAGE_POOL.vineyard, ctx.routeSlug + ctx.number);
  }
  // Forest in Galicia
  if (
    (ctx.routeSlug === 'camino-frances' && ctx.number >= 27) ||
    (ctx.routeSlug === 'camino-primitivo' && ctx.number >= 8) ||
    (ctx.routeSlug === 'camino-portugues' && ctx.number >= 5)
  ) {
    return pick(STAGE_IMAGE_POOL.forest, ctx.routeSlug + ctx.number);
  }
  // City endpoints
  if (CITY_KEYWORDS.some((c) => ctx.endPoint.includes(c))) {
    return pick(STAGE_IMAGE_POOL.city, ctx.routeSlug + ctx.number);
  }
  // Default: village
  return pick(STAGE_IMAGE_POOL.village, ctx.routeSlug + ctx.number);
}

function pick<T>(pool: readonly T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return pool[Math.abs(h) % pool.length]!;
}
