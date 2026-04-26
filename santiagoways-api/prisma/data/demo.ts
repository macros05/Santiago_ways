export type SeedUser = {
  email: string;
  name: string;
  username: string;
  bio: string;
  nationality: string;
  avatar: string;
  isOnCamino?: boolean;
  totalKm?: number;
  timesCompleted?: number;
};

export const DEMO_USERS: SeedUser[] = [
  {
    email: 'maria@example.com',
    name: 'María García',
    username: 'maria_walks',
    bio: 'Caminando el Francés por tercera vez. Lentitud y corazón abierto.',
    nationality: 'ES',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    isOnCamino: true,
    totalKm: 320,
    timesCompleted: 2,
  },
  {
    email: 'thomas@example.com',
    name: 'Thomas Müller',
    username: 'tom_pilgrim',
    bio: 'Aus München. Camino del Norte 2025. Erstes Mal in Spanien.',
    nationality: 'DE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    isOnCamino: true,
    totalKm: 410,
  },
  {
    email: 'aiko@example.com',
    name: 'Aiko Tanaka',
    username: 'aiko_jp',
    bio: 'Photographer. Walking the way to find quiet.',
    nationality: 'JP',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    isOnCamino: false,
    totalKm: 779,
    timesCompleted: 1,
  },
  {
    email: 'lucia@example.com',
    name: 'Lucía Fernández',
    username: 'lucia_cf',
    bio: 'Galega. Hospitalera 22 anos. O Camiño é a miña casa.',
    nationality: 'ES',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    isOnCamino: false,
    timesCompleted: 4,
  },
  {
    email: 'pierre@example.com',
    name: 'Pierre Lefebvre',
    username: 'pierre_le',
    bio: 'De Lyon. Le Portugués au printemps.',
    nationality: 'FR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    isOnCamino: true,
    totalKm: 86,
  },
  {
    email: 'siobhan@example.com',
    name: 'Siobhán O\'Connor',
    username: 'siobhan_ie',
    bio: 'Dublin. Slow walker, fast thinker. Inglés this autumn.',
    nationality: 'IE',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
    isOnCamino: false,
    totalKm: 116,
    timesCompleted: 1,
  },
  {
    email: 'marco@example.com',
    name: 'Marco Rossi',
    username: 'marco_it',
    bio: 'Roma. Cammino dal nord per la prima volta. Spirituale e fisico.',
    nationality: 'IT',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
    isOnCamino: true,
    totalKm: 240,
  },
  {
    email: 'kim@example.com',
    name: 'Kim Min-Jun',
    username: 'kim_kr',
    bio: 'Seoul. Walking after retirement. Three weeks on Francés.',
    nationality: 'KR',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    isOnCamino: true,
    totalKm: 540,
  },
  {
    email: 'sofia@example.com',
    name: 'Sofía Ramírez',
    username: 'sofia_mx',
    bio: 'Ciudad de México. Mi primer Camino. Vía de la Plata desde Sevilla.',
    nationality: 'MX',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    isOnCamino: true,
    totalKm: 195,
  },
  {
    email: 'james@example.com',
    name: 'James Wright',
    username: 'james_uk',
    bio: 'London. Done the Francés twice, this time the Primitivo.',
    nationality: 'GB',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    isOnCamino: true,
    totalKm: 178,
    timesCompleted: 2,
  },
  {
    email: 'helena@example.com',
    name: 'Helena Kowalski',
    username: 'helena_pl',
    bio: 'Z Krakowa. Camino francuski w lipcu — pierwsza podróż.',
    nationality: 'PL',
    avatar: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400',
    isOnCamino: false,
    totalKm: 0,
  },
  {
    email: 'beatriz@example.com',
    name: 'Beatriz Almeida',
    username: 'beatriz_pt',
    bio: 'Porto. Caminhei o Português e o Inglês. Próximo: Aragonés.',
    nationality: 'PT',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
    isOnCamino: false,
    totalKm: 356,
    timesCompleted: 2,
  },
];

export const DEMO_POSTS: Array<{
  authorUsername: string;
  content: string;
  images: string[];
  locationName?: string;
  stageEndpoint?: string;
  routeSlug?: string;
  daysAgo?: number;
}> = [
  {
    authorUsername: 'maria_walks',
    content: 'Cruzando los Pirineos el día uno. Mañana fría, corazones cálidos. ¡Buen Camino a todos! 🥾',
    images: ['https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200'],
    locationName: 'Roncesvalles',
    stageEndpoint: 'Roncesvalles',
    routeSlug: 'camino-frances',
    daysAgo: 14,
  },
  {
    authorUsername: 'tom_pilgrim',
    content: 'San Sebastián at dawn. The Norte is brutal but the views… kein Witz. Already addicted.',
    images: ['https://images.unsplash.com/photo-1559521783-1d1599583485?w=1200'],
    locationName: 'San Sebastián',
    stageEndpoint: 'San Sebastián',
    routeSlug: 'camino-del-norte',
    daysAgo: 12,
  },
  {
    authorUsername: 'aiko_jp',
    content: 'Reached Santiago today. Tears at the cathedral. Already missing the silence of the Meseta.',
    images: ['https://images.unsplash.com/photo-1599661046827-9a692a55a78f?w=1200'],
    locationName: 'Santiago de Compostela',
    stageEndpoint: 'Santiago de Compostela',
    routeSlug: 'camino-frances',
    daysAgo: 60,
  },
  {
    authorUsername: 'pierre_le',
    content: 'Arcade pour le déjeuner — huîtres et vinho verde. Le Portugués c\'est la dolce vita.',
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200'],
    locationName: 'Arcade',
    stageEndpoint: 'Pontevedra',
    routeSlug: 'camino-portugues',
    daysAgo: 5,
  },
  {
    authorUsername: 'maria_walks',
    content: 'Bodegas Irache. Vino y agua, libres para los peregrinos. Tradición ❤️',
    images: ['https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200'],
    locationName: 'Estella',
    stageEndpoint: 'Los Arcos',
    routeSlug: 'camino-frances',
    daysAgo: 10,
  },
  {
    authorUsername: 'james_uk',
    content: 'Hospitales day on the Primitivo. Best day on a Camino, ever. The mountain to yourself.',
    images: ['https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=1200'],
    locationName: 'La Mesa',
    stageEndpoint: 'La Mesa',
    routeSlug: 'camino-primitivo',
    daysAgo: 3,
  },
  {
    authorUsername: 'sofia_mx',
    content: 'Día 8 en la Vía de la Plata. Las dehesas extremeñas son un sueño. ¡Calor demoledor a las 11!',
    images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200'],
    locationName: 'Mérida',
    stageEndpoint: 'Mérida',
    routeSlug: 'via-de-la-plata',
    daysAgo: 4,
  },
  {
    authorUsername: 'siobhan_ie',
    content: 'Done the Inglés in 5 days. Short and sweet. Cathedral made me cry, of course.',
    images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200'],
    locationName: 'Santiago de Compostela',
    stageEndpoint: 'Santiago de Compostela',
    routeSlug: 'camino-ingles',
    daysAgo: 30,
  },
  {
    authorUsername: 'marco_it',
    content: 'Güemes. Ernesto e la cena comunitaria. Non si dimentica.',
    images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200'],
    locationName: 'Güemes',
    stageEndpoint: 'Güemes',
    routeSlug: 'camino-del-norte',
    daysAgo: 7,
  },
  {
    authorUsername: 'kim_kr',
    content: 'León 도착. 성당이 정말 아름다워요. 걸어온 거리가 믿기지 않습니다.',
    images: ['https://images.unsplash.com/photo-1508437599-2e3b1c2bff7d?w=1200'],
    locationName: 'León',
    stageEndpoint: 'León',
    routeSlug: 'camino-frances',
    daysAgo: 8,
  },
  {
    authorUsername: 'tom_pilgrim',
    content: 'Drei Tage Regen. Kein Spaß auf dem Norte. Aber ich gehe weiter.',
    images: ['https://images.unsplash.com/photo-1496080174650-637e3f22fa03?w=1200'],
    locationName: 'Llanes',
    stageEndpoint: 'Llanes',
    routeSlug: 'camino-del-norte',
    daysAgo: 6,
  },
  {
    authorUsername: 'lucia_cf',
    content: 'Outro grupo de peregrinos esta noite no albergue. Doce nacionalidades. Isto é o Camiño.',
    images: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200'],
    locationName: 'O Cebreiro',
    stageEndpoint: 'O Cebreiro',
    routeSlug: 'camino-frances',
    daysAgo: 1,
  },
  {
    authorUsername: 'beatriz_pt',
    content: 'Passei o Inglês por Ferrol. 5 etapas perfeitas para o setembro. Recomendo!',
    images: ['https://images.unsplash.com/photo-1488751045188-3c55bbf9a3fa?w=1200'],
    locationName: 'Pontedeume',
    stageEndpoint: 'Pontedeume',
    routeSlug: 'camino-ingles',
    daysAgo: 45,
  },
  {
    authorUsername: 'maria_walks',
    content: 'Castrojeriz al atardecer. La Meseta tiene una luz que no se ve en otras partes.',
    images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200'],
    locationName: 'Castrojeriz',
    stageEndpoint: 'Castrojeriz',
    routeSlug: 'camino-frances',
    daysAgo: 2,
  },
  {
    authorUsername: 'sofia_mx',
    content: 'Salamanca de descanso. La Plaza Mayor en la noche es un delirio.',
    images: ['https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1200'],
    locationName: 'Salamanca',
    stageEndpoint: 'Salamanca',
    routeSlug: 'via-de-la-plata',
    daysAgo: 9,
  },
  {
    authorUsername: 'james_uk',
    content: 'Lugo Roman walls. Walked the entire perimeter at sunrise. Goosebumps.',
    images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200'],
    locationName: 'Lugo',
    stageEndpoint: 'Lugo',
    routeSlug: 'camino-primitivo',
    daysAgo: 1,
  },
  {
    authorUsername: 'aiko_jp',
    content: 'Looking back at my photos from the Meseta. The flat infinity. I miss it already.',
    images: ['https://images.unsplash.com/photo-1502303756774-9da9b3b56a37?w=1200'],
    locationName: 'Tokyo',
    daysAgo: 90,
  },
  {
    authorUsername: 'pierre_le',
    content: 'Pontevedra: vieille ville superbe. La pluie galicienne nous a accompagnés tout l\'après-midi.',
    images: ['https://images.unsplash.com/photo-1530841344095-502ed862e2bb?w=1200'],
    locationName: 'Pontevedra',
    stageEndpoint: 'Pontevedra',
    routeSlug: 'camino-portugues',
    daysAgo: 3,
  },
  {
    authorUsername: 'helena_pl',
    content: 'W lipcu zaczynam Francuski. Pakuję plecak. Ekscytacja maksymalna! 🎒',
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200'],
    locationName: 'Kraków',
    daysAgo: 20,
  },
  {
    authorUsername: 'kim_kr',
    content: '오늘은 21km. 발 아파요. 하지만 오늘의 알베르게 정말 좋아요.',
    images: [],
    locationName: 'Burgos',
    stageEndpoint: 'Burgos',
    routeSlug: 'camino-frances',
    daysAgo: 11,
  },
  {
    authorUsername: 'beatriz_pt',
    content: 'Eunate. A igreja oitavada é fascinante. O som dentro é único.',
    images: ['https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200'],
    locationName: 'Eunate',
    stageEndpoint: 'Eunate',
    routeSlug: 'camino-aragones',
    daysAgo: 100,
  },
  {
    authorUsername: 'lucia_cf',
    content: 'Os Domingos toca pulpo en Melide. Non hai mellor xeito de pasar a tarde.',
    images: ['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200'],
    locationName: 'Melide',
    stageEndpoint: 'Melide',
    routeSlug: 'camino-frances',
    daysAgo: 0,
  },
  {
    authorUsername: 'marco_it',
    content: 'San Sebastián fa innamorare. Pintxo crawl al porto, sole, mare. Domani si cammina.',
    images: ['https://images.unsplash.com/photo-1524666041070-9d87656c25bb?w=1200'],
    locationName: 'San Sebastián',
    stageEndpoint: 'San Sebastián',
    routeSlug: 'camino-del-norte',
    daysAgo: 5,
  },
  {
    authorUsername: 'maria_walks',
    content: 'Hoy 100km cumplidos. Ya soy oficialmente del 100km Club 🏆',
    images: ['https://images.unsplash.com/photo-1551655510-555dc3be8633?w=1200'],
    locationName: 'Pamplona',
    stageEndpoint: 'Pamplona',
    routeSlug: 'camino-frances',
    daysAgo: 12,
  },
  {
    authorUsername: 'tom_pilgrim',
    content: 'Picos de Europa im Hintergrund. Asturien ist atemberaubend.',
    images: ['https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200'],
    locationName: 'Ribadesella',
    stageEndpoint: 'Ribadesella',
    routeSlug: 'camino-del-norte',
    daysAgo: 4,
  },
];

// Comments per post (using the post text as a key — seed.ts will resolve)
export const DEMO_COMMENTS: Array<{
  postIndex: number; // index in DEMO_POSTS
  authorUsername: string;
  content: string;
}> = [
  { postIndex: 0, authorUsername: 'lucia_cf', content: '¡Buen Camino, María! Galicia te espera 🌿' },
  { postIndex: 0, authorUsername: 'tom_pilgrim', content: 'See you somewhere on the way!' },
  { postIndex: 2, authorUsername: 'maria_walks', content: '¡Enhorabuena Aiko! Yo también lloré.' },
  { postIndex: 2, authorUsername: 'pierre_le', content: 'Bravo! La fin du voyage est toujours douce-amère.' },
  { postIndex: 5, authorUsername: 'maria_walks', content: 'James, ese día es un sueño. Yo lo hice con niebla y aún así fue mágico.' },
  { postIndex: 5, authorUsername: 'aiko_jp', content: 'Adding Primitivo to my list 🙏' },
  { postIndex: 6, authorUsername: 'james_uk', content: 'Sofia, the Plata is the real deal. Respect.' },
  { postIndex: 8, authorUsername: 'siobhan_ie', content: 'Ernesto is a saint. The dinner alone is worth the detour.' },
  { postIndex: 11, authorUsername: 'pierre_le', content: 'Lucía, las hospitaleras como tú son el alma del Camino ❤️' },
  { postIndex: 11, authorUsername: 'maria_walks', content: 'Te debo cien estancias, Lucía 🙏' },
  { postIndex: 15, authorUsername: 'aiko_jp', content: 'I want to walk the walls at sunrise too. Adding to the list.' },
  { postIndex: 23, authorUsername: 'lucia_cf', content: 'Parabéns! O 100km club é o primeiro paso 🎉' },
  { postIndex: 23, authorUsername: 'pierre_le', content: 'Bravissima! Encore beaucoup de chemin 💪' },
];

// Likes: array of [postIndex, likerUsername]
export const DEMO_LIKES: Array<[number, string]> = [
  [0, 'lucia_cf'], [0, 'aiko_jp'], [0, 'tom_pilgrim'], [0, 'james_uk'], [0, 'sofia_mx'],
  [1, 'maria_walks'], [1, 'aiko_jp'], [1, 'lucia_cf'],
  [2, 'maria_walks'], [2, 'lucia_cf'], [2, 'pierre_le'], [2, 'tom_pilgrim'], [2, 'siobhan_ie'], [2, 'james_uk'], [2, 'beatriz_pt'],
  [3, 'maria_walks'], [3, 'lucia_cf'],
  [4, 'aiko_jp'], [4, 'pierre_le'], [4, 'james_uk'],
  [5, 'maria_walks'], [5, 'aiko_jp'], [5, 'tom_pilgrim'], [5, 'lucia_cf'], [5, 'beatriz_pt'],
  [6, 'maria_walks'], [6, 'james_uk'], [6, 'lucia_cf'],
  [7, 'lucia_cf'], [7, 'beatriz_pt'], [7, 'maria_walks'],
  [8, 'maria_walks'], [8, 'aiko_jp'], [8, 'james_uk'], [8, 'lucia_cf'],
  [9, 'maria_walks'], [9, 'aiko_jp'],
  [10, 'maria_walks'], [10, 'lucia_cf'],
  [11, 'maria_walks'], [11, 'pierre_le'], [11, 'aiko_jp'], [11, 'tom_pilgrim'], [11, 'james_uk'],
  [12, 'lucia_cf'], [12, 'maria_walks'],
  [13, 'lucia_cf'], [13, 'aiko_jp'], [13, 'tom_pilgrim'],
  [15, 'maria_walks'], [15, 'aiko_jp'], [15, 'pierre_le'],
  [21, 'lucia_cf'], [21, 'pierre_le'], [21, 'beatriz_pt'],
  [22, 'maria_walks'], [22, 'sofia_mx'],
  [23, 'lucia_cf'], [23, 'pierre_le'], [23, 'aiko_jp'], [23, 'tom_pilgrim'], [23, 'siobhan_ie'], [23, 'james_uk'], [23, 'sofia_mx'], [23, 'beatriz_pt'], [23, 'kim_kr'],
];

// Follows: array of [followerUsername, followingUsername]
export const DEMO_FOLLOWS: Array<[string, string]> = [
  ['maria_walks', 'lucia_cf'], ['maria_walks', 'aiko_jp'], ['maria_walks', 'pierre_le'],
  ['tom_pilgrim', 'maria_walks'], ['tom_pilgrim', 'lucia_cf'],
  ['aiko_jp', 'lucia_cf'], ['aiko_jp', 'maria_walks'],
  ['pierre_le', 'lucia_cf'], ['pierre_le', 'maria_walks'], ['pierre_le', 'beatriz_pt'],
  ['siobhan_ie', 'lucia_cf'], ['siobhan_ie', 'james_uk'],
  ['marco_it', 'tom_pilgrim'], ['marco_it', 'maria_walks'],
  ['kim_kr', 'maria_walks'], ['kim_kr', 'lucia_cf'],
  ['sofia_mx', 'maria_walks'], ['sofia_mx', 'lucia_cf'], ['sofia_mx', 'beatriz_pt'],
  ['james_uk', 'aiko_jp'], ['james_uk', 'maria_walks'],
  ['helena_pl', 'maria_walks'], ['helena_pl', 'lucia_cf'], ['helena_pl', 'pierre_le'],
  ['beatriz_pt', 'lucia_cf'], ['beatriz_pt', 'pierre_le'],
  ['lucia_cf', 'maria_walks'], ['lucia_cf', 'aiko_jp'],
];

// Achievements unlocked per user
export const DEMO_USER_ACHIEVEMENTS: Array<{ username: string; achievementSlug: string }> = [
  { username: 'maria_walks', achievementSlug: 'first-steps' },
  { username: 'maria_walks', achievementSlug: 'hundred-km-club' },
  { username: 'maria_walks', achievementSlug: 'halfway-there' },
  { username: 'maria_walks', achievementSlug: 'social-pilgrim' },

  { username: 'aiko_jp', achievementSlug: 'first-steps' },
  { username: 'aiko_jp', achievementSlug: 'hundred-km-club' },
  { username: 'aiko_jp', achievementSlug: 'halfway-there' },
  { username: 'aiko_jp', achievementSlug: 'meseta-survivor' },
  { username: 'aiko_jp', achievementSlug: 'compostela' },
  { username: 'aiko_jp', achievementSlug: 'photographer' },

  { username: 'tom_pilgrim', achievementSlug: 'first-steps' },
  { username: 'tom_pilgrim', achievementSlug: 'hundred-km-club' },
  { username: 'tom_pilgrim', achievementSlug: 'halfway-there' },
  { username: 'tom_pilgrim', achievementSlug: 'mountain-climber' },

  { username: 'lucia_cf', achievementSlug: 'first-steps' },
  { username: 'lucia_cf', achievementSlug: 'hundred-km-club' },
  { username: 'lucia_cf', achievementSlug: 'halfway-there' },
  { username: 'lucia_cf', achievementSlug: 'compostela' },
  { username: 'lucia_cf', achievementSlug: 'finisterre' },

  { username: 'james_uk', achievementSlug: 'first-steps' },
  { username: 'james_uk', achievementSlug: 'hundred-km-club' },
  { username: 'james_uk', achievementSlug: 'halfway-there' },
  { username: 'james_uk', achievementSlug: 'compostela' },

  { username: 'siobhan_ie', achievementSlug: 'first-steps' },
  { username: 'siobhan_ie', achievementSlug: 'hundred-km-club' },
  { username: 'siobhan_ie', achievementSlug: 'compostela' },

  { username: 'beatriz_pt', achievementSlug: 'first-steps' },
  { username: 'beatriz_pt', achievementSlug: 'hundred-km-club' },
  { username: 'beatriz_pt', achievementSlug: 'compostela' },

  { username: 'pierre_le', achievementSlug: 'first-steps' },
  { username: 'kim_kr', achievementSlug: 'first-steps' },
  { username: 'kim_kr', achievementSlug: 'hundred-km-club' },
  { username: 'kim_kr', achievementSlug: 'halfway-there' },
  { username: 'sofia_mx', achievementSlug: 'first-steps' },
  { username: 'sofia_mx', achievementSlug: 'hundred-km-club' },
  { username: 'marco_it', achievementSlug: 'first-steps' },
  { username: 'marco_it', achievementSlug: 'hundred-km-club' },
];

// Demo pilgrimages (besides Maria's, which is created in seed.ts)
export const DEMO_PILGRIMAGES: Array<{
  username: string;
  routeSlug: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  daysAgo?: number;
  currentStageNumber?: number;
}> = [
  { username: 'aiko_jp', routeSlug: 'camino-frances', status: 'completed', daysAgo: 90, currentStageNumber: 33 },
  { username: 'tom_pilgrim', routeSlug: 'camino-del-norte', status: 'active', daysAgo: 18, currentStageNumber: 17 },
  { username: 'james_uk', routeSlug: 'camino-primitivo', status: 'active', daysAgo: 9, currentStageNumber: 9 },
  { username: 'sofia_mx', routeSlug: 'via-de-la-plata', status: 'active', daysAgo: 11, currentStageNumber: 9 },
  { username: 'pierre_le', routeSlug: 'camino-portugues', status: 'active', daysAgo: 6, currentStageNumber: 8 },
  { username: 'siobhan_ie', routeSlug: 'camino-ingles', status: 'completed', daysAgo: 35, currentStageNumber: 5 },
  { username: 'beatriz_pt', routeSlug: 'camino-aragones', status: 'planning', currentStageNumber: 1 },
  { username: 'helena_pl', routeSlug: 'camino-frances', status: 'planning', currentStageNumber: 1 },
  { username: 'marco_it', routeSlug: 'camino-del-norte', status: 'active', daysAgo: 8, currentStageNumber: 8 },
  { username: 'kim_kr', routeSlug: 'camino-frances', status: 'active', daysAgo: 22, currentStageNumber: 24 },
];
