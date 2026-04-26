// Curated albergue dataset across the three routes.
// Each albergue references the stage by route slug + stage number for seeding.

export type SeedAlbergue = {
  routeSlug: string;
  stageNumbers: number[];
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  website?: string;
  pricePerNight?: number;
  totalBeds?: number;
  type: 'municipal' | 'private' | 'parochial' | 'association';
  amenities: string[];
  bookingPropertyId?: string;
  isOpenYearRound?: boolean;
  description?: string;
};

export const ALBERGUES: SeedAlbergue[] = [
  // Camino Francés
  { routeSlug: 'camino-frances', stageNumbers: [1], name: 'Albergue de Roncesvalles', city: 'Roncesvalles', address: 'Real Colegiata', lat: 43.009, lng: -1.319, phone: '+34 948 760 000', pricePerNight: 14, totalBeds: 183, type: 'parochial', amenities: ['wifi', 'kitchen', 'laundry', 'breakfast', 'pilgrim-meal'], isOpenYearRound: true, description: 'The legendary first stop after the Pyrenees, run from the historic monastery.' },
  { routeSlug: 'camino-frances', stageNumbers: [2], name: 'Albergue Río Arga Ibaia', city: 'Zubiri', address: 'Carretera Roncesvalles 10', lat: 42.929, lng: -1.501, pricePerNight: 12, totalBeds: 24, type: 'private', amenities: ['wifi', 'kitchen', 'laundry'], description: 'Cozy private albergue on the river.' },
  { routeSlug: 'camino-frances', stageNumbers: [3], name: 'Albergue Jesús y María', city: 'Pamplona', address: 'Calle Compañía 4', lat: 42.819, lng: -1.642, phone: '+34 948 222 644', pricePerNight: 10, totalBeds: 110, type: 'parochial', amenities: ['wifi', 'kitchen'], isOpenYearRound: true },
  { routeSlug: 'camino-frances', stageNumbers: [4], name: 'Albergue Padres Reparadores', city: 'Puente la Reina', address: 'Crucifijo 1', lat: 42.671, lng: -1.815, pricePerNight: 8, totalBeds: 100, type: 'parochial', amenities: ['kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [5], name: 'Albergue Municipal de Estella', city: 'Estella', address: 'La Rúa 50', lat: 42.671, lng: -2.030, pricePerNight: 8, totalBeds: 96, type: 'municipal', amenities: ['kitchen', 'laundry', 'wifi'] },
  { routeSlug: 'camino-frances', stageNumbers: [6], name: 'Albergue Isaac Santiago', city: 'Los Arcos', address: 'San Lázaro', lat: 42.570, lng: -2.190, pricePerNight: 7, totalBeds: 70, type: 'municipal', amenities: ['kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [7], name: 'Albergue Logroño', city: 'Logroño', address: 'Ruavieja 32', lat: 42.466, lng: -2.448, pricePerNight: 9, totalBeds: 88, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-frances', stageNumbers: [8], name: 'Albergue Municipal de Nájera', city: 'Nájera', address: 'Plaza de Santiago', lat: 42.418, lng: -2.728, pricePerNight: 0, totalBeds: 90, type: 'municipal', amenities: ['kitchen', 'donativo'], description: 'Donativo — give what you can.' },
  { routeSlug: 'camino-frances', stageNumbers: [9], name: 'Albergue Cofradía del Santo', city: 'Santo Domingo de la Calzada', address: 'Mayor 38', lat: 42.440, lng: -2.954, pricePerNight: 8, totalBeds: 220, type: 'association', amenities: ['kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [10], name: 'Albergue Cuatro Cantones', city: 'Belorado', address: 'Hipólito López Bernal 10', lat: 42.420, lng: -3.190, pricePerNight: 10, totalBeds: 64, type: 'private', amenities: ['wifi', 'kitchen', 'pool', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [11], name: 'Albergue Monasterio de San Juan de Ortega', city: 'San Juan de Ortega', address: 'Iglesia', lat: 42.376, lng: -3.439, pricePerNight: 6, totalBeds: 60, type: 'parochial', amenities: ['kitchen'] },
  { routeSlug: 'camino-frances', stageNumbers: [12], name: 'Albergue de Burgos', city: 'Burgos', address: 'Fernán González 28', lat: 42.341, lng: -3.703, pricePerNight: 10, totalBeds: 150, type: 'municipal', amenities: ['wifi', 'kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [13], name: 'Albergue Hornillos Meeting Point', city: 'Hornillos del Camino', address: 'Calle Cantarranas', lat: 42.337, lng: -3.903, pricePerNight: 12, totalBeds: 32, type: 'private', amenities: ['wifi', 'breakfast', 'kitchen'] },
  { routeSlug: 'camino-frances', stageNumbers: [14], name: 'Albergue Rosalía', city: 'Castrojeriz', address: 'Cordón 2', lat: 42.288, lng: -4.135, pricePerNight: 10, totalBeds: 30, type: 'private', amenities: ['wifi', 'kitchen'] },
  { routeSlug: 'camino-frances', stageNumbers: [15], name: 'Albergue Municipal de Frómista', city: 'Frómista', address: 'Plaza San Martín', lat: 42.265, lng: -4.405, pricePerNight: 8, totalBeds: 56, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-frances', stageNumbers: [16], name: 'Monasterio de Santa Clara', city: 'Carrión de los Condes', address: 'Plaza Santa Clara', lat: 42.337, lng: -4.602, pricePerNight: 7, totalBeds: 30, type: 'parochial', amenities: ['kitchen'], description: 'Run by Clarissa nuns who sing for pilgrims.' },
  { routeSlug: 'camino-frances', stageNumbers: [17], name: 'Albergue Los Templarios', city: 'Terradillos de los Templarios', address: 'Calle Mayor', lat: 42.354, lng: -4.910, pricePerNight: 11, totalBeds: 50, type: 'private', amenities: ['wifi', 'kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [18], name: 'Albergue Domenico Laffi', city: 'El Burgo Ranero', address: 'Iglesia', lat: 42.422, lng: -5.241, pricePerNight: 0, totalBeds: 30, type: 'parochial', amenities: ['kitchen', 'donativo'] },
  { routeSlug: 'camino-frances', stageNumbers: [19], name: 'Albergue de Mansilla', city: 'Mansilla de las Mulas', address: 'Plaza del Pozo', lat: 42.498, lng: -5.418, pricePerNight: 7, totalBeds: 76, type: 'municipal', amenities: ['kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [20], name: 'Albergue Benedictinas Carbajalas', city: 'León', address: 'Plaza Santa María del Camino', lat: 42.598, lng: -5.567, pricePerNight: 7, totalBeds: 132, type: 'parochial', amenities: ['kitchen'] },
  { routeSlug: 'camino-frances', stageNumbers: [21], name: 'Albergue Vieira', city: 'San Martín del Camino', address: 'Carretera Astorga', lat: 42.502, lng: -5.788, pricePerNight: 10, totalBeds: 40, type: 'private', amenities: ['wifi', 'kitchen'] },
  { routeSlug: 'camino-frances', stageNumbers: [22], name: 'Albergue de Astorga', city: 'Astorga', address: 'San Javier', lat: 42.456, lng: -6.054, pricePerNight: 8, totalBeds: 50, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-frances', stageNumbers: [23], name: 'Albergue Domus Dei', city: 'Foncebadón', address: 'Iglesia', lat: 42.494, lng: -6.355, pricePerNight: 0, totalBeds: 30, type: 'parochial', amenities: ['kitchen', 'donativo'] },
  { routeSlug: 'camino-frances', stageNumbers: [24], name: 'Albergue de Ponferrada', city: 'Ponferrada', address: 'Calle Loma', lat: 42.547, lng: -6.589, pricePerNight: 7, totalBeds: 200, type: 'municipal', amenities: ['kitchen', 'wifi', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [25], name: 'Albergue de Villafranca del Bierzo', city: 'Villafranca del Bierzo', address: 'Calle del Agua', lat: 42.609, lng: -6.811, pricePerNight: 8, totalBeds: 80, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-frances', stageNumbers: [26], name: 'Albergue de O Cebreiro', city: 'O Cebreiro', address: 'Iglesia', lat: 42.708, lng: -7.044, pricePerNight: 10, totalBeds: 100, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-frances', stageNumbers: [27], name: 'Albergue Atrio', city: 'Triacastela', address: 'Carretera A Mariña', lat: 42.755, lng: -7.241, pricePerNight: 12, totalBeds: 27, type: 'private', amenities: ['wifi', 'kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [28], name: 'Albergue Monasterio de la Magdalena', city: 'Sarria', address: 'Calle Mayor', lat: 42.781, lng: -7.418, pricePerNight: 10, totalBeds: 110, type: 'private', amenities: ['wifi', 'kitchen'] },
  { routeSlug: 'camino-frances', stageNumbers: [29], name: 'Albergue Ferramenteiro', city: 'Portomarín', address: 'Chantada 3', lat: 42.808, lng: -7.617, pricePerNight: 12, totalBeds: 130, type: 'private', amenities: ['wifi', 'kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [30], name: 'Albergue Buen Camino', city: 'Palas de Rei', address: 'Travesía Coruña', lat: 42.873, lng: -7.869, pricePerNight: 11, totalBeds: 41, type: 'private', amenities: ['wifi', 'kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [31], name: 'Albergue Los Caminantes', city: 'Arzúa', address: 'Lugar Bandera', lat: 42.929, lng: -8.157, pricePerNight: 11, totalBeds: 60, type: 'private', amenities: ['wifi', 'kitchen', 'laundry'] },
  { routeSlug: 'camino-frances', stageNumbers: [32, 33], name: 'Albergue O Burgo', city: 'O Pedrouzo', address: 'Avda Lugo', lat: 42.907, lng: -8.358, pricePerNight: 10, totalBeds: 60, type: 'private', amenities: ['wifi', 'kitchen'] },
  { routeSlug: 'camino-frances', stageNumbers: [33], name: 'Albergue Seminario Menor', city: 'Santiago de Compostela', address: 'Belvís', lat: 42.881, lng: -8.545, pricePerNight: 12, totalBeds: 177, type: 'parochial', amenities: ['wifi', 'kitchen'], description: 'Final stop. Walk to the cathedral from here.' },

  // Camino Portugués
  { routeSlug: 'camino-portugues', stageNumbers: [2], name: 'Casa da Fernanda', city: 'Vilarinho', address: 'Largo Igreja', lat: 41.290, lng: -8.585, pricePerNight: 0, totalBeds: 16, type: 'private', amenities: ['donativo', 'pilgrim-meal'], description: 'Famous donativo-only hostel; a Camino legend.' },
  { routeSlug: 'camino-portugues', stageNumbers: [2], name: 'Albergue de Barcelos', city: 'Barcelos', address: 'Largo dos Penedos', lat: 41.531, lng: -8.617, pricePerNight: 6, totalBeds: 48, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-portugues', stageNumbers: [3], name: 'Albergue de Ponte de Lima', city: 'Ponte de Lima', address: 'Avenida dos Plátanos', lat: 41.768, lng: -8.583, pricePerNight: 5, totalBeds: 60, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-portugues', stageNumbers: [4], name: 'Albergue de Rubiães', city: 'Rubiães', address: 'Lugar do Centro', lat: 41.925, lng: -8.604, pricePerNight: 6, totalBeds: 30, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-portugues', stageNumbers: [5], name: 'Albergue de Tui', city: 'Tui', address: 'Antigo Convento das Benedictinas', lat: 42.046, lng: -8.643, pricePerNight: 8, totalBeds: 36, type: 'parochial', amenities: ['kitchen'] },
  { routeSlug: 'camino-portugues', stageNumbers: [7], name: 'Albergue de Redondela', city: 'Redondela', address: 'Casa de la Torre', lat: 42.282, lng: -8.610, pricePerNight: 8, totalBeds: 42, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-portugues', stageNumbers: [8], name: 'Albergue de Pontevedra', city: 'Pontevedra', address: 'Rúa Eduardo Pondal', lat: 42.430, lng: -8.644, pricePerNight: 8, totalBeds: 56, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-portugues', stageNumbers: [9], name: 'Albergue de Caldas de Reis', city: 'Caldas de Reis', address: 'Carretera Río Bermaña', lat: 42.604, lng: -8.640, pricePerNight: 6, totalBeds: 50, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-portugues', stageNumbers: [10], name: 'Albergue de Padrón', city: 'Padrón', address: 'Rúa Corredoira', lat: 42.738, lng: -8.660, pricePerNight: 6, totalBeds: 46, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-portugues', stageNumbers: [11], name: 'Albergue Monte do Gozo', city: 'Santiago de Compostela', address: 'Monte do Gozo', lat: 42.890, lng: -8.510, pricePerNight: 12, totalBeds: 400, type: 'municipal', amenities: ['kitchen', 'wifi'] },

  // Camino del Norte
  { routeSlug: 'camino-del-norte', stageNumbers: [1], name: 'Albergue de San Sebastián', city: 'San Sebastián', address: 'Igueldo', lat: 43.323, lng: -1.987, pricePerNight: 12, totalBeds: 32, type: 'municipal', amenities: ['wifi', 'kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [2], name: 'Albergue de Zarautz', city: 'Zarautz', address: 'Pelotari', lat: 43.286, lng: -2.171, pricePerNight: 10, totalBeds: 40, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [3], name: 'Albergue de Deba', city: 'Deba', address: 'Estación', lat: 43.296, lng: -2.356, pricePerNight: 8, totalBeds: 56, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [5], name: 'Albergue de Gernika', city: 'Gernika-Lumo', address: 'Kortezubi', lat: 43.317, lng: -2.679, pricePerNight: 8, totalBeds: 36, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [7], name: 'Albergue Claret Enea', city: 'Bilbao', address: 'Lezama', lat: 43.263, lng: -2.935, pricePerNight: 10, totalBeds: 24, type: 'parochial', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [9], name: 'Albergue de Castro Urdiales', city: 'Castro Urdiales', address: 'Calle La Ronda', lat: 43.383, lng: -3.219, pricePerNight: 9, totalBeds: 16, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [10], name: 'Albergue de Laredo', city: 'Laredo', address: 'San Francisco', lat: 43.412, lng: -3.412, pricePerNight: 10, totalBeds: 20, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [11], name: 'La Cabaña del Abuelo Peuto', city: 'Güemes', address: 'Carretera Cantera', lat: 43.451, lng: -3.679, pricePerNight: 0, totalBeds: 60, type: 'private', amenities: ['donativo', 'pilgrim-meal'], description: 'Run by Ernesto Bustio — most loved albergue on the Norte.' },
  { routeSlug: 'camino-del-norte', stageNumbers: [12], name: 'Albergue de Santander', city: 'Santander', address: 'Calle Magallanes', lat: 43.462, lng: -3.806, pricePerNight: 12, totalBeds: 40, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [14], name: 'Albergue de Comillas', city: 'Comillas', address: 'Calle Antonio López', lat: 43.388, lng: -4.290, pricePerNight: 10, totalBeds: 24, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [16], name: 'Albergue La Estación', city: 'Llanes', address: 'Estación', lat: 43.420, lng: -4.752, pricePerNight: 12, totalBeds: 30, type: 'private', amenities: ['wifi', 'kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [17], name: 'Albergue de Ribadesella', city: 'Ribadesella', address: 'Avda Palacio Valdés', lat: 43.461, lng: -5.061, pricePerNight: 10, totalBeds: 20, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [19], name: 'Albergue Santa Olaya', city: 'Gijón', address: 'Plaza Mayor', lat: 43.545, lng: -5.661, pricePerNight: 12, totalBeds: 36, type: 'private', amenities: ['wifi', 'kitchen', 'laundry'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [20], name: 'Albergue de Avilés', city: 'Avilés', address: 'La Magdalena', lat: 43.557, lng: -5.926, pricePerNight: 8, totalBeds: 24, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [25], name: 'Albergue de Ribadeo', city: 'Ribadeo', address: 'Calle de la Amistad', lat: 43.539, lng: -7.044, pricePerNight: 8, totalBeds: 12, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-del-norte', stageNumbers: [30], name: 'Monasterio de Sobrado', city: 'Sobrado dos Monxes', address: 'Plaza Portal', lat: 43.038, lng: -8.027, pricePerNight: 6, totalBeds: 120, type: 'parochial', amenities: ['kitchen'], description: 'Cistercian monastery hosting pilgrims for 800 years.' },

  // Camino Primitivo
  { routeSlug: 'camino-primitivo', stageNumbers: [1], name: 'Albergue El Salvador', city: 'Oviedo', address: 'Calle Leopoldo Alas 8', lat: 43.362, lng: -5.844, pricePerNight: 12, totalBeds: 50, type: 'parochial', amenities: ['wifi', 'kitchen'], description: 'Punto de partida del Primitivo, junto a la catedral.' },
  { routeSlug: 'camino-primitivo', stageNumbers: [2], name: 'Albergue de Salas', city: 'Salas', address: 'Carretera General', lat: 43.413, lng: -6.265, pricePerNight: 8, totalBeds: 24, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-primitivo', stageNumbers: [3], name: 'Albergue de Tineo', city: 'Tineo', address: 'Calle Mayor', lat: 43.337, lng: -6.418, pricePerNight: 8, totalBeds: 30, type: 'municipal', amenities: ['kitchen', 'laundry'] },
  { routeSlug: 'camino-primitivo', stageNumbers: [5], name: 'Refugio de La Mesa', city: 'La Mesa', address: 'Lugar Hospitales', lat: 43.226, lng: -6.815, pricePerNight: 0, totalBeds: 20, type: 'parochial', amenities: ['donativo'], description: 'Refugio aislado en la ruta de los Hospitales — donativo.' },
  { routeSlug: 'camino-primitivo', stageNumbers: [7], name: 'Albergue A Fonsagrada', city: 'A Fonsagrada', address: 'Calle Lugo', lat: 43.121, lng: -7.069, pricePerNight: 8, totalBeds: 36, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-primitivo', stageNumbers: [9], name: 'Albergue de Lugo', city: 'Lugo', address: 'Rúa das Nóreas', lat: 43.012, lng: -7.557, pricePerNight: 8, totalBeds: 70, type: 'municipal', amenities: ['kitchen', 'wifi', 'laundry'], description: 'Junto a la muralla romana.' },
  { routeSlug: 'camino-primitivo', stageNumbers: [11], name: 'Albergue de Melide', city: 'Melide', address: 'Rúa San Antonio', lat: 42.911, lng: -7.999, pricePerNight: 8, totalBeds: 130, type: 'municipal', amenities: ['kitchen'] },

  // Camino Inglés
  { routeSlug: 'camino-ingles', stageNumbers: [1], name: 'Albergue de Ferrol', city: 'Ferrol', address: 'Calle de Sánchez Calviño', lat: 43.484, lng: -8.235, pricePerNight: 8, totalBeds: 40, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-ingles', stageNumbers: [2], name: 'Albergue de Pontedeume', city: 'Pontedeume', address: 'Casa de Cultura', lat: 43.413, lng: -8.171, pricePerNight: 6, totalBeds: 22, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-ingles', stageNumbers: [2], name: 'Albergue de Betanzos', city: 'Betanzos', address: 'Plaza García Hermanos', lat: 43.281, lng: -8.213, pricePerNight: 8, totalBeds: 36, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-ingles', stageNumbers: [3], name: 'Albergue Hospital de Bruma', city: 'Hospital de Bruma', address: 'Lugar Bruma', lat: 43.142, lng: -8.243, pricePerNight: 8, totalBeds: 32, type: 'municipal', amenities: ['kitchen'], description: 'Donde confluyen las dos variantes (Ferrol/A Coruña).' },
  { routeSlug: 'camino-ingles', stageNumbers: [4], name: 'Albergue de Sigüeiro', city: 'Sigüeiro', address: 'Avenida Lugo', lat: 42.979, lng: -8.434, pricePerNight: 6, totalBeds: 24, type: 'municipal', amenities: ['kitchen'] },

  // Vía de la Plata (selección)
  { routeSlug: 'via-de-la-plata', stageNumbers: [1], name: 'Albergue Triana', city: 'Sevilla', address: 'Calle Castilla', lat: 37.389, lng: -5.997, pricePerNight: 12, totalBeds: 30, type: 'private', amenities: ['wifi', 'kitchen', 'laundry', 'aircon'] },
  { routeSlug: 'via-de-la-plata', stageNumbers: [4], name: 'Albergue de Monesterio', city: 'Monesterio', address: 'Calle Extremadura', lat: 38.080, lng: -6.262, pricePerNight: 10, totalBeds: 20, type: 'municipal', amenities: ['kitchen', 'aircon'] },
  { routeSlug: 'via-de-la-plata', stageNumbers: [9], name: 'Albergue Molino de Pancaliente', city: 'Mérida', address: 'Avenida Reina Sofía', lat: 38.917, lng: -6.345, pricePerNight: 14, totalBeds: 36, type: 'private', amenities: ['wifi', 'kitchen', 'pool', 'aircon'] },
  { routeSlug: 'via-de-la-plata', stageNumbers: [11], name: 'Albergue de Cáceres', city: 'Cáceres', address: 'Calle Ancha', lat: 39.474, lng: -6.371, pricePerNight: 10, totalBeds: 24, type: 'municipal', amenities: ['wifi', 'kitchen'] },
  { routeSlug: 'via-de-la-plata', stageNumbers: [17], name: 'Albergue Casa Sara', city: 'Fuenterroble de Salvatierra', address: 'Calle Iglesia', lat: 40.625, lng: -5.797, pricePerNight: 0, totalBeds: 50, type: 'parochial', amenities: ['donativo', 'pilgrim-meal', 'kitchen'], description: 'Donativo, dirigido por Don Blas — institución del Plata.' },
  { routeSlug: 'via-de-la-plata', stageNumbers: [19], name: 'Albergue de Salamanca', city: 'Salamanca', address: 'Calle Jesuitas', lat: 40.965, lng: -5.664, pricePerNight: 12, totalBeds: 50, type: 'parochial', amenities: ['wifi', 'kitchen'] },
  { routeSlug: 'via-de-la-plata', stageNumbers: [21], name: 'Albergue de Zamora', city: 'Zamora', address: 'Calle Corral Pintado', lat: 41.503, lng: -5.745, pricePerNight: 10, totalBeds: 30, type: 'municipal', amenities: ['kitchen', 'wifi'] },

  // Camino Aragonés
  { routeSlug: 'camino-aragones', stageNumbers: [1], name: 'Albergue de Jaca', city: 'Jaca', address: 'Calle del Conde Aznar', lat: 42.570, lng: -0.547, pricePerNight: 10, totalBeds: 50, type: 'municipal', amenities: ['kitchen', 'wifi'] },
  { routeSlug: 'camino-aragones', stageNumbers: [2], name: 'Albergue de Arrés', city: 'Arrés', address: 'Plaza del Pueblo', lat: 42.512, lng: -0.769, pricePerNight: 0, totalBeds: 22, type: 'parochial', amenities: ['donativo', 'pilgrim-meal'], description: 'Donativo, ambiente familiar.' },
  { routeSlug: 'camino-aragones', stageNumbers: [3], name: 'Albergue de Ruesta', city: 'Ruesta', address: 'Pueblo abandonado', lat: 42.547, lng: -1.080, pricePerNight: 8, totalBeds: 30, type: 'private', amenities: ['kitchen', 'pilgrim-meal'], description: 'Albergue en pueblo rehabilitado.' },
  { routeSlug: 'camino-aragones', stageNumbers: [4], name: 'Albergue de Sangüesa', city: 'Sangüesa', address: 'Mayor 30', lat: 42.578, lng: -1.281, pricePerNight: 8, totalBeds: 14, type: 'municipal', amenities: ['kitchen'] },
  { routeSlug: 'camino-aragones', stageNumbers: [6], name: 'Refugio de Eunate', city: 'Eunate', address: 'Iglesia de Santa María', lat: 42.685, lng: -1.770, pricePerNight: 0, totalBeds: 8, type: 'parochial', amenities: ['donativo'], description: 'Junto a la iglesia octogonal — donativo.' },
];
