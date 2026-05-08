// Deterministic daily quote selection — same quote across the day for every
// install, rotates each midnight.
const QUOTES = [
  { es: 'Solo se ve bien con el corazón. Lo esencial es invisible a los ojos.', en: 'It is only with the heart that one can see rightly.' },
  { es: 'El Camino se hace al andar.', en: 'The path is made by walking.' },
  { es: 'No es lo lejos, sino lo profundo.', en: 'Not how far, but how deep.' },
  { es: 'Cada paso es ya la meta.', en: 'Every step is already the goal.' },
  { es: 'La paz no es ausencia de tormenta, es calma dentro de ella.', en: 'Peace is calm within the storm.' },
  { es: 'Quien busca a Santiago, se encuentra a sí mismo.', en: 'Who seeks Santiago finds themselves.' },
  { es: 'Las prisas matan al peregrino.', en: 'Haste kills the pilgrim.' },
  { es: 'Llevarás solo lo que necesitas. Dejarás todo lo demás.', en: 'You\'ll carry only what you need. You\'ll leave the rest.' },
  { es: 'Buen Camino: dos palabras, mil deseos.', en: 'Buen Camino: two words, a thousand wishes.' },
  { es: 'El miedo se disuelve a 5 km/h.', en: 'Fear dissolves at 5 km/h.' },
  { es: 'No hay rutas sin ampollas y no hay ampollas sin orgullo.', en: 'No paths without blisters, no blisters without pride.' },
  { es: 'La flecha amarilla nunca falla.', en: 'The yellow arrow never fails.' },
];

export function dailyQuote(locale: 'es' | 'en' = 'es'): string {
  const day = Math.floor(Date.now() / 86_400_000);
  const idx = day % QUOTES.length;
  return QUOTES[idx]![locale];
}
