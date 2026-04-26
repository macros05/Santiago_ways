import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@lib/auth';
import { handleApiError, forbidden, ok } from '@lib/http';
import { prisma } from '@lib/prisma';
import { canUseAI } from '@lib/permissions';
import { geminiGenerate } from '@lib/gemini';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `Eres un experto peregrino del Camino de Santiago con 20 años de experiencia. Das consejos personalizados, prácticos y específicos. Conoces cada pueblo, albergue y rincón del Camino. Hablas en español con tono cercano y cálido, como un peregrino veterano que aconseja a un amigo. Máximo 3 párrafos por respuesta. Termina siempre con 3 tips concretos en formato lista bullet.`;

const TYPE = z.enum([
  'daily_tip',
  'albergue_pick',
  'route_planning',
  'hidden_gem',
  'weather_advice',
  'health_advice',
]);

const schema = z.object({
  type: TYPE,
  context: z
    .object({
      stageId: z.string().optional(),
      routeSlug: z.string().optional(),
      kmRemaining: z.number().optional(),
      mood: z.string().optional(),
    })
    .optional(),
});

type RecType = z.infer<typeof TYPE>;

const TYPE_INSTRUCTIONS: Record<RecType, string> = {
  daily_tip: 'Da un consejo práctico para la etapa de hoy del peregrino.',
  albergue_pick:
    'Recomienda el mejor albergue para el perfil del peregrino, justifica la elección.',
  route_planning:
    'Sugiere una división óptima de etapas para los próximos 3 días según ritmo y forma física.',
  hidden_gem:
    'Comparte un lugar poco conocido (capilla, mirador, fuente, taberna local) cerca de la ruta actual que la mayoría de peregrinos se pierde.',
  weather_advice:
    'Aconseja sobre preparación meteorológica para los próximos días: ropa, hora de salida, riesgos.',
  health_advice:
    'Da un consejo de salud y recuperación basado en los datos físicos recientes del peregrino.',
};

async function fetchWeatherSummary(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return null;
  const base = process.env.OPEN_METEO_BASE_URL ?? 'https://api.open-meteo.com/v1';
  try {
    const url = `${base}/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&forecast_days=3&timezone=auto`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      daily?: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
      };
    };
    const d = json.daily;
    if (!d) return null;
    return d.time.map((t, i) => ({
      date: t,
      tMax: d.temperature_2m_max[i] ?? null,
      tMin: d.temperature_2m_min[i] ?? null,
      precip: d.precipitation_sum[i] ?? null,
      wind: d.wind_speed_10m_max[i] ?? null,
    }));
  } catch {
    return null;
  }
}

function parseTips(text: string): string[] {
  const lines = text.split('\n');
  const tips: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.+)$/);
    if (m && m[1]) tips.push(m[1].trim());
  }
  return tips.slice(0, 5);
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      include: { subscription: true },
    });
    if (!user) return forbidden('Usuario no encontrado');
    if (!canUseAI(user)) {
      return forbidden('AI guide requires Compostelero plan');
    }

    const { type, context } = schema.parse(await req.json());

    const activePilgrimage = await prisma.pilgrimage.findFirst({
      where: { userId: user.id, status: 'active' },
      include: { route: true },
      orderBy: { createdAt: 'desc' },
    });

    const stage = context?.stageId
      ? await prisma.stage.findUnique({
          where: { id: context.stageId },
          include: { route: true },
        })
      : null;

    const route = stage?.route ?? activePilgrimage?.route ?? null;

    const recentTracks = await prisma.gpsTrack.findMany({
      where: { pilgrimage: { userId: user.id } },
      orderBy: { recordedAt: 'desc' },
      take: 5,
      select: { distanceKm: true, durationMin: true, recordedAt: true },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentHealth = await prisma.healthSnapshot.findMany({
      where: { userId: user.id, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'desc' },
      take: 7,
    });

    const weather = await fetchWeatherSummary(user.currentLat, user.currentLng);

    const avgPaceKmH = (() => {
      if (!recentTracks.length) return null;
      const totalKm = recentTracks.reduce((s, t) => s + t.distanceKm, 0);
      const totalH = recentTracks.reduce((s, t) => s + t.durationMin / 60, 0);
      return totalH > 0 ? Number((totalKm / totalH).toFixed(2)) : null;
    })();

    const userPrompt = [
      `# Perfil del peregrino`,
      `Nombre: ${user.name}`,
      user.nationality ? `Nacionalidad: ${user.nationality}` : '',
      `Caminos completados: ${user.timesCompleted}`,
      `Km totales: ${user.totalKm}`,
      ``,
      route ? `# Ruta actual\n${route.name} — ${route.totalKm} km · dificultad ${route.difficulty}` : '',
      stage
        ? `# Etapa actual\nEtapa ${stage.number}: ${stage.name}\n${stage.startPoint} → ${stage.endPoint} (${stage.distanceKm} km, +${stage.elevationGain} m)\nDificultad: ${stage.difficulty}\nTips: ${stage.tips}`
        : '',
      context?.kmRemaining ? `Km restantes hoy: ${context.kmRemaining}` : '',
      avgPaceKmH ? `Ritmo medio reciente: ${avgPaceKmH} km/h` : '',
      ``,
      recentHealth.length
        ? `# Últimos datos de salud (7 días)\n` +
          recentHealth
            .map(
              (h) =>
                `${h.date.toISOString().slice(0, 10)}: pasos ${h.steps ?? '—'}, FC ${h.heartRateAvg ?? '—'} bpm, sueño ${h.sleepHours ?? '—'} h, km ${h.distanceKm ?? '—'}`,
            )
            .join('\n')
        : '',
      ``,
      weather
        ? `# Previsión meteorológica (3 días)\n` +
          weather.map((w) => `${w.date}: ${w.tMin}-${w.tMax}°C, lluvia ${w.precip} mm, viento ${w.wind} km/h`).join('\n')
        : '',
      ``,
      `# Tarea`,
      TYPE_INSTRUCTIONS[type],
    ]
      .filter(Boolean)
      .join('\n');

    const result = await geminiGenerate({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.8,
    });

    const tips = parseTips(result.text);
    const recommendation = result.text.replace(/^\s*(?:[-*•]|\d+[.)])\s+.+$/gm, '').trim();

    return ok({
      type,
      recommendation: recommendation || result.text,
      tips,
      confidence: tips.length >= 3 ? 0.9 : 0.7,
      contextUsed: {
        hasStage: !!stage,
        hasRoute: !!route,
        hasHealth: recentHealth.length > 0,
        hasWeather: !!weather,
        hasPace: avgPaceKmH != null,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
