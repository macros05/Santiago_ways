#!/usr/bin/env node
/**
 * SantiagoWays — brand asset generation via Gemini image models.
 * Concept: "Aurora Camino — Liquid Dawn". Obsidian base, aurora light-blooms
 * (cool pre-dawn indigo melting into amber sunrise), luminous gold scallop-shell
 * (vieira) iconography, liquid-glass depth.
 *
 * Usage: GEMINI_API_KEY=... node scripts/gen-assets.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}

const OUT = path.resolve('santiagoways-app/assets/generated');
const MODELS = ['gemini-3-pro-image-preview', 'gemini-2.5-flash-image'];

const STYLE =
  'Aesthetic: futuristic Apple-style "liquid glass" with a spiritual Camino de Santiago soul. ' +
  'Deep obsidian near-black background (#0B0A09) with a soft aurora bloom — cool pre-dawn indigo/teal ' +
  'melting into warm amber and gold sunrise light. Cinematic, atmospheric, premium, high detail, ' +
  'subtle film grain, volumetric light, glassy translucent surfaces, elegant and serene. No text, no words, no letters, no watermark.';

const JOBS = [
  {
    name: 'icon.png',
    aspect: '1:1',
    prompt:
      'App icon. A single luminous gold scallop shell (vieira, the symbol of the Camino de Santiago) ' +
      'rendered as polished liquid glass, glowing softly, centered, radial aurora glow behind it, ' +
      'minimal and iconic, crisp, premium app-icon composition with generous padding. ' + STYLE,
  },
  {
    name: 'adaptive-icon.png',
    aspect: '1:1',
    prompt:
      'Android adaptive icon foreground. A single glowing gold scallop shell (vieira) centered in the ' +
      'middle third of the frame with large transparent-feeling dark margins, simple, iconic, no background clutter. ' + STYLE,
  },
  {
    name: 'splash.png',
    aspect: '9:16',
    prompt:
      'Vertical mobile splash screen. A lone pilgrim silhouette walking a misty mountain path at dawn toward ' +
      'a glowing horizon, a faint golden scallop shell motif formed by the aurora light in the sky, ' +
      'vast atmospheric depth, cinematic vertical composition with the figure small and centered low. ' + STYLE,
  },
  {
    name: 'onboarding-hero.png',
    aspect: '9:16',
    prompt:
      'Vertical hero image. A breathtaking dawn over the Camino de Santiago — rolling Galician hills, ' +
      'a winding stone path disappearing into golden morning mist, a yellow Camino arrow subtly glowing on a stone, ' +
      'epic cinematic landscape, painterly yet photoreal, sense of journey and hope. ' + STYLE,
  },
  {
    name: 'onboarding-routes.png',
    aspect: '9:16',
    prompt:
      'Vertical image. An aerial cinematic view of multiple Camino routes threading across northern Spain at ' +
      'golden hour — coastline, mountains, vineyards and medieval villages, soft volumetric clouds, ' +
      'a glowing network of light-trails tracing the pilgrim paths like liquid gold. ' + STYLE,
  },
  {
    name: 'onboarding-community.png',
    aspect: '9:16',
    prompt:
      'Vertical image. Warm silhouettes of a small group of pilgrims sharing a moment at a stone albergue ' +
      'courtyard at dusk, string lights, glowing lanterns, sense of belonging and warmth, ' +
      'soft bokeh, intimate cinematic atmosphere. ' + STYLE,
  },
  {
    name: 'aurora-bg.png',
    aspect: '9:16',
    prompt:
      'Vertical abstract background texture. A smooth aurora gradient mesh — deep obsidian at the edges ' +
      'blooming into indigo, teal and warm amber light in the center, very soft, dreamy, no objects, ' +
      'pure atmospheric gradient with subtle grain, suitable as an app background. ' + STYLE,
  },
  {
    name: 'notification-icon.png',
    aspect: '1:1',
    prompt:
      'Simple monochrome notification glyph. A clean solid white scallop shell (vieira) silhouette ' +
      'centered on a fully transparent-feeling pure black background, flat, high contrast, no gradients, no text.',
  },
];

async function callModel(model, prompt, aspect) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${model} HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error(`${model}: no image in response: ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(img.inlineData.data, 'base64');
}

async function generate(job) {
  let lastErr;
  for (const model of MODELS) {
    try {
      const buf = await callModel(model, job.prompt, job.aspect);
      await writeFile(path.join(OUT, job.name), buf);
      console.log(`✓ ${job.name}  (${model}, ${(buf.length / 1024).toFixed(0)} KB)`);
      return true;
    } catch (e) {
      lastErr = e;
      console.warn(`… ${job.name} failed on ${model}: ${e.message}`);
    }
  }
  console.error(`✗ ${job.name} — all models failed: ${lastErr?.message}`);
  return false;
}

await mkdir(OUT, { recursive: true });
console.log(`Generating ${JOBS.length} assets → ${OUT}`);
// Sequential to stay under rate limits.
for (const job of JOBS) {
  // eslint-disable-next-line no-await-in-loop
  await generate(job);
}
console.log('Done.');
