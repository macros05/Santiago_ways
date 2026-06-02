# SantiagoWays — Go-to-market & plan de marketing

_Última actualización: 2026-06-02_

Plan de lanzamiento y crecimiento para SantiagoWays. Pensado para un lanzamiento
de un solo fundador / equipo pequeño, presupuesto reducido, con la temporada del
Camino (primavera–otoño) como motor estacional.

---

## 1. Posicionamiento

**Una frase:** _"Tu compañero del Camino de Santiago: planifica, camina sin
perderte y guarda cada paso — incluso sin cobertura."_

**Para quién (audiencia primaria):**
- Peregrinos primerizos (35–65 años) que planifican con 1–6 meses de antelación.
- Caminantes jóvenes (20–35) que documentan el viaje y buscan comunidad.
- Internacionales (DE, KR, US, IT, FR…) — el Camino es global; **i18n importa**.

**Diferenciadores frente a la competencia** (Buen Camino, Wise Pilgrim, Camino
Ninja, Stingy Nomads):
- **Tracking GPS + credencial digital con sellos validados por geolocalización**
  y elegibilidad de Compostela calculada.
- **Diario del peregrino** con fotos y enlace público para compartir.
- **Modo offline real** (etapas + mapas descargables) para zonas sin cobertura.
- **Comunidad geolocalizada** (peregrinos cercanos, grupos por año).
- Diseño cuidado ("Liquid Dawn") frente a apps funcionales pero feas.

---

## 2. Modelo de negocio

- **Freemium.** Núcleo gratis (rutas, etapas, albergues, comunidad). Premium
  (RevenueCat: `buen_camino` / `compostelero`) desbloquea offline, tracking
  avanzado, diario ilimitado, sin anuncios.
- **Prueba gratis 7 días** — exponerla claramente en el paywall (hoy es backlog).
- Posibles ingresos secundarios más adelante: comisión de reservas de albergues
  (la API de availability ya existe), albergues destacados (modelo
  `FeaturedAlbergue` ya en DB).

**KPIs a vigilar desde el día 1** (la cola de `analytics` ya emite eventos):
- Activación: % que completa onboarding y crea/planifica una peregrinación.
- Retención D1/D7/D30.
- Conversión free→trial→paga; churn.
- Eventos clave: `stageCompleted`, `credentialStamp`, `diaryEntryCreated`,
  `paywallShown`/`paywallUpgrade`.

---

## 3. Pre-lanzamiento (4–6 semanas antes)

- [ ] **Landing web** en `santiagoways.app` con captura de emails (waitlist) +
      link a tiendas cuando estén. Reutiliza el Next.js del API.
- [ ] **ASO (App Store Optimization):** keywords "Camino de Santiago", "Camino
      Frances", "pilgrim", "Jakobsweg", "albergues". Título + subtítulo con
      keyword principal. Screenshots por idioma (ES/EN/DE como mínimo).
- [ ] **Cuentas sociales:** Instagram + TikTok (contenido visual del Camino),
      grupo/perfil donde vive la audiencia. Reservar handles.
- [ ] **20–30 piezas de contenido** listas para publicar (ver §5).
- [ ] **Lista de prensa/creadores:** blogs de senderismo, YouTubers del Camino,
      podcasts de viaje, foros (Camino de Santiago Forum, r/CaminoDeSantiago).
- [ ] **Beta cerrada** vía TestFlight/Play Internal con 20–50 peregrinos reales
      (reclutar en foros) → testimonios + corrección de bugs.

---

## 4. Lanzamiento

- **Timing:** idealmente **febrero–abril**, cuando la gente planifica el Camino
  de primavera/verano (pico de intención de búsqueda).
- **Product Hunt** (versión EN) el día del lanzamiento.
- **Posts de lanzamiento** en r/CaminoDeSantiago, Camino forums, grupos de
  Facebook ("Camino de Santiago" tiene grupos de 100k+), subreddits de viaje.
- **Outreach a creadores** del Camino con acceso gratuito a premium a cambio de
  reseña honesta.
- **Nota de prensa** a medios de turismo/peregrinación (ES + DE + EN).

---

## 5. Crecimiento continuo (motor de contenido)

El Camino genera contenido visual y emocional infinito y barato:
- **Guías por ruta/etapa** (SEO blog en la web): "Camino Francés etapa a etapa",
  "Qué meter en la mochila", "Cuánto cuesta el Camino" → tráfico orgánico de alta
  intención que enlaza a la app.
- **Reels/TikToks**: amaneceres, sellos de credencial, mapas de elevación,
  "día X en el Camino". El propio diario de usuarios = contenido (con permiso).
- **UGC / loop viral:** compartir el enlace público del diario y la Compostela
  digital → cada peregrino atrae a futuros peregrinos.
- **Email**: newsletter estacional con consejos de preparación a los de la
  waitlist y usuarios free (motor de conversión a premium).
- **Referidos:** "invita a tu compañero de Camino" → meses premium gratis.

---

## 6. Riesgos de marketing y mitigación

| Riesgo | Mitigación |
|---|---|
| Estacionalidad fuerte (invierno flojo) | Capturar intención de planificación en invierno; contenido evergreen SEO |
| App store rejection retrasa el lanzamiento | Enviar 2-3 semanas antes de la ventana de marketing |
| Reseñas negativas por bugs de GPS/batería | No lanzar sin verificación en dispositivo (ver PRODUCTION_READINESS §2.7) |
| Competidores establecidos con marca | Apoyarse en diseño + comunidad + offline como cuña |
| Coste de adquisición pagada alto | Priorizar orgánico (SEO + UGC + foros) antes que ads |

---

## 7. Primeros 30 días tras el lanzamiento

1. Vigilar Sentry y reseñas a diario; hotfix vía OTA (EAS Update) lo que se
   pueda sin pasar por revisión.
2. Responder **todas** las reseñas (señal ASO + confianza).
3. Iterar el onboarding según dónde caen los usuarios (`onboardingStep`).
4. Doble check del embudo del paywall con datos reales antes de gastar en ads.
5. Recoger testimonios de peregrinos en ruta para la landing y las tiendas.

> Marketing y producto van de la mano: **no inviertas en adquisición hasta que la
> retención D7 y la conversión de trial demuestren que el producto encaja.** El
> contenido orgánico y los foros del Camino son tu mejor canal mientras tanto.
</content>
