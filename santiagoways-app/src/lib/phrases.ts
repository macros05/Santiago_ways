// Useful pilgrim phrases in 6 languages. Local-only (no network needed).
// Categories are kept short — these surface on the practical-info screen
// and need to be readable on a small device while walking.

export type PhraseLang = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'it';

type PhraseEntry = Record<PhraseLang, string>;

export const PHRASE_LANG_LABEL: Record<PhraseLang, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
};

export const PHRASE_CATEGORIES: Array<{
  key: string;
  title: PhraseEntry;
  phrases: PhraseEntry[];
}> = [
  {
    key: 'greetings',
    title: {
      es: 'Saludos',
      en: 'Greetings',
      fr: 'Salutations',
      de: 'Begrüßungen',
      pt: 'Cumprimentos',
      it: 'Saluti',
    },
    phrases: [
      {
        es: 'Buen Camino',
        en: 'Buen Camino',
        fr: 'Bon Chemin',
        de: 'Guten Weg',
        pt: 'Bom Caminho',
        it: 'Buon Cammino',
      },
      {
        es: 'Hola, ¿qué tal?',
        en: 'Hi, how are you?',
        fr: 'Salut, ça va ?',
        de: 'Hallo, wie geht\'s?',
        pt: 'Olá, tudo bem?',
        it: 'Ciao, come stai?',
      },
      {
        es: 'Gracias',
        en: 'Thank you',
        fr: 'Merci',
        de: 'Danke',
        pt: 'Obrigado',
        it: 'Grazie',
      },
      {
        es: 'Por favor',
        en: 'Please',
        fr: 'S\'il vous plaît',
        de: 'Bitte',
        pt: 'Por favor',
        it: 'Per favore',
      },
    ],
  },
  {
    key: 'albergue',
    title: {
      es: 'En el albergue',
      en: 'At the albergue',
      fr: 'À l\'auberge',
      de: 'In der Herberge',
      pt: 'No albergue',
      it: 'All\'ostello',
    },
    phrases: [
      {
        es: '¿Tenéis camas libres?',
        en: 'Do you have free beds?',
        fr: 'Avez-vous des lits libres ?',
        de: 'Habt ihr freie Betten?',
        pt: 'Têm camas livres?',
        it: 'Avete letti liberi?',
      },
      {
        es: '¿A qué hora cerráis?',
        en: 'What time do you close?',
        fr: 'À quelle heure fermez-vous ?',
        de: 'Um wieviel Uhr schließt ihr?',
        pt: 'A que horas fecham?',
        it: 'A che ora chiudete?',
      },
      {
        es: '¿Puedo hacer la colada?',
        en: 'Can I do laundry?',
        fr: 'Puis-je faire la lessive ?',
        de: 'Kann ich Wäsche waschen?',
        pt: 'Posso fazer a lavandaria?',
        it: 'Posso fare il bucato?',
      },
      {
        es: 'Necesito un sello, por favor',
        en: 'I need a stamp, please',
        fr: 'J\'ai besoin d\'un tampon, s\'il vous plaît',
        de: 'Ich brauche einen Stempel, bitte',
        pt: 'Preciso de um carimbo, por favor',
        it: 'Ho bisogno di un timbro, per favore',
      },
    ],
  },
  {
    key: 'food',
    title: {
      es: 'Comida y bebida',
      en: 'Food & drink',
      fr: 'Nourriture & boisson',
      de: 'Essen & Trinken',
      pt: 'Comida e bebida',
      it: 'Cibo e bevande',
    },
    phrases: [
      {
        es: 'Un café con leche, por favor',
        en: 'A coffee with milk, please',
        fr: 'Un café au lait, s\'il vous plaît',
        de: 'Einen Milchkaffee, bitte',
        pt: 'Um café com leite, por favor',
        it: 'Un caffè con latte, per favore',
      },
      {
        es: 'El menú del peregrino',
        en: 'The pilgrim menu',
        fr: 'Le menu du pèlerin',
        de: 'Das Pilgermenü',
        pt: 'O menu do peregrino',
        it: 'Il menù del pellegrino',
      },
      {
        es: '¿Tenéis opciones vegetarianas?',
        en: 'Do you have vegetarian options?',
        fr: 'Avez-vous des options végétariennes ?',
        de: 'Habt ihr vegetarische Optionen?',
        pt: 'Têm opções vegetarianas?',
        it: 'Avete opzioni vegetariane?',
      },
    ],
  },
  {
    key: 'help',
    title: {
      es: 'Ayuda y emergencias',
      en: 'Help & emergencies',
      fr: 'Aide et urgences',
      de: 'Hilfe und Notfälle',
      pt: 'Ajuda e emergências',
      it: 'Aiuto ed emergenze',
    },
    phrases: [
      {
        es: 'Necesito un médico',
        en: 'I need a doctor',
        fr: 'J\'ai besoin d\'un médecin',
        de: 'Ich brauche einen Arzt',
        pt: 'Preciso de um médico',
        it: 'Ho bisogno di un medico',
      },
      {
        es: '¿Dónde está la farmacia?',
        en: 'Where is the pharmacy?',
        fr: 'Où est la pharmacie ?',
        de: 'Wo ist die Apotheke?',
        pt: 'Onde fica a farmácia?',
        it: 'Dov\'è la farmacia?',
      },
      {
        es: 'Tengo ampollas',
        en: 'I have blisters',
        fr: 'J\'ai des ampoules',
        de: 'Ich habe Blasen',
        pt: 'Tenho bolhas',
        it: 'Ho delle vesciche',
      },
      {
        es: 'Estoy perdido/a',
        en: 'I am lost',
        fr: 'Je suis perdu(e)',
        de: 'Ich habe mich verlaufen',
        pt: 'Estou perdido/a',
        it: 'Mi sono perso/a',
      },
    ],
  },
  {
    key: 'directions',
    title: {
      es: 'Direcciones',
      en: 'Directions',
      fr: 'Indications',
      de: 'Wegweiser',
      pt: 'Direções',
      it: 'Indicazioni',
    },
    phrases: [
      {
        es: '¿Por dónde es el Camino?',
        en: 'Which way is the Camino?',
        fr: 'Où est le Chemin ?',
        de: 'Wo geht der Weg lang?',
        pt: 'Por onde é o Caminho?',
        it: 'Da che parte è il Cammino?',
      },
      {
        es: '¿Cuántos kilómetros faltan?',
        en: 'How many kilometres are left?',
        fr: 'Combien de kilomètres reste-t-il ?',
        de: 'Wie viele Kilometer noch?',
        pt: 'Quantos quilómetros faltam?',
        it: 'Quanti chilometri mancano?',
      },
      {
        es: '¿Hay agua por aquí?',
        en: 'Is there water around here?',
        fr: 'Y a-t-il de l\'eau par ici ?',
        de: 'Gibt es hier Wasser?',
        pt: 'Há água por aqui?',
        it: 'C\'è acqua qui vicino?',
      },
    ],
  },
];

export const PACKING_CHECKLIST = [
  { key: 'backpack', es: 'Mochila 30-40L', en: 'Backpack 30-40L', essential: true },
  { key: 'shoes', es: 'Calzado de trekking rodado', en: 'Broken-in trekking shoes', essential: true },
  { key: 'socks', es: 'Calcetines de merino x3', en: 'Merino socks x3', essential: true },
  { key: 'sleepingbag', es: 'Saco ligero o sábana', en: 'Light sleeping bag or liner', essential: true },
  { key: 'rain', es: 'Chubasquero o poncho', en: 'Rain jacket or poncho', essential: true },
  { key: 'water', es: 'Cantimplora 1.5L', en: '1.5L water bottle', essential: true },
  { key: 'sunscreen', es: 'Crema solar SPF 50', en: 'Sunscreen SPF 50', essential: true },
  { key: 'firstaid', es: 'Botiquín (vaselina, ibuprofeno, tiritas)', en: 'First aid (vaseline, ibuprofen, plasters)', essential: true },
  { key: 'credential', es: 'Credencial del peregrino', en: 'Pilgrim credential', essential: true },
  { key: 'id', es: 'DNI / pasaporte', en: 'ID / passport', essential: true },
  { key: 'cash', es: 'Efectivo (~50€/día)', en: 'Cash (~50€/day)', essential: true },
  { key: 'powerbank', es: 'Power bank 10000 mAh', en: 'Power bank 10000 mAh', essential: false },
  { key: 'sandals', es: 'Sandalias para descansar pies', en: 'Sandals to rest feet', essential: false },
  { key: 'merino', es: '2 camisetas técnicas', en: '2 technical t-shirts', essential: false },
  { key: 'pants', es: 'Pantalón ligero / convertible', en: 'Light / convertible pants', essential: false },
  { key: 'fleece', es: 'Forro polar', en: 'Fleece', essential: false },
  { key: 'hat', es: 'Gorra o pañuelo', en: 'Cap or buff', essential: false },
  { key: 'poles', es: 'Bastones de trekking', en: 'Trekking poles', essential: false },
  { key: 'earplugs', es: 'Tapones para los oídos', en: 'Earplugs', essential: false },
  { key: 'towel', es: 'Toalla microfibra', en: 'Microfiber towel', essential: false },
];

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Experience = 'first' | 'some' | 'veteran';

export function recommendDailyKm(level: FitnessLevel, exp: Experience): { min: number; max: number } {
  const base = level === 'beginner' ? 16 : level === 'intermediate' ? 22 : 28;
  const bonus = exp === 'first' ? -2 : exp === 'some' ? 0 : 3;
  const target = base + bonus;
  return { min: Math.max(12, target - 4), max: target + 4 };
}
