// Sample waypoints distributed across stages — fountains, churches, viewpoints,
// danger zones. In production, replace with full OSM POI data.

export type SeedWaypoint = {
  routeSlug: string;
  stageNumber: number;
  name: string;
  type: 'church' | 'bar' | 'fountain' | 'viewpoint' | 'danger' | 'info';
  lat: number;
  lng: number;
  description?: string;
  isOfficial?: boolean;
};

export const WAYPOINTS: SeedWaypoint[] = [
  // Francés stage 1
  { routeSlug: 'camino-frances', stageNumber: 1, name: 'Orisson refuge water', type: 'fountain', lat: 43.123, lng: -1.246, description: 'Last reliable water before the col.' },
  { routeSlug: 'camino-frances', stageNumber: 1, name: 'Col de Lepoeder viewpoint', type: 'viewpoint', lat: 43.011, lng: -1.297, description: 'Highest point of the day — 1430m.' },
  { routeSlug: 'camino-frances', stageNumber: 1, name: 'Steep descent warning', type: 'danger', lat: 43.012, lng: -1.305, description: 'Loose rocks; trekking poles strongly recommended.' },
  // Francés stage 4
  { routeSlug: 'camino-frances', stageNumber: 4, name: 'Alto del Perdón sculpture', type: 'viewpoint', lat: 42.741, lng: -1.708, description: 'Iron pilgrim sculpture and wind turbines — iconic photo.' },
  { routeSlug: 'camino-frances', stageNumber: 4, name: 'Uterga water fountain', type: 'fountain', lat: 42.706, lng: -1.749 },
  // Francés stage 6
  { routeSlug: 'camino-frances', stageNumber: 6, name: 'Bodegas Irache wine fountain', type: 'fountain', lat: 42.658, lng: -2.044, description: 'Free wine for pilgrims (small cup, please).', isOfficial: true },
  // Francés stage 12
  { routeSlug: 'camino-frances', stageNumber: 12, name: 'Burgos Cathedral', type: 'church', lat: 42.341, lng: -3.704, description: 'Gothic cathedral, UNESCO World Heritage.' },
  // Francés stage 17
  { routeSlug: 'camino-frances', stageNumber: 17, name: '17km waterless stretch', type: 'danger', lat: 42.341, lng: -4.760, description: 'No water sources — fill 2L before leaving Carrión.' },
  // Francés stage 20
  { routeSlug: 'camino-frances', stageNumber: 20, name: 'León Cathedral', type: 'church', lat: 42.598, lng: -5.567, description: 'The most beautiful cathedral on the route.' },
  // Francés stage 23
  { routeSlug: 'camino-frances', stageNumber: 23, name: 'Castrillo de los Polvazares bar', type: 'bar', lat: 42.475, lng: -6.149, description: 'Famous cocido maragato.' },
  // Francés stage 24
  { routeSlug: 'camino-frances', stageNumber: 24, name: 'Cruz de Ferro', type: 'info', lat: 42.491, lng: -6.367, description: 'Iron cross at 1500m — leave a stone from home.', isOfficial: true },
  { routeSlug: 'camino-frances', stageNumber: 24, name: 'Molinaseca steep descent', type: 'danger', lat: 42.541, lng: -6.521, description: 'Long, knee-jarring descent.' },
  // Francés stage 26
  { routeSlug: 'camino-frances', stageNumber: 26, name: 'Las Herrerías to O Cebreiro climb', type: 'danger', lat: 42.696, lng: -6.987, description: '700m of vertical climb in 9km.' },
  { routeSlug: 'camino-frances', stageNumber: 26, name: 'O Cebreiro pallozas', type: 'viewpoint', lat: 42.708, lng: -7.044, description: 'Pre-Roman thatched stone houses.' },
  // Francés stage 33
  { routeSlug: 'camino-frances', stageNumber: 33, name: 'Monte do Gozo', type: 'viewpoint', lat: 42.886, lng: -8.502, description: 'First view of the Santiago cathedral towers.', isOfficial: true },
  { routeSlug: 'camino-frances', stageNumber: 33, name: 'Catedral de Santiago', type: 'church', lat: 42.881, lng: -8.545, description: 'Tomb of St James. Final destination.', isOfficial: true },

  // Portugués
  { routeSlug: 'camino-portugues', stageNumber: 3, name: 'Ponte de Lima medieval bridge', type: 'viewpoint', lat: 41.766, lng: -8.582, description: 'The bridge that gave the town its name.' },
  { routeSlug: 'camino-portugues', stageNumber: 5, name: 'International Bridge of Tui', type: 'info', lat: 42.046, lng: -8.643, description: 'Crossing from Portugal into Spain.' },
  { routeSlug: 'camino-portugues', stageNumber: 8, name: 'Arcade oysters', type: 'bar', lat: 42.342, lng: -8.612, description: 'Mid-stage oyster lunch.' },
  { routeSlug: 'camino-portugues', stageNumber: 9, name: 'Caldas thermal foot-bath', type: 'fountain', lat: 42.604, lng: -8.640, description: 'Free hot-spring fountain in the centre.' },

  // Norte
  { routeSlug: 'camino-del-norte', stageNumber: 1, name: 'Jaizkibel viewpoint', type: 'viewpoint', lat: 43.378, lng: -1.892, description: 'Stunning Bay of Biscay views.' },
  { routeSlug: 'camino-del-norte', stageNumber: 8, name: 'Vizcaya transporter bridge', type: 'info', lat: 43.323, lng: -3.022, description: 'UNESCO industrial heritage.' },
  { routeSlug: 'camino-del-norte', stageNumber: 11, name: 'Santoña–Laredo ferry', type: 'info', lat: 43.444, lng: -3.460, description: 'Take the morning boat to skip 8km of beach.' },
  { routeSlug: 'camino-del-norte', stageNumber: 17, name: 'Bufones de Pría', type: 'viewpoint', lat: 43.475, lng: -4.973, description: 'Sea geysers — time with high tide.' },
  { routeSlug: 'camino-del-norte', stageNumber: 25, name: 'Playa de las Catedrales', type: 'viewpoint', lat: 43.555, lng: -7.165, description: 'Cathedral beach — short detour from the trail.' },

  // Camino Primitivo
  { routeSlug: 'camino-primitivo', stageNumber: 1, name: 'Catedral de Oviedo', type: 'church', lat: 43.362, lng: -5.842, description: 'San Salvador — origen del Camino Primitivo.', isOfficial: true },
  { routeSlug: 'camino-primitivo', stageNumber: 5, name: 'Puerto del Palo', type: 'viewpoint', lat: 43.245, lng: -6.760, description: 'Punto más alto de la ruta de los Hospitales (1146 m).' },
  { routeSlug: 'camino-primitivo', stageNumber: 5, name: 'Niebla en Hospitales', type: 'danger', lat: 43.230, lng: -6.790, description: 'En días con niebla, evitar la ruta alta — visibilidad cero.' },
  { routeSlug: 'camino-primitivo', stageNumber: 9, name: 'Muralla romana de Lugo', type: 'viewpoint', lat: 43.012, lng: -7.557, description: 'Patrimonio de la Humanidad. Camina por encima.', isOfficial: true },
  { routeSlug: 'camino-primitivo', stageNumber: 11, name: 'Pulpería Ezequiel', type: 'bar', lat: 42.911, lng: -7.999, description: 'Pulpo a feira — institución gallega.' },

  // Camino Inglés
  { routeSlug: 'camino-ingles', stageNumber: 1, name: 'Puerto de Ferrol', type: 'info', lat: 43.484, lng: -8.235, description: 'Puerto histórico de llegada de peregrinos del norte de Europa.', isOfficial: true },
  { routeSlug: 'camino-ingles', stageNumber: 2, name: 'Puente medieval de Pontedeume', type: 'viewpoint', lat: 43.413, lng: -8.171, description: 'Puente del s. XIV sobre el río Eume.' },
  { routeSlug: 'camino-ingles', stageNumber: 3, name: 'Hospital de Bruma — confluencia', type: 'info', lat: 43.142, lng: -8.243, description: 'Aquí se unen las variantes de Ferrol y A Coruña.' },

  // Vía de la Plata
  { routeSlug: 'via-de-la-plata', stageNumber: 1, name: 'Catedral de Sevilla', type: 'church', lat: 37.386, lng: -5.992, description: 'Punto de partida del Plata.', isOfficial: true },
  { routeSlug: 'via-de-la-plata', stageNumber: 9, name: 'Teatro Romano de Mérida', type: 'viewpoint', lat: 38.916, lng: -6.339, description: 'Patrimonio de la Humanidad. Visita imprescindible.' },
  { routeSlug: 'via-de-la-plata', stageNumber: 11, name: 'Cáceres antiguo', type: 'viewpoint', lat: 39.474, lng: -6.372, description: 'Casco antiguo Patrimonio de la Humanidad.' },
  { routeSlug: 'via-de-la-plata', stageNumber: 17, name: 'Albergue Casa Sara — Don Blas', type: 'info', lat: 40.625, lng: -5.797, description: 'Hospitalero legendario del Plata.' },
  { routeSlug: 'via-de-la-plata', stageNumber: 19, name: 'Plaza Mayor de Salamanca', type: 'viewpoint', lat: 40.965, lng: -5.664, description: 'Una de las plazas mayores más bellas de España.' },
  { routeSlug: 'via-de-la-plata', stageNumber: 21, name: 'Catedral Vieja de Zamora', type: 'church', lat: 41.498, lng: -5.751, description: 'Cimborrio escamado único.' },

  // Camino Aragonés
  { routeSlug: 'camino-aragones', stageNumber: 1, name: 'Estación de Canfranc', type: 'viewpoint', lat: 42.755, lng: -0.520, description: 'Antigua estación internacional, joya modernista.' },
  { routeSlug: 'camino-aragones', stageNumber: 1, name: 'Catedral de Jaca', type: 'church', lat: 42.570, lng: -0.547, description: 'Una de las primeras catedrales románicas de España.' },
  { routeSlug: 'camino-aragones', stageNumber: 6, name: 'Iglesia de Eunate', type: 'church', lat: 42.685, lng: -1.770, description: 'Octogonal románica templaria — mística.', isOfficial: true },
];
