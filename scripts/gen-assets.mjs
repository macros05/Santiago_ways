#!/usr/bin/env node
/**
 * SantiagoWays — brand asset generation via Gemini image models.
 * Concept: "Flecha — documental auténtico". Authentic, natural documentary
 * photography of the real Camino de Santiago — weathered stone, eucalyptus and
 * oak greens, the iconic yellow arrow. No aurora, no liquid metal, no sci-fi.
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
  'Aesthetic: authentic, natural documentary photography of the real Camino de Santiago in Spain. ' +
  'Shot on a 35mm camera, soft natural golden-hour or overcast daylight, realistic true-to-life colors, ' +
  'gentle film grain, natural depth of field. Warm earthy palette — weathered grey stone, eucalyptus and oak greens, ' +
  'cream sky, the iconic Camino yellow arrow. Calm, grounded, hopeful, unpretentious. ' +
  'STRICTLY NO aurora borealis, NO northern lights, NO liquid metal, NO glossy 3D render, NO neon glow, ' +
  'NO surreal sky, NO holographic, NO sci-fi. No text, no words, no letters, no watermark.';

const JOBS = [
  {
    name: 'icon.png',
    aspect: '1:1',
    prompt:
      'Flat minimalist app icon: a single bright Camino yellow arrow (#F5C518) angled slightly up-right, ' +
      'hand-painted look with a slightly imperfect edge, on a solid deep forest-green (#3A5A40) rounded square ' +
      'with a subtle concrete/stone texture. No gloss, no bevel, no gradient, no shell, no glow. ' +
      'Looks like a real spray-painted wall waymark. Crisp, iconic, generous padding.',
  },
  {
    name: 'adaptive-icon.png',
    aspect: '1:1',
    prompt:
      'Android adaptive icon foreground: the same flat yellow arrow (#F5C518) centered in the middle third on ' +
      'deep forest-green (#3A5A40), large safe margins, simple and iconic, no clutter, no gloss.',
  },
  {
    name: 'splash.png',
    aspect: '9:16',
    prompt:
      'Vertical splash: a real photograph of a yellow Camino arrow painted on weathered grey Galician stone at soft dawn, ' +
      'calm and minimal, muted natural color, lots of negative space, deep warm vignette at the bottom, no people. ' + STYLE,
  },
  {
    name: 'onboarding-hero.png',
    aspect: '9:16',
    prompt:
      'Real photo: a yellow Camino arrow on a stone marker pointing down a eucalyptus-lined dirt path in green Galicia ' +
      'at golden hour, soft mist, natural and hopeful, a genuine pilgrimage trail. ' + STYLE,
  },
  {
    name: 'onboarding-routes.png',
    aspect: '9:16',
    prompt:
      'Real photo: green rolling hills with a winding dirt Camino path through the northern Spain countryside at golden ' +
      'hour, a small medieval stone village in the distance, natural documentary landscape, NO light trails. ' + STYLE,
  },
  {
    name: 'onboarding-community.png',
    aspect: '9:16',
    prompt:
      'Real candid photo: a few pilgrims with backpacks resting and talking in a stone albergue courtyard at dusk, ' +
      'warm natural lantern light, a genuine human moment, soft documentary, natural faces (not blurred). ' + STYLE,
  },
  {
    name: 'home-hero.png',
    aspect: '9:16',
    prompt:
      'Real photo: a Galician Camino landscape — green hills and a stone path under a soft cream sky at golden hour, ' +
      'evocative and natural, room for an overlay at the bottom, no people, no text. ' + STYLE,
  },
  {
    name: 'notification-icon.png',
    aspect: '1:1',
    prompt:
      'Simple monochrome notification glyph: a clean solid white Camino arrow silhouette, slightly up-right, ' +
      'centered on pure black, flat, high contrast, no gradients, no text.',
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
