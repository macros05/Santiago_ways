// Realistic stage data for the three primary Camino routes.
// Coordinates are simplified GeoJSON LineStrings — single anchor points per stage
// produced from open data. For production replace with full polylines from
// e.g. https://gronze.com or OpenStreetMap relation routes.

export type SeedStage = {
  number: number;
  name: string;
  startPoint: string;
  endPoint: string;
  startCoord: [number, number]; // [lng, lat]
  endCoord: [number, number];
  distanceKm: number;
  elevationGain: number;
  elevationLoss: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  tips: string;
};

export type SeedRoute = {
  slug: string;
  name: string;
  nameEn: string;
  totalKm: number;
  difficulty: string;
  startCity: string;
  country: string;
  description: string;
  color: string;
  isPopular: boolean;
  stages: SeedStage[];
};

export const FRANCES: SeedRoute = {
  slug: 'camino-frances',
  name: 'Camino Francés',
  nameEn: 'French Way',
  totalKm: 779,
  difficulty: 'medium',
  startCity: 'Saint-Jean-Pied-de-Port',
  country: 'France/Spain',
  description:
    'The most iconic Camino route. From the French Pyrenees through Pamplona, La Rioja, the Meseta, the mountains of León and into Galicia. 33 stages, around 5 weeks of walking.',
  color: '#FBBF24',
  isPopular: true,
  stages: [
    { number: 1, name: 'Saint-Jean to Roncesvalles', startPoint: 'Saint-Jean-Pied-de-Port', endPoint: 'Roncesvalles', startCoord: [-1.236, 43.163], endCoord: [-1.319, 43.009], distanceKm: 25.1, elevationGain: 1390, elevationLoss: 510, difficulty: 'hard', description: 'The Pyrenees crossing — physically demanding but unforgettable views.', tips: 'Start before 8am. Carry 2L water. Check Napoleon route weather; in winter use Valcarlos.' },
    { number: 2, name: 'Roncesvalles to Zubiri', startPoint: 'Roncesvalles', endPoint: 'Zubiri', startCoord: [-1.319, 43.009], endCoord: [-1.501, 42.929], distanceKm: 21.9, elevationGain: 220, elevationLoss: 640, difficulty: 'medium', description: 'Beech forests and small Basque villages, mostly downhill.', tips: 'The descent into Zubiri is steep and rocky — trekking poles help.' },
    { number: 3, name: 'Zubiri to Pamplona', startPoint: 'Zubiri', endPoint: 'Pamplona', startCoord: [-1.501, 42.929], endCoord: [-1.643, 42.812], distanceKm: 20.4, elevationGain: 80, elevationLoss: 210, difficulty: 'easy', description: 'Following the Arga river into Pamplona, the city of Hemingway.', tips: 'Pamplona has supermarkets and pharmacies — restock here.' },
    { number: 4, name: 'Pamplona to Puente la Reina', startPoint: 'Pamplona', endPoint: 'Puente la Reina', startCoord: [-1.643, 42.812], endCoord: [-1.815, 42.671], distanceKm: 23.8, elevationGain: 380, elevationLoss: 470, difficulty: 'medium', description: 'Over the Alto del Perdón with its iron pilgrim sculpture.', tips: 'Photograph the wind-farm ridge; cooling fountain in Uterga.' },
    { number: 5, name: 'Puente la Reina to Estella', startPoint: 'Puente la Reina', endPoint: 'Estella', startCoord: [-1.815, 42.671], endCoord: [-2.030, 42.671], distanceKm: 21.6, elevationGain: 320, elevationLoss: 290, difficulty: 'medium', description: 'Vineyards, Romanesque churches, the Roman road of Cirauqui.', tips: 'Stop at Cirauqui for ham and wine — village stays alive at lunch.' },
    { number: 6, name: 'Estella to Los Arcos', startPoint: 'Estella', endPoint: 'Los Arcos', startCoord: [-2.030, 42.671], endCoord: [-2.190, 42.570], distanceKm: 21.3, elevationGain: 180, elevationLoss: 260, difficulty: 'easy', description: 'Pass the famous Bodegas Irache wine fountain.', tips: 'The wine fountain opens roughly 8am–8pm. Bring a small cup.' },
    { number: 7, name: 'Los Arcos to Logroño', startPoint: 'Los Arcos', endPoint: 'Logroño', startCoord: [-2.190, 42.570], endCoord: [-2.448, 42.466], distanceKm: 27.8, elevationGain: 180, elevationLoss: 260, difficulty: 'medium', description: 'Enter La Rioja, capital of Spanish wine.', tips: 'Long stretch with little shade — start at sunrise.' },
    { number: 8, name: 'Logroño to Nájera', startPoint: 'Logroño', endPoint: 'Nájera', startCoord: [-2.448, 42.466], endCoord: [-2.728, 42.418], distanceKm: 28.9, elevationGain: 290, elevationLoss: 270, difficulty: 'medium', description: 'Through the vineyards of La Rioja.', tips: 'Stop at Navarrete bodega; long flat day rewards an early start.' },
    { number: 9, name: 'Nájera to Santo Domingo de la Calzada', startPoint: 'Nájera', endPoint: 'Santo Domingo de la Calzada', startCoord: [-2.728, 42.418], endCoord: [-2.954, 42.440], distanceKm: 21.0, elevationGain: 240, elevationLoss: 170, difficulty: 'easy', description: 'Rolling wheat fields toward the city of the chickens.', tips: 'Visit the cathedral with the live chicken and rooster.' },
    { number: 10, name: 'Santo Domingo to Belorado', startPoint: 'Santo Domingo de la Calzada', endPoint: 'Belorado', startCoord: [-2.954, 42.440], endCoord: [-3.190, 42.420], distanceKm: 22.7, elevationGain: 180, elevationLoss: 130, difficulty: 'easy', description: 'Cross into Castilla y León. Quiet villages and fields.', tips: 'Belorado has a lovely main square; rest in the shade.' },
    { number: 11, name: 'Belorado to San Juan de Ortega', startPoint: 'Belorado', endPoint: 'San Juan de Ortega', startCoord: [-3.190, 42.420], endCoord: [-3.439, 42.376], distanceKm: 24.0, elevationGain: 590, elevationLoss: 350, difficulty: 'medium', description: 'Climb into the Montes de Oca, oak forest and silence.', tips: 'Few services between villages — carry food and water.' },
    { number: 12, name: 'San Juan de Ortega to Burgos', startPoint: 'San Juan de Ortega', endPoint: 'Burgos', startCoord: [-3.439, 42.376], endCoord: [-3.703, 42.341], distanceKm: 25.8, elevationGain: 200, elevationLoss: 350, difficulty: 'medium', description: 'Industrial outskirts give way to a stunning Gothic cathedral.', tips: 'Take the river path into Burgos to skip the highway.' },
    { number: 13, name: 'Burgos to Hornillos del Camino', startPoint: 'Burgos', endPoint: 'Hornillos del Camino', startCoord: [-3.703, 42.341], endCoord: [-3.903, 42.337], distanceKm: 21.0, elevationGain: 130, elevationLoss: 130, difficulty: 'easy', description: 'Beginning of the legendary Meseta.', tips: 'Open landscape — start before sunrise in summer.' },
    { number: 14, name: 'Hornillos to Castrojeriz', startPoint: 'Hornillos del Camino', endPoint: 'Castrojeriz', startCoord: [-3.903, 42.337], endCoord: [-4.135, 42.288], distanceKm: 19.9, elevationGain: 160, elevationLoss: 190, difficulty: 'easy', description: 'Wheat fields stretching to the horizon.', tips: 'The stork-topped church ruins of San Antón are worth a stop.' },
    { number: 15, name: 'Castrojeriz to Frómista', startPoint: 'Castrojeriz', endPoint: 'Frómista', startCoord: [-4.135, 42.288], endCoord: [-4.405, 42.265], distanceKm: 24.7, elevationGain: 270, elevationLoss: 290, difficulty: 'medium', description: 'Over the Alto de Mostelares for sweeping Meseta views.', tips: 'The descent is steep — take it slow.' },
    { number: 16, name: 'Frómista to Carrión de los Condes', startPoint: 'Frómista', endPoint: 'Carrión de los Condes', startCoord: [-4.405, 42.265], endCoord: [-4.602, 42.337], distanceKm: 19.3, elevationGain: 50, elevationLoss: 50, difficulty: 'easy', description: 'Walk along the Canal de Castilla.', tips: 'The nuns of Santa María sing for pilgrims at evening mass.' },
    { number: 17, name: 'Carrión to Terradillos de los Templarios', startPoint: 'Carrión de los Condes', endPoint: 'Terradillos de los Templarios', startCoord: [-4.602, 42.337], endCoord: [-4.910, 42.354], distanceKm: 26.6, elevationGain: 130, elevationLoss: 110, difficulty: 'medium', description: '17 km without a fountain — pure Meseta silence.', tips: 'Carry 2L water and snacks; no services until Calzadilla.' },
    { number: 18, name: 'Terradillos to El Burgo Ranero', startPoint: 'Terradillos de los Templarios', endPoint: 'El Burgo Ranero', startCoord: [-4.910, 42.354], endCoord: [-5.241, 42.422], distanceKm: 30.6, elevationGain: 100, elevationLoss: 110, difficulty: 'medium', description: 'Cross into León province through Sahagún.', tips: 'Sahagún is the geographical halfway point — stamp your credential.' },
    { number: 19, name: 'El Burgo Ranero to Mansilla de las Mulas', startPoint: 'El Burgo Ranero', endPoint: 'Mansilla de las Mulas', startCoord: [-5.241, 42.422], endCoord: [-5.418, 42.498], distanceKm: 18.6, elevationGain: 30, elevationLoss: 50, difficulty: 'easy', description: 'Long, flat, lined with oak trees.', tips: 'A meditative day — perfect for podcasts or silence.' },
    { number: 20, name: 'Mansilla to León', startPoint: 'Mansilla de las Mulas', endPoint: 'León', startCoord: [-5.418, 42.498], endCoord: [-5.567, 42.598], distanceKm: 18.6, elevationGain: 100, elevationLoss: 70, difficulty: 'easy', description: 'Enter the Gothic cathedral city of León.', tips: 'Rest day option — León has the most beautiful cathedral on the route.' },
    { number: 21, name: 'León to San Martín del Camino', startPoint: 'León', endPoint: 'San Martín del Camino', startCoord: [-5.567, 42.598], endCoord: [-5.788, 42.502], distanceKm: 24.6, elevationGain: 110, elevationLoss: 130, difficulty: 'easy', description: 'Leaving the city through suburbs and farmland.', tips: 'Several route options — the river path to Virgen del Camino is gentler.' },
    { number: 22, name: 'San Martín to Astorga', startPoint: 'San Martín del Camino', endPoint: 'Astorga', startCoord: [-5.788, 42.502], endCoord: [-6.054, 42.456], distanceKm: 23.7, elevationGain: 200, elevationLoss: 160, difficulty: 'medium', description: 'Cross the medieval bridge of Hospital de Órbigo.', tips: 'Astorga is famous for chocolate — visit the museum.' },
    { number: 23, name: 'Astorga to Foncebadón', startPoint: 'Astorga', endPoint: 'Foncebadón', startCoord: [-6.054, 42.456], endCoord: [-6.355, 42.494], distanceKm: 25.6, elevationGain: 760, elevationLoss: 100, difficulty: 'hard', description: 'Climbing into the Maragatería mountains.', tips: 'Foncebadón is at 1500m — pack warm clothes.' },
    { number: 24, name: 'Foncebadón to Ponferrada', startPoint: 'Foncebadón', endPoint: 'Ponferrada', startCoord: [-6.355, 42.494], endCoord: [-6.589, 42.547], distanceKm: 27.4, elevationGain: 280, elevationLoss: 1380, difficulty: 'hard', description: 'Pass the Cruz de Ferro and descend into the Bierzo valley.', tips: 'Bring a stone from home for the Cruz de Ferro tradition. The descent destroys knees — take it slow.' },
    { number: 25, name: 'Ponferrada to Villafranca del Bierzo', startPoint: 'Ponferrada', endPoint: 'Villafranca del Bierzo', startCoord: [-6.589, 42.547], endCoord: [-6.811, 42.609], distanceKm: 24.2, elevationGain: 260, elevationLoss: 220, difficulty: 'medium', description: 'Through Bierzo wine country.', tips: 'Cherries in season, mencía wine year-round.' },
    { number: 26, name: 'Villafranca to O Cebreiro', startPoint: 'Villafranca del Bierzo', endPoint: 'O Cebreiro', startCoord: [-6.811, 42.609], endCoord: [-7.044, 42.708], distanceKm: 28.4, elevationGain: 1300, elevationLoss: 280, difficulty: 'hard', description: 'The big climb into Galicia — 800m of ascent in the last 9km.', tips: 'Pace yourself. O Cebreiro is mystical at sunset.' },
    { number: 27, name: 'O Cebreiro to Triacastela', startPoint: 'O Cebreiro', endPoint: 'Triacastela', startCoord: [-7.044, 42.708], endCoord: [-7.241, 42.755], distanceKm: 21.0, elevationGain: 320, elevationLoss: 950, difficulty: 'medium', description: 'Galicia at last — green hills and ancient stone villages.', tips: 'Two route options after Triacastela: via Samos (longer, monastery) or San Xil (shorter).' },
    { number: 28, name: 'Triacastela to Sarria', startPoint: 'Triacastela', endPoint: 'Sarria', startCoord: [-7.241, 42.755], endCoord: [-7.418, 42.781], distanceKm: 18.4, elevationGain: 290, elevationLoss: 470, difficulty: 'medium', description: 'Choose the Samos detour for the Benedictine monastery.', tips: 'Sarria is where many pilgrims start to qualify for the Compostela (last 100km).' },
    { number: 29, name: 'Sarria to Portomarín', startPoint: 'Sarria', endPoint: 'Portomarín', startCoord: [-7.418, 42.781], endCoord: [-7.617, 42.808], distanceKm: 22.4, elevationGain: 370, elevationLoss: 540, difficulty: 'medium', description: 'The 100km marker — Camino gets more crowded from here.', tips: 'Cross the long bridge into Portomarín for views over the reservoir.' },
    { number: 30, name: 'Portomarín to Palas de Rei', startPoint: 'Portomarín', endPoint: 'Palas de Rei', startCoord: [-7.617, 42.808], endCoord: [-7.869, 42.873], distanceKm: 25.0, elevationGain: 460, elevationLoss: 350, difficulty: 'medium', description: 'Eucalyptus forests and gentle climbs.', tips: 'Stop at A Brea bar for a Galician octopus snack.' },
    { number: 31, name: 'Palas de Rei to Arzúa', startPoint: 'Palas de Rei', endPoint: 'Arzúa', startCoord: [-7.869, 42.873], endCoord: [-8.157, 42.929], distanceKm: 28.5, elevationGain: 320, elevationLoss: 350, difficulty: 'medium', description: 'Cross into A Coruña province; many pilgrim crosses.', tips: 'Try queso de Arzúa, soft cow-milk cheese.' },
    { number: 32, name: 'Arzúa to O Pedrouzo', startPoint: 'Arzúa', endPoint: 'O Pedrouzo', startCoord: [-8.157, 42.929], endCoord: [-8.358, 42.907], distanceKm: 19.3, elevationGain: 230, elevationLoss: 260, difficulty: 'easy', description: 'Rolling forests; anticipation builds.', tips: 'Short stage — rest well before tomorrow.' },
    { number: 33, name: 'O Pedrouzo to Santiago de Compostela', startPoint: 'O Pedrouzo', endPoint: 'Santiago de Compostela', startCoord: [-8.358, 42.907], endCoord: [-8.545, 42.881], distanceKm: 19.4, elevationGain: 290, elevationLoss: 280, difficulty: 'easy', description: 'The final stage. Monte do Gozo offers the first view of the cathedral.', tips: 'Aim to arrive before noon for the Pilgrim Mass.' },
  ],
};

export const PORTUGUES: SeedRoute = {
  slug: 'camino-portugues',
  name: 'Camino Portugués',
  nameEn: 'Portuguese Way',
  totalKm: 240,
  difficulty: 'easy',
  startCity: 'Porto',
  country: 'Portugal/Spain',
  description:
    'A gentler, coastal-friendly route from Porto to Santiago. 14 stages along Atlantic-facing villages, vineyards and pine forests. About 12 days.',
  color: '#10B981',
  isPopular: true,
  stages: [
    { number: 1, name: 'Porto to Vilarinho', startPoint: 'Porto', endPoint: 'Vilarinho', startCoord: [-8.609, 41.149], endCoord: [-8.585, 41.290], distanceKm: 25.5, elevationGain: 180, elevationLoss: 90, difficulty: 'medium', description: 'Leaving the historic centre via the riverside.', tips: 'Take the metro past industrial outskirts to save your legs.' },
    { number: 2, name: 'Vilarinho to Barcelos', startPoint: 'Vilarinho', endPoint: 'Barcelos', startCoord: [-8.585, 41.290], endCoord: [-8.617, 41.531], distanceKm: 27.9, elevationGain: 220, elevationLoss: 230, difficulty: 'medium', description: 'Through Minho farmland.', tips: 'Barcelos hosts a Thursday market — plan your day around it.' },
    { number: 3, name: 'Barcelos to Ponte de Lima', startPoint: 'Barcelos', endPoint: 'Ponte de Lima', startCoord: [-8.617, 41.531], endCoord: [-8.583, 41.768], distanceKm: 33.0, elevationGain: 280, elevationLoss: 250, difficulty: 'hard', description: 'Long stage — split it if needed.', tips: 'Ponte de Lima is one of Portugal’s prettiest towns. Stay overnight if possible.' },
    { number: 4, name: 'Ponte de Lima to Rubiães', startPoint: 'Ponte de Lima', endPoint: 'Rubiães', startCoord: [-8.583, 41.768], endCoord: [-8.604, 41.925], distanceKm: 17.5, elevationGain: 470, elevationLoss: 230, difficulty: 'medium', description: 'The Alto da Portela Grande climb.', tips: 'Beautiful hilltop chapel midway.' },
    { number: 5, name: 'Rubiães to Tui', startPoint: 'Rubiães', endPoint: 'Tui', startCoord: [-8.604, 41.925], endCoord: [-8.643, 42.046], distanceKm: 19.0, elevationGain: 100, elevationLoss: 200, difficulty: 'easy', description: 'Cross the international bridge over the Minho into Spain.', tips: 'Tui marks the official 100km point for the Compostela on this route.' },
    { number: 6, name: 'Tui to O Porriño', startPoint: 'Tui', endPoint: 'O Porriño', startCoord: [-8.643, 42.046], endCoord: [-8.620, 42.158], distanceKm: 16.0, elevationGain: 150, elevationLoss: 130, difficulty: 'easy', description: 'Riverside path through the Louro nature reserve.', tips: 'Avoid the industrial park alternative — take the official path.' },
    { number: 7, name: 'O Porriño to Redondela', startPoint: 'O Porriño', endPoint: 'Redondela', startCoord: [-8.620, 42.158], endCoord: [-8.610, 42.282], distanceKm: 15.0, elevationGain: 280, elevationLoss: 290, difficulty: 'medium', description: 'Climbs and descents around Mos.', tips: 'Eucalyptus forest is intense after rain.' },
    { number: 8, name: 'Redondela to Pontevedra', startPoint: 'Redondela', endPoint: 'Pontevedra', startCoord: [-8.610, 42.282], endCoord: [-8.644, 42.430], distanceKm: 19.5, elevationGain: 210, elevationLoss: 200, difficulty: 'easy', description: 'Sea views around Arcade.', tips: 'Arcade is famous for oysters — stop for lunch.' },
    { number: 9, name: 'Pontevedra to Caldas de Reis', startPoint: 'Pontevedra', endPoint: 'Caldas de Reis', startCoord: [-8.644, 42.430], endCoord: [-8.640, 42.604], distanceKm: 21.6, elevationGain: 280, elevationLoss: 250, difficulty: 'medium', description: 'Roman thermal-bath town.', tips: 'Free hot-spring foot-bath in the centre.' },
    { number: 10, name: 'Caldas de Reis to Padrón', startPoint: 'Caldas de Reis', endPoint: 'Padrón', startCoord: [-8.640, 42.604], endCoord: [-8.660, 42.738], distanceKm: 18.5, elevationGain: 200, elevationLoss: 230, difficulty: 'easy', description: 'Padrón is the legendary landing spot of St James\' boat.', tips: 'Try Padrón peppers — local specialty.' },
    { number: 11, name: 'Padrón to Santiago de Compostela', startPoint: 'Padrón', endPoint: 'Santiago de Compostela', startCoord: [-8.660, 42.738], endCoord: [-8.545, 42.881], distanceKm: 24.4, elevationGain: 360, elevationLoss: 230, difficulty: 'medium', description: 'The final climb into Santiago.', tips: 'Peak excitement — drink water and savour the moment.' },
    // Coastal variant alternates
    { number: 12, name: 'Santiago to Negreira (Finisterre extension)', startPoint: 'Santiago de Compostela', endPoint: 'Negreira', startCoord: [-8.545, 42.881], endCoord: [-8.732, 42.910], distanceKm: 21.0, elevationGain: 410, elevationLoss: 470, difficulty: 'medium', description: 'Optional extension toward the Atlantic.', tips: 'Many pilgrims continue to Finisterre for closure.' },
    { number: 13, name: 'Negreira to Olveiroa', startPoint: 'Negreira', endPoint: 'Olveiroa', startCoord: [-8.732, 42.910], endCoord: [-9.041, 42.940], distanceKm: 33.0, elevationGain: 530, elevationLoss: 510, difficulty: 'hard', description: 'Long, lonely Galician hills.', tips: 'Stock food in Negreira — sparse services on this stage.' },
    { number: 14, name: 'Olveiroa to Finisterre', startPoint: 'Olveiroa', endPoint: 'Finisterre', startCoord: [-9.041, 42.940], endCoord: [-9.273, 42.905], distanceKm: 32.5, elevationGain: 410, elevationLoss: 700, difficulty: 'hard', description: 'Reach the end of the world.', tips: 'Catch the sunset at Cape Finisterre lighthouse.' },
  ],
};

export const NORTE: SeedRoute = {
  slug: 'camino-del-norte',
  name: 'Camino del Norte',
  nameEn: 'Northern Way',
  totalKm: 825,
  difficulty: 'hard',
  startCity: 'Irún',
  country: 'Spain',
  description:
    'The northern coastal route from the French border at Irún along the Cantabrian sea, through the Basque country, Cantabria, Asturias and Galicia. 33 stages, dramatic coast, wetter climate.',
  color: '#3B82F6',
  isPopular: false,
  stages: [
    { number: 1, name: 'Irún to San Sebastián', startPoint: 'Irún', endPoint: 'San Sebastián', startCoord: [-1.789, 43.339], endCoord: [-1.987, 43.323], distanceKm: 25.0, elevationGain: 760, elevationLoss: 760, difficulty: 'hard', description: 'Up over Jaizkibel for stunning ocean views.', tips: 'San Sebastián is a perfect rest day — pintxos in the old town.' },
    { number: 2, name: 'San Sebastián to Zarautz', startPoint: 'San Sebastián', endPoint: 'Zarautz', startCoord: [-1.987, 43.323], endCoord: [-2.171, 43.286], distanceKm: 22.4, elevationGain: 650, elevationLoss: 700, difficulty: 'hard', description: 'Steep climbs over headlands.', tips: 'Zarautz beach is spectacular — earn it.' },
    { number: 3, name: 'Zarautz to Deba', startPoint: 'Zarautz', endPoint: 'Deba', startCoord: [-2.171, 43.286], endCoord: [-2.356, 43.296], distanceKm: 22.0, elevationGain: 620, elevationLoss: 660, difficulty: 'hard', description: 'Cliffs, txakoli vineyards, hidden coves.', tips: 'Frequent rain — pack a poncho even in July.' },
    { number: 4, name: 'Deba to Markina', startPoint: 'Deba', endPoint: 'Markina-Xemein', startCoord: [-2.356, 43.296], endCoord: [-2.498, 43.267], distanceKm: 24.0, elevationGain: 740, elevationLoss: 660, difficulty: 'hard', description: 'Inland through Basque farmland.', tips: 'The Bolibar village stop has a fine albergue.' },
    { number: 5, name: 'Markina to Gernika', startPoint: 'Markina-Xemein', endPoint: 'Gernika-Lumo', startCoord: [-2.498, 43.267], endCoord: [-2.679, 43.317], distanceKm: 25.0, elevationGain: 680, elevationLoss: 770, difficulty: 'hard', description: 'Pass the historic Tree of Gernika.', tips: 'The Peace Museum is a powerful stop.' },
    { number: 6, name: 'Gernika to Lezama', startPoint: 'Gernika-Lumo', endPoint: 'Lezama', startCoord: [-2.679, 43.317], endCoord: [-2.808, 43.299], distanceKm: 21.0, elevationGain: 670, elevationLoss: 590, difficulty: 'medium', description: 'Approach to Bilbao through valleys.', tips: 'Skip the Bilbao detour unless you want a city day.' },
    { number: 7, name: 'Lezama to Bilbao', startPoint: 'Lezama', endPoint: 'Bilbao', startCoord: [-2.808, 43.299], endCoord: [-2.935, 43.263], distanceKm: 11.5, elevationGain: 380, elevationLoss: 460, difficulty: 'easy', description: 'Short stage into the Guggenheim city.', tips: 'Take a metro day to recover — Bilbao deserves attention.' },
    { number: 8, name: 'Bilbao to Portugalete', startPoint: 'Bilbao', endPoint: 'Portugalete', startCoord: [-2.935, 43.263], endCoord: [-3.022, 43.319], distanceKm: 19.6, elevationGain: 280, elevationLoss: 310, difficulty: 'easy', description: 'Riverside walk past the Guggenheim and shipyards.', tips: 'Cross the Vizcaya transporter bridge — UNESCO site.' },
    { number: 9, name: 'Portugalete to Castro Urdiales', startPoint: 'Portugalete', endPoint: 'Castro Urdiales', startCoord: [-3.022, 43.319], endCoord: [-3.219, 43.383], distanceKm: 26.6, elevationGain: 540, elevationLoss: 510, difficulty: 'medium', description: 'Cross into Cantabria.', tips: 'Coastal alternative is more scenic but longer.' },
    { number: 10, name: 'Castro Urdiales to Laredo', startPoint: 'Castro Urdiales', endPoint: 'Laredo', startCoord: [-3.219, 43.383], endCoord: [-3.412, 43.412], distanceKm: 27.0, elevationGain: 560, elevationLoss: 580, difficulty: 'hard', description: 'Up and down the headlands of east Cantabria.', tips: 'Laredo beach is 4km of golden sand.' },
    { number: 11, name: 'Laredo to Güemes', startPoint: 'Laredo', endPoint: 'Güemes', startCoord: [-3.412, 43.412], endCoord: [-3.679, 43.451], distanceKm: 28.0, elevationGain: 350, elevationLoss: 350, difficulty: 'medium', description: 'Take the boat from Santoña to Laredo to skip a long beach walk.', tips: 'The Güemes albergue (Ernesto Bustio) is legendary; donativo.' },
    { number: 12, name: 'Güemes to Santander', startPoint: 'Güemes', endPoint: 'Santander', startCoord: [-3.679, 43.451], endCoord: [-3.806, 43.462], distanceKm: 12.0, elevationGain: 100, elevationLoss: 130, difficulty: 'easy', description: 'Short ferry-included day.', tips: 'Take the Pedreña ferry into Santander.' },
    { number: 13, name: 'Santander to Santillana del Mar', startPoint: 'Santander', endPoint: 'Santillana del Mar', startCoord: [-3.806, 43.462], endCoord: [-4.108, 43.395], distanceKm: 35.5, elevationGain: 360, elevationLoss: 380, difficulty: 'hard', description: 'Long stage — many split at Boo de Piélagos.', tips: 'Santillana del Mar is medieval; visit Altamira caves nearby.' },
    { number: 14, name: 'Santillana to Comillas', startPoint: 'Santillana del Mar', endPoint: 'Comillas', startCoord: [-4.108, 43.395], endCoord: [-4.290, 43.388], distanceKm: 22.0, elevationGain: 350, elevationLoss: 370, difficulty: 'medium', description: 'Beachfront walking and Gaudí architecture.', tips: 'Visit El Capricho de Gaudí.' },
    { number: 15, name: 'Comillas to Colombres', startPoint: 'Comillas', endPoint: 'Colombres', startCoord: [-4.290, 43.388], endCoord: [-4.567, 43.397], distanceKm: 28.0, elevationGain: 480, elevationLoss: 470, difficulty: 'hard', description: 'Cross into Asturias via San Vicente de la Barquera.', tips: 'San Vicente has the best views back across the bay.' },
    { number: 16, name: 'Colombres to Llanes', startPoint: 'Colombres', endPoint: 'Llanes', startCoord: [-4.567, 43.397], endCoord: [-4.752, 43.420], distanceKm: 22.5, elevationGain: 350, elevationLoss: 350, difficulty: 'medium', description: 'Quintessential Asturias coast.', tips: 'Try Asturian cider in Llanes.' },
    { number: 17, name: 'Llanes to Ribadesella', startPoint: 'Llanes', endPoint: 'Ribadesella', startCoord: [-4.752, 43.420], endCoord: [-5.061, 43.461], distanceKm: 31.0, elevationGain: 380, elevationLoss: 390, difficulty: 'hard', description: 'Cliff-top trails and hidden bufones.', tips: 'The bufones blow seawater at high tide — time your stop.' },
    { number: 18, name: 'Ribadesella to Sebrayo', startPoint: 'Ribadesella', endPoint: 'Sebrayo', startCoord: [-5.061, 43.461], endCoord: [-5.323, 43.466], distanceKm: 29.0, elevationGain: 540, elevationLoss: 540, difficulty: 'hard', description: 'Inland turn through eucalyptus forests.', tips: 'Sebrayo albergue is rustic — bring food.' },
    { number: 19, name: 'Sebrayo to Gijón', startPoint: 'Sebrayo', endPoint: 'Gijón', startCoord: [-5.323, 43.466], endCoord: [-5.661, 43.545], distanceKm: 32.0, elevationGain: 470, elevationLoss: 510, difficulty: 'hard', description: 'Industrial fringe before Gijón’s old town.', tips: 'Gijón’s Cimadevilla quarter is great for cider.' },
    { number: 20, name: 'Gijón to Avilés', startPoint: 'Gijón', endPoint: 'Avilés', startCoord: [-5.661, 43.545], endCoord: [-5.926, 43.557], distanceKm: 25.0, elevationGain: 270, elevationLoss: 270, difficulty: 'medium', description: 'Coastal industrial path.', tips: 'Avilés old town is unexpectedly beautiful.' },
    { number: 21, name: 'Avilés to Soto de Luiña', startPoint: 'Avilés', endPoint: 'Soto de Luiña', startCoord: [-5.926, 43.557], endCoord: [-6.241, 43.554], distanceKm: 22.0, elevationGain: 350, elevationLoss: 320, difficulty: 'medium', description: 'Coastline returns; rural villages.', tips: 'Look for the wooden hórreos.' },
    { number: 22, name: 'Soto de Luiña to Cadavedo', startPoint: 'Soto de Luiña', endPoint: 'Cadavedo', startCoord: [-6.241, 43.554], endCoord: [-6.420, 43.555], distanceKm: 17.0, elevationGain: 420, elevationLoss: 420, difficulty: 'medium', description: 'Quiet coastal village.', tips: 'Cadavedo beach is a quick detour.' },
    { number: 23, name: 'Cadavedo to Luarca', startPoint: 'Cadavedo', endPoint: 'Luarca', startCoord: [-6.420, 43.555], endCoord: [-6.534, 43.543], distanceKm: 14.5, elevationGain: 200, elevationLoss: 240, difficulty: 'easy', description: 'White-village fishing port.', tips: 'Famous cementerio with sea views.' },
    { number: 24, name: 'Luarca to La Caridad', startPoint: 'Luarca', endPoint: 'La Caridad', startCoord: [-6.534, 43.543], endCoord: [-6.812, 43.554], distanceKm: 30.0, elevationGain: 380, elevationLoss: 380, difficulty: 'hard', description: 'Long stage with limited services.', tips: 'Stock up in Navia mid-stage.' },
    { number: 25, name: 'La Caridad to Ribadeo', startPoint: 'La Caridad', endPoint: 'Ribadeo', startCoord: [-6.812, 43.554], endCoord: [-7.044, 43.539], distanceKm: 22.0, elevationGain: 280, elevationLoss: 280, difficulty: 'medium', description: 'Cross into Galicia.', tips: 'Visit Playa de las Catedrales nearby.' },
    { number: 26, name: 'Ribadeo to Lourenzá', startPoint: 'Ribadeo', endPoint: 'Lourenzá', startCoord: [-7.044, 43.539], endCoord: [-7.295, 43.473], distanceKm: 28.5, elevationGain: 480, elevationLoss: 380, difficulty: 'hard', description: 'Inland turn for the rest of the route.', tips: 'Try Lourenzá white beans.' },
    { number: 27, name: 'Lourenzá to Abadín', startPoint: 'Lourenzá', endPoint: 'Abadín', startCoord: [-7.295, 43.473], endCoord: [-7.483, 43.420], distanceKm: 25.0, elevationGain: 470, elevationLoss: 320, difficulty: 'medium', description: 'Quiet Galician hills.', tips: 'Mondoñedo (mid-stage) has a beautiful cathedral.' },
    { number: 28, name: 'Abadín to Vilalba', startPoint: 'Abadín', endPoint: 'Vilalba', startCoord: [-7.483, 43.420], endCoord: [-7.681, 43.299], distanceKm: 21.0, elevationGain: 240, elevationLoss: 350, difficulty: 'medium', description: 'Tower of the Andrade family marks the town.', tips: 'Sleep in the parador — cheap pilgrim rate.' },
    { number: 29, name: 'Vilalba to Baamonde', startPoint: 'Vilalba', endPoint: 'Baamonde', startCoord: [-7.681, 43.299], endCoord: [-7.880, 43.211], distanceKm: 19.5, elevationGain: 200, elevationLoss: 280, difficulty: 'easy', description: 'Easy connecting stage.', tips: 'Albergue is in a converted mansion.' },
    { number: 30, name: 'Baamonde to Sobrado dos Monxes', startPoint: 'Baamonde', endPoint: 'Sobrado dos Monxes', startCoord: [-7.880, 43.211], endCoord: [-8.027, 43.038], distanceKm: 39.5, elevationGain: 580, elevationLoss: 380, difficulty: 'hard', description: 'Very long stage to a Cistercian monastery.', tips: 'Split at Miraz if needed; the monastery offers vespers.' },
    { number: 31, name: 'Sobrado to Arzúa', startPoint: 'Sobrado dos Monxes', endPoint: 'Arzúa', startCoord: [-8.027, 43.038], endCoord: [-8.157, 42.929], distanceKm: 22.0, elevationGain: 320, elevationLoss: 470, difficulty: 'medium', description: 'Joins the Camino Francés.', tips: 'Arzúa is now busy with Francés pilgrims.' },
    { number: 32, name: 'Arzúa to O Pedrouzo', startPoint: 'Arzúa', endPoint: 'O Pedrouzo', startCoord: [-8.157, 42.929], endCoord: [-8.358, 42.907], distanceKm: 19.3, elevationGain: 230, elevationLoss: 260, difficulty: 'easy', description: 'Shared with Francés.', tips: 'Pedrouzo is the last common stop.' },
    { number: 33, name: 'O Pedrouzo to Santiago de Compostela', startPoint: 'O Pedrouzo', endPoint: 'Santiago de Compostela', startCoord: [-8.358, 42.907], endCoord: [-8.545, 42.881], distanceKm: 19.4, elevationGain: 290, elevationLoss: 280, difficulty: 'easy', description: 'Final approach via Monte do Gozo.', tips: 'Aim for the noon Pilgrim Mass.' },
  ],
};

export const PRIMITIVO: SeedRoute = {
  slug: 'camino-primitivo',
  name: 'Camino Primitivo',
  nameEn: 'Original Way',
  totalKm: 321,
  difficulty: 'hard',
  startCity: 'Oviedo',
  country: 'Spain',
  description:
    'La ruta original. Desde Oviedo a través de las montañas asturianas, considerada la primera peregrinación a Santiago. 14 etapas, exigente físicamente, paisajes espectaculares.',
  color: '#8B5CF6',
  isPopular: false,
  stages: [
    { number: 1, name: 'Oviedo a Grado', startPoint: 'Oviedo', endPoint: 'Grado', startCoord: [-5.844, 43.362], endCoord: [-6.069, 43.388], distanceKm: 25.5, elevationGain: 480, elevationLoss: 540, difficulty: 'medium', description: 'Salida desde la Catedral de San Salvador. Subida al Alto del Escamplero.', tips: 'Sello en la catedral antes de salir. Incomparable la vista desde el Escamplero.' },
    { number: 2, name: 'Grado a Salas', startPoint: 'Grado', endPoint: 'Salas', startCoord: [-6.069, 43.388], endCoord: [-6.265, 43.413], distanceKm: 22.7, elevationGain: 850, elevationLoss: 730, difficulty: 'hard', description: 'Atraviesa el Alto del Fresno. Asturias rural en estado puro.', tips: 'Lleva agua para el Alto del Fresno — 3 km sin fuentes.' },
    { number: 3, name: 'Salas a Tineo', startPoint: 'Salas', endPoint: 'Tineo', startCoord: [-6.265, 43.413], endCoord: [-6.418, 43.337], distanceKm: 19.8, elevationGain: 750, elevationLoss: 360, difficulty: 'medium', description: 'Bosques de castaños y robles, vistas a la sierra de Tineo.', tips: 'Tineo tiene buena gastronomía — prueba el bollo preñao.' },
    { number: 4, name: 'Tineo a Pola de Allande', startPoint: 'Tineo', endPoint: 'Pola de Allande', startCoord: [-6.418, 43.337], endCoord: [-6.628, 43.270], distanceKm: 27.0, elevationGain: 880, elevationLoss: 1020, difficulty: 'hard', description: 'Ruta por Borres con opción de albergue intermedio.', tips: 'Si vas justo de fuerzas, parte la etapa en Borres.' },
    { number: 5, name: 'Pola de Allande a La Mesa (Hospitales)', startPoint: 'Pola de Allande', endPoint: 'La Mesa', startCoord: [-6.628, 43.270], endCoord: [-6.815, 43.226], distanceKm: 22.0, elevationGain: 1100, elevationLoss: 700, difficulty: 'hard', description: 'La etapa más mítica del Primitivo: Puerto del Palo y ruta de los Hospitales.', tips: 'Solo en buen tiempo. Con niebla, evita la ruta de Hospitales y baja por Pola de Allande.' },
    { number: 6, name: 'La Mesa a Grandas de Salime', startPoint: 'La Mesa', endPoint: 'Grandas de Salime', startCoord: [-6.815, 43.226], endCoord: [-6.882, 43.198], distanceKm: 15.0, elevationGain: 280, elevationLoss: 1240, difficulty: 'medium', description: 'Bajada espectacular al embalse de Salime.', tips: 'Para descansar las rodillas tras el descenso.' },
    { number: 7, name: 'Grandas de Salime a A Fonsagrada', startPoint: 'Grandas de Salime', endPoint: 'A Fonsagrada', startCoord: [-6.882, 43.198], endCoord: [-7.069, 43.121], distanceKm: 25.5, elevationGain: 1180, elevationLoss: 600, difficulty: 'hard', description: 'Pasas a Galicia tras el Alto de Acebo.', tips: 'A Fonsagrada está a 950 m — abriga si vas en primavera.' },
    { number: 8, name: 'A Fonsagrada a O Cádavo', startPoint: 'A Fonsagrada', endPoint: 'O Cádavo', startCoord: [-7.069, 43.121], endCoord: [-7.245, 43.105], distanceKm: 24.0, elevationGain: 510, elevationLoss: 760, difficulty: 'medium', description: 'Cruce de pequeñas aldeas gallegas.', tips: 'Hospital del Montouto es un buen alto técnico.' },
    { number: 9, name: 'O Cádavo a Lugo', startPoint: 'O Cádavo', endPoint: 'Lugo', startCoord: [-7.245, 43.105], endCoord: [-7.557, 43.012], distanceKm: 30.5, elevationGain: 410, elevationLoss: 880, difficulty: 'hard', description: 'Lugo, ciudad amurallada romana, Patrimonio de la Humanidad.', tips: 'Camina sobre la muralla romana al llegar — vale la pena.' },
    { number: 10, name: 'Lugo a San Romao da Retorta', startPoint: 'Lugo', endPoint: 'San Romao da Retorta', startCoord: [-7.557, 43.012], endCoord: [-7.733, 42.954], distanceKm: 19.5, elevationGain: 230, elevationLoss: 200, difficulty: 'easy', description: 'Etapa tranquila tras Lugo, descansa de los desniveles.', tips: 'Aprovecha para reponer en Lugo antes de salir.' },
    { number: 11, name: 'San Romao a Melide', startPoint: 'San Romao da Retorta', endPoint: 'Melide', startCoord: [-7.733, 42.954], endCoord: [-7.999, 42.911], distanceKm: 28.5, elevationGain: 320, elevationLoss: 380, difficulty: 'medium', description: 'Te une al Camino Francés en Melide.', tips: 'Melide es famosa por su pulpo — parada obligada.' },
    { number: 12, name: 'Melide a Arzúa', startPoint: 'Melide', endPoint: 'Arzúa', startCoord: [-7.999, 42.911], endCoord: [-8.157, 42.929], distanceKm: 14.0, elevationGain: 220, elevationLoss: 250, difficulty: 'easy', description: 'Compartida con el Francés, etapas finales.', tips: 'Notarás más peregrinos a partir de aquí.' },
    { number: 13, name: 'Arzúa a O Pedrouzo', startPoint: 'Arzúa', endPoint: 'O Pedrouzo', startCoord: [-8.157, 42.929], endCoord: [-8.358, 42.907], distanceKm: 19.3, elevationGain: 230, elevationLoss: 260, difficulty: 'easy', description: 'Eucaliptos y aldeas pequeñas.', tips: 'Etapa corta — descansa para el final.' },
    { number: 14, name: 'O Pedrouzo a Santiago de Compostela', startPoint: 'O Pedrouzo', endPoint: 'Santiago de Compostela', startCoord: [-8.358, 42.907], endCoord: [-8.545, 42.881], distanceKm: 19.4, elevationGain: 290, elevationLoss: 280, difficulty: 'easy', description: 'Llegada a Santiago vía Monte do Gozo.', tips: 'Llega antes del mediodía para la Misa del Peregrino.' },
  ],
};

export const INGLES: SeedRoute = {
  slug: 'camino-ingles',
  name: 'Camino Inglés',
  nameEn: 'English Way',
  totalKm: 116,
  difficulty: 'easy',
  startCity: 'Ferrol',
  country: 'Spain',
  description:
    'La ruta corta desde la costa norte: Ferrol o A Coruña a Santiago. Históricamente usada por peregrinos ingleses, irlandeses y nórdicos que llegaban en barco. 5-6 etapas, ideal para una semana.',
  color: '#06B6D4',
  isPopular: false,
  stages: [
    { number: 1, name: 'Ferrol a Pontedeume', startPoint: 'Ferrol', endPoint: 'Pontedeume', startCoord: [-8.235, 43.484], endCoord: [-8.171, 43.413], distanceKm: 28.0, elevationGain: 460, elevationLoss: 480, difficulty: 'medium', description: 'Salida desde el puerto. Costa, ría y bosques.', tips: 'Pontedeume tiene un puente medieval precioso.' },
    { number: 2, name: 'Pontedeume a Betanzos', startPoint: 'Pontedeume', endPoint: 'Betanzos', startCoord: [-8.171, 43.413], endCoord: [-8.213, 43.281], distanceKm: 21.0, elevationGain: 580, elevationLoss: 580, difficulty: 'medium', description: 'Subidas y bajadas, paso por Miño.', tips: 'Betanzos: villa medieval, prueba la tortilla más famosa de Galicia.' },
    { number: 3, name: 'Betanzos a Hospital de Bruma', startPoint: 'Betanzos', endPoint: 'Hospital de Bruma', startCoord: [-8.213, 43.281], endCoord: [-8.243, 43.142], distanceKm: 27.0, elevationGain: 600, elevationLoss: 350, difficulty: 'hard', description: 'Larga subida hasta los 500m. Aquí se une la variante de A Coruña.', tips: 'Pocos servicios entre las dos villas — lleva agua y comida.' },
    { number: 4, name: 'Hospital de Bruma a Sigüeiro', startPoint: 'Hospital de Bruma', endPoint: 'Sigüeiro', startCoord: [-8.243, 43.142], endCoord: [-8.434, 42.979], distanceKm: 25.0, elevationGain: 270, elevationLoss: 510, difficulty: 'medium', description: 'Bajada continuada, paisaje agrícola gallego.', tips: 'Sigüeiro es ya prácticamente el extrarradio de Santiago.' },
    { number: 5, name: 'Sigüeiro a Santiago de Compostela', startPoint: 'Sigüeiro', endPoint: 'Santiago de Compostela', startCoord: [-8.434, 42.979], endCoord: [-8.545, 42.881], distanceKm: 16.0, elevationGain: 230, elevationLoss: 220, difficulty: 'easy', description: 'Etapa final corta hasta la catedral.', tips: 'Una etapa cómoda — disfrútala.' },
  ],
};

export const PLATA: SeedRoute = {
  slug: 'via-de-la-plata',
  name: 'Vía de la Plata',
  nameEn: 'Silver Way',
  totalKm: 970,
  difficulty: 'hard',
  startCity: 'Sevilla',
  country: 'Spain',
  description:
    'La ruta más larga: del sur al noroeste, siguiendo la antigua calzada romana. Desde Sevilla a Santiago atravesando Andalucía, Extremadura, Salamanca y Galicia. ~37 etapas, calor extremo en verano.',
  color: '#EA580C',
  isPopular: false,
  stages: [
    { number: 1, name: 'Sevilla a Guillena', startPoint: 'Sevilla', endPoint: 'Guillena', startCoord: [-5.997, 37.389], endCoord: [-6.060, 37.547], distanceKm: 22.5, elevationGain: 80, elevationLoss: 50, difficulty: 'easy', description: 'Salida desde la Catedral. Atraviesas el Aljarafe.', tips: 'Empieza muy temprano en verano — el calor en Andalucía es brutal.' },
    { number: 2, name: 'Guillena a Castilblanco de los Arroyos', startPoint: 'Guillena', endPoint: 'Castilblanco de los Arroyos', startCoord: [-6.060, 37.547], endCoord: [-6.014, 37.679], distanceKm: 18.5, elevationGain: 280, elevationLoss: 90, difficulty: 'easy', description: 'Suave subida, dehesas de encinas.', tips: 'Pueblo blanco andaluz — vale la pena pasear al atardecer.' },
    { number: 3, name: 'Castilblanco a Almadén de la Plata', startPoint: 'Castilblanco de los Arroyos', endPoint: 'Almadén de la Plata', startCoord: [-6.014, 37.679], endCoord: [-6.075, 37.870], distanceKm: 29.0, elevationGain: 400, elevationLoss: 220, difficulty: 'hard', description: 'Pasas el Parque Natural Sierra Norte de Sevilla.', tips: 'Etapa larga sin servicios — 2L de agua mínimo.' },
    { number: 4, name: 'Almadén a Monesterio', startPoint: 'Almadén de la Plata', endPoint: 'Monesterio', startCoord: [-6.075, 37.870], endCoord: [-6.262, 38.080], distanceKm: 35.0, elevationGain: 470, elevationLoss: 330, difficulty: 'hard', description: 'Cruce a Extremadura. Cerdo ibérico de bellota.', tips: 'Monesterio: capital del jamón ibérico de Extremadura.' },
    { number: 5, name: 'Monesterio a Fuente de Cantos', startPoint: 'Monesterio', endPoint: 'Fuente de Cantos', startCoord: [-6.262, 38.080], endCoord: [-6.301, 38.249], distanceKm: 21.5, elevationGain: 200, elevationLoss: 350, difficulty: 'medium', description: 'Dehesas extremeñas.', tips: 'Iglesia de la Granada con altar barroco.' },
    { number: 6, name: 'Fuente de Cantos a Zafra', startPoint: 'Fuente de Cantos', endPoint: 'Zafra', startCoord: [-6.301, 38.249], endCoord: [-6.422, 38.421], distanceKm: 25.0, elevationGain: 180, elevationLoss: 250, difficulty: 'medium', description: 'Llegada a Zafra, "Sevilla la chica".', tips: 'El parador de Zafra es un castillo del siglo XV.' },
    { number: 7, name: 'Zafra a Villafranca de los Barros', startPoint: 'Zafra', endPoint: 'Villafranca de los Barros', startCoord: [-6.422, 38.421], endCoord: [-6.336, 38.566], distanceKm: 19.0, elevationGain: 130, elevationLoss: 180, difficulty: 'easy', description: 'Viñedos y olivares.', tips: 'Tierra de buenos vinos — no perderse las bodegas.' },
    { number: 8, name: 'Villafranca a Torremejía', startPoint: 'Villafranca de los Barros', endPoint: 'Torremejía', startCoord: [-6.336, 38.566], endCoord: [-6.387, 38.798], distanceKm: 27.5, elevationGain: 130, elevationLoss: 80, difficulty: 'medium', description: 'Etapa monótona pero llana.', tips: 'Sin sombra ni fuentes — sale antes del amanecer.' },
    { number: 9, name: 'Torremejía a Mérida', startPoint: 'Torremejía', endPoint: 'Mérida', startCoord: [-6.387, 38.798], endCoord: [-6.345, 38.917], distanceKm: 16.0, elevationGain: 90, elevationLoss: 100, difficulty: 'easy', description: 'Mérida romana: teatro, anfiteatro, acueducto.', tips: 'Día de descanso ideal para visitar el conjunto romano.' },
    { number: 10, name: 'Mérida a Alcuéscar', startPoint: 'Mérida', endPoint: 'Alcuéscar', startCoord: [-6.345, 38.917], endCoord: [-6.260, 39.171], distanceKm: 36.0, elevationGain: 480, elevationLoss: 310, difficulty: 'hard', description: 'Vuelven los desniveles. Etapa exigente.', tips: 'Alcuéscar tiene albergue parroquial muy acogedor.' },
    { number: 11, name: 'Alcuéscar a Cáceres', startPoint: 'Alcuéscar', endPoint: 'Cáceres', startCoord: [-6.260, 39.171], endCoord: [-6.371, 39.474], distanceKm: 38.0, elevationGain: 380, elevationLoss: 380, difficulty: 'hard', description: 'Cáceres: casco antiguo Patrimonio de la Humanidad.', tips: 'Etapa muy larga — divídela en Valdesalor si hace falta.' },
    { number: 12, name: 'Cáceres a Embalse de Alcántara', startPoint: 'Cáceres', endPoint: 'Embalse de Alcántara', startCoord: [-6.371, 39.474], endCoord: [-6.428, 39.717], distanceKm: 32.0, elevationGain: 390, elevationLoss: 470, difficulty: 'hard', description: 'Cruzas dehesas y el embalse de Alcántara.', tips: 'Albergue del Embalse: aislado, encantador.' },
    { number: 13, name: 'Embalse a Grimaldo', startPoint: 'Embalse de Alcántara', endPoint: 'Grimaldo', startCoord: [-6.428, 39.717], endCoord: [-6.350, 39.830], distanceKm: 20.5, elevationGain: 380, elevationLoss: 240, difficulty: 'medium', description: 'Pequeño pueblo con castillo del siglo XV.', tips: 'Grimaldo es minúsculo — reserva albergue con antelación.' },
    { number: 14, name: 'Grimaldo a Carcaboso', startPoint: 'Grimaldo', endPoint: 'Carcaboso', startCoord: [-6.350, 39.830], endCoord: [-6.214, 40.041], distanceKm: 30.0, elevationGain: 260, elevationLoss: 360, difficulty: 'hard', description: 'Etapa larga por dehesa.', tips: 'Mira los miliarios romanos por el camino.' },
    { number: 15, name: 'Carcaboso a Aldeanueva del Camino', startPoint: 'Carcaboso', endPoint: 'Aldeanueva del Camino', startCoord: [-6.214, 40.041], endCoord: [-5.999, 40.276], distanceKm: 38.5, elevationGain: 380, elevationLoss: 220, difficulty: 'hard', description: 'La etapa más larga del Plata. Pueblos pequeños.', tips: 'Divídela en Galisteo o Plasencia si lo necesitas.' },
    { number: 16, name: 'Aldeanueva a La Calzada de Béjar', startPoint: 'Aldeanueva del Camino', endPoint: 'La Calzada de Béjar', startCoord: [-5.999, 40.276], endCoord: [-5.748, 40.378], distanceKm: 22.5, elevationGain: 730, elevationLoss: 320, difficulty: 'hard', description: 'Subida a las montañas: Puerto de Béjar.', tips: 'Cruzas a Castilla y León. El paisaje cambia.' },
    { number: 17, name: 'La Calzada a Fuenterroble de Salvatierra', startPoint: 'La Calzada de Béjar', endPoint: 'Fuenterroble de Salvatierra', startCoord: [-5.748, 40.378], endCoord: [-5.797, 40.625], distanceKm: 20.0, elevationGain: 250, elevationLoss: 130, difficulty: 'medium', description: 'Páramo salmantino, fría y ventoso.', tips: 'Albergue parroquial de Fuenterroble: legendario, donativo.' },
    { number: 18, name: 'Fuenterroble a San Pedro de Rozados', startPoint: 'Fuenterroble de Salvatierra', endPoint: 'San Pedro de Rozados', startCoord: [-5.797, 40.625], endCoord: [-5.749, 40.823], distanceKm: 28.5, elevationGain: 280, elevationLoss: 360, difficulty: 'medium', description: 'Cruzas el Pico de la Dueña (1170 m).', tips: 'Vientos fuertes — protege la ropa.' },
    { number: 19, name: 'San Pedro a Salamanca', startPoint: 'San Pedro de Rozados', endPoint: 'Salamanca', startCoord: [-5.749, 40.823], endCoord: [-5.664, 40.965], distanceKm: 24.0, elevationGain: 130, elevationLoss: 230, difficulty: 'easy', description: 'Salamanca: la Universidad, la Plaza Mayor.', tips: 'Día de descanso perfecto. Plaza Mayor al atardecer es mágica.' },
    { number: 20, name: 'Salamanca a El Cubo de Tierra del Vino', startPoint: 'Salamanca', endPoint: 'El Cubo de Tierra del Vino', startCoord: [-5.664, 40.965], endCoord: [-5.687, 41.158], distanceKm: 35.5, elevationGain: 280, elevationLoss: 260, difficulty: 'hard', description: 'Larga, llana, monótona — la Meseta empieza.', tips: 'Sin servicios entre Salamanca y Calzada de Valdunciel — surte el día anterior.' },
    { number: 21, name: 'El Cubo a Zamora', startPoint: 'El Cubo de Tierra del Vino', endPoint: 'Zamora', startCoord: [-5.687, 41.158], endCoord: [-5.745, 41.503], distanceKm: 32.0, elevationGain: 240, elevationLoss: 280, difficulty: 'hard', description: 'Zamora: 23 iglesias románicas, la mejor concentración del mundo.', tips: 'Visita la catedral con su cimborrio escamado.' },
    { number: 22, name: 'Zamora a Montamarta', startPoint: 'Zamora', endPoint: 'Montamarta', startCoord: [-5.745, 41.503], endCoord: [-5.797, 41.643], distanceKm: 19.0, elevationGain: 130, elevationLoss: 110, difficulty: 'easy', description: 'Etapa corta para recuperar.', tips: 'Cruzas la presa de Ricobayo.' },
    { number: 23, name: 'Montamarta a Granja de Moreruela', startPoint: 'Montamarta', endPoint: 'Granja de Moreruela', startCoord: [-5.797, 41.643], endCoord: [-5.751, 41.804], distanceKm: 22.5, elevationGain: 200, elevationLoss: 110, difficulty: 'medium', description: 'En Granja se bifurca: a Astorga (Plata) o a Ourense (Sanabrés).', tips: 'Decisión clave: continúa Plata por Astorga o desvíate al Sanabrés a Galicia.' },
    { number: 24, name: 'Granja de Moreruela a Benavente', startPoint: 'Granja de Moreruela', endPoint: 'Benavente', startCoord: [-5.751, 41.804], endCoord: [-5.681, 42.002], distanceKm: 26.5, elevationGain: 200, elevationLoss: 220, difficulty: 'medium', description: 'Empieza tramo común con el Camino Sanabrés en sentido contrario.', tips: 'Benavente tiene un parador en el Castillo de la Mota.' },
    { number: 25, name: 'Benavente a Alija del Infantado', startPoint: 'Benavente', endPoint: 'Alija del Infantado', startCoord: [-5.681, 42.002], endCoord: [-5.823, 42.142], distanceKm: 22.0, elevationGain: 180, elevationLoss: 110, difficulty: 'medium', description: 'Atraviesas el río Órbigo.', tips: 'Castillo de Alija — visita imprescindible.' },
    { number: 26, name: 'Alija a La Bañeza', startPoint: 'Alija del Infantado', endPoint: 'La Bañeza', startCoord: [-5.823, 42.142], endCoord: [-5.901, 42.302], distanceKm: 22.0, elevationGain: 130, elevationLoss: 110, difficulty: 'easy', description: 'Pueblos rurales leoneses.', tips: 'La Bañeza tiene buenos mesones — descansa.' },
    { number: 27, name: 'La Bañeza a Astorga', startPoint: 'La Bañeza', endPoint: 'Astorga', startCoord: [-5.901, 42.302], endCoord: [-6.054, 42.456], distanceKm: 24.5, elevationGain: 200, elevationLoss: 50, difficulty: 'medium', description: 'Te unes al Camino Francés en Astorga.', tips: 'Astorga: chocolate, palacio Gaudí, catedral.' },
    { number: 28, name: 'Astorga a Foncebadón', startPoint: 'Astorga', endPoint: 'Foncebadón', startCoord: [-6.054, 42.456], endCoord: [-6.355, 42.494], distanceKm: 25.6, elevationGain: 760, elevationLoss: 100, difficulty: 'hard', description: 'Subida a la Maragatería. Compartida con el Francés.', tips: 'Foncebadón a 1500m — ropa de abrigo.' },
    { number: 29, name: 'Foncebadón a Ponferrada', startPoint: 'Foncebadón', endPoint: 'Ponferrada', startCoord: [-6.355, 42.494], endCoord: [-6.589, 42.547], distanceKm: 27.4, elevationGain: 280, elevationLoss: 1380, difficulty: 'hard', description: 'Cruz de Ferro y bajada al Bierzo. Compartida con el Francés.', tips: 'Trae una piedra de casa para la Cruz de Ferro.' },
    { number: 30, name: 'Ponferrada a Villafranca del Bierzo', startPoint: 'Ponferrada', endPoint: 'Villafranca del Bierzo', startCoord: [-6.589, 42.547], endCoord: [-6.811, 42.609], distanceKm: 24.2, elevationGain: 260, elevationLoss: 220, difficulty: 'medium', description: 'Bierzo, vinos. Compartida con Francés.', tips: 'Mencía, godello — vinos del Bierzo son top.' },
    { number: 31, name: 'Villafranca a O Cebreiro', startPoint: 'Villafranca del Bierzo', endPoint: 'O Cebreiro', startCoord: [-6.811, 42.609], endCoord: [-7.044, 42.708], distanceKm: 28.4, elevationGain: 1300, elevationLoss: 280, difficulty: 'hard', description: 'Subida a Galicia. Compartida con el Francés.', tips: 'Una de las subidas más duras del Camino completo.' },
    { number: 32, name: 'O Cebreiro a Triacastela', startPoint: 'O Cebreiro', endPoint: 'Triacastela', startCoord: [-7.044, 42.708], endCoord: [-7.241, 42.755], distanceKm: 21.0, elevationGain: 320, elevationLoss: 950, difficulty: 'medium', description: 'Galicia rural. Compartida con Francés.', tips: 'Pulpo en Triacastela.' },
    { number: 33, name: 'Triacastela a Sarria', startPoint: 'Triacastela', endPoint: 'Sarria', startCoord: [-7.241, 42.755], endCoord: [-7.418, 42.781], distanceKm: 18.4, elevationGain: 290, elevationLoss: 470, difficulty: 'medium', description: 'Compartida con Francés.', tips: 'Sarria es punto de inicio para muchos.' },
    { number: 34, name: 'Sarria a Portomarín', startPoint: 'Sarria', endPoint: 'Portomarín', startCoord: [-7.418, 42.781], endCoord: [-7.617, 42.808], distanceKm: 22.4, elevationGain: 370, elevationLoss: 540, difficulty: 'medium', description: 'Marca de los 100 km — punto crítico para la Compostela.', tips: 'A partir de aquí más peregrinos.' },
    { number: 35, name: 'Portomarín a Palas de Rei', startPoint: 'Portomarín', endPoint: 'Palas de Rei', startCoord: [-7.617, 42.808], endCoord: [-7.869, 42.873], distanceKm: 25.0, elevationGain: 460, elevationLoss: 350, difficulty: 'medium', description: 'Eucaliptos.', tips: 'Pulpo en A Brea.' },
    { number: 36, name: 'Palas de Rei a Arzúa', startPoint: 'Palas de Rei', endPoint: 'Arzúa', startCoord: [-7.869, 42.873], endCoord: [-8.157, 42.929], distanceKm: 28.5, elevationGain: 320, elevationLoss: 350, difficulty: 'medium', description: 'Cruces de peregrinos por la cantidad de gente.', tips: 'Queso de Arzúa — recuerdo gastronómico.' },
    { number: 37, name: 'Arzúa a O Pedrouzo', startPoint: 'Arzúa', endPoint: 'O Pedrouzo', startCoord: [-8.157, 42.929], endCoord: [-8.358, 42.907], distanceKm: 19.3, elevationGain: 230, elevationLoss: 260, difficulty: 'easy', description: 'Penúltima etapa.', tips: 'Descansa para Santiago.' },
    { number: 38, name: 'O Pedrouzo a Santiago', startPoint: 'O Pedrouzo', endPoint: 'Santiago de Compostela', startCoord: [-8.358, 42.907], endCoord: [-8.545, 42.881], distanceKm: 19.4, elevationGain: 290, elevationLoss: 280, difficulty: 'easy', description: 'La meta tras casi 1000 km.', tips: 'Lágrimas garantizadas en el Obradoiro.' },
  ],
};

export const ARAGONES: SeedRoute = {
  slug: 'camino-aragones',
  name: 'Camino Aragonés',
  nameEn: 'Aragonese Way',
  totalKm: 165,
  difficulty: 'medium',
  startCity: 'Somport',
  country: 'France/Spain',
  description:
    'Cruza los Pirineos por Somport y baja por Aragón hasta Puente la Reina, donde se une al Francés. 7 etapas, ruta histórica de los peregrinos del este de Europa.',
  color: '#DB2777',
  isPopular: false,
  stages: [
    { number: 1, name: 'Somport a Jaca', startPoint: 'Somport', endPoint: 'Jaca', startCoord: [-0.522, 42.793], endCoord: [-0.547, 42.570], distanceKm: 30.5, elevationGain: 230, elevationLoss: 1170, difficulty: 'hard', description: 'Bajada espectacular desde el puerto pirenaico. Canfranc Estación.', tips: 'Visita la antigua estación de Canfranc — joya modernista.' },
    { number: 2, name: 'Jaca a Arrés', startPoint: 'Jaca', endPoint: 'Arrés', startCoord: [-0.547, 42.570], endCoord: [-0.769, 42.512], distanceKm: 25.0, elevationGain: 470, elevationLoss: 350, difficulty: 'medium', description: 'Vistas a los Pirineos.', tips: 'Albergue de Arrés es donativo, muy familiar.' },
    { number: 3, name: 'Arrés a Ruesta', startPoint: 'Arrés', endPoint: 'Ruesta', startCoord: [-0.769, 42.512], endCoord: [-1.080, 42.547], distanceKm: 28.0, elevationGain: 250, elevationLoss: 380, difficulty: 'medium', description: 'Pueblo abandonado de Ruesta junto al embalse.', tips: 'Albergue rehabilitado — ambiente único.' },
    { number: 4, name: 'Ruesta a Sangüesa', startPoint: 'Ruesta', endPoint: 'Sangüesa', startCoord: [-1.080, 42.547], endCoord: [-1.281, 42.578], distanceKm: 22.0, elevationGain: 350, elevationLoss: 470, difficulty: 'medium', description: 'Atraviesas el Aragón. Sangüesa: iglesia de Santa María la Real románica.', tips: 'Detente en la portada románica.' },
    { number: 5, name: 'Sangüesa a Monreal', startPoint: 'Sangüesa', endPoint: 'Monreal', startCoord: [-1.281, 42.578], endCoord: [-1.499, 42.700], distanceKm: 27.5, elevationGain: 580, elevationLoss: 410, difficulty: 'hard', description: 'Cruzas la sierra de Izco.', tips: 'Buen panorama desde el alto.' },
    { number: 6, name: 'Monreal a Eunate', startPoint: 'Monreal', endPoint: 'Eunate', startCoord: [-1.499, 42.700], endCoord: [-1.770, 42.685], distanceKm: 18.5, elevationGain: 200, elevationLoss: 230, difficulty: 'easy', description: 'La iglesia octogonal de Eunate, joya románica templaria.', tips: 'Visita imperdible — tiene un aire mágico.' },
    { number: 7, name: 'Eunate a Puente la Reina', startPoint: 'Eunate', endPoint: 'Puente la Reina', startCoord: [-1.770, 42.685], endCoord: [-1.815, 42.671], distanceKm: 6.0, elevationGain: 80, elevationLoss: 100, difficulty: 'easy', description: 'Te unes al Camino Francés.', tips: 'Etapa cortita — visita el puente medieval con calma.' },
  ],
};

export const ROUTES: SeedRoute[] = [FRANCES, PORTUGUES, NORTE, PRIMITIVO, INGLES, PLATA, ARAGONES];
