import type { DiaryEntry } from '@hooks/useDiary';
import type { Stamp } from '@hooks/useCredential';
import type { AuthUser } from '@stores/auth';
import { dateLocale } from './format';

export type CompostelaInput = {
  entry: DiaryEntry;
  user: Pick<AuthUser, 'name' | 'nationality'> | null;
  stamps: Stamp[];
  routeName?: string | null;
  startDate?: string | null;
  publicUrl?: string | null;
};

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(dateLocale(), { day: 'numeric', month: 'long', year: 'numeric' });
}

export function generateCompostelaHTML(input: CompostelaInput): string {
  const { entry, user, stamps, routeName, startDate, publicUrl } = input;
  const pilgrim = user?.name ?? 'Peregrino';
  const today = formatDate(new Date().toISOString());
  const entryDate = formatDate(entry.date);
  const start = formatDate(startDate);

  const stampsHtml = stamps.length
    ? stamps
        .slice(0, 30)
        .map(
          (s) => `
          <li class="stamp">
            <div class="stamp-name">${escapeHtml(s.placeName)}</div>
            <div class="stamp-meta">${escapeHtml(s.city ?? '')} · ${formatDate(s.stampedAt)} · ${escapeHtml(s.method.toUpperCase())}</div>
          </li>`,
        )
        .join('')
    : '<li class="stamp empty">Sin sellos registrados todavía.</li>';

  const imagesHtml = entry.images.length
    ? `<div class="photos">${entry.images
        .slice(0, 8)
        .map((uri) => `<div class="photo"><img src="${escapeHtml(uri)}" /></div>`)
        .join('')}</div>`
    : '';

  const qrSrc =
    publicUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`
      : null;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Compostela — SantiagoWays</title>
    <style>
      @page { size: A4; margin: 24mm 18mm; }
      :root {
        --gold: #C29333;
        --ink: #1c1917;
        --paper: #fffbeb;
        --mute: #6b5d4a;
      }
      * { box-sizing: border-box; }
      body {
        font-family: 'Georgia', 'Times New Roman', serif;
        color: var(--ink);
        background: var(--paper);
        margin: 0;
        padding: 0;
      }
      .frame {
        border: 2px solid var(--gold);
        padding: 28px 36px;
        position: relative;
      }
      .frame::before, .frame::after {
        content: '';
        position: absolute;
        left: 6px;
        right: 6px;
        height: 1px;
        background: var(--gold);
        opacity: 0.5;
      }
      .frame::before { top: 6px; }
      .frame::after { bottom: 6px; }
      header {
        text-align: center;
        margin-bottom: 24px;
      }
      .title {
        font-size: 32px;
        letter-spacing: 1px;
        margin: 0;
        color: var(--gold);
      }
      .subtitle {
        font-style: italic;
        color: var(--mute);
        margin-top: 4px;
        font-size: 13px;
      }
      .pilgrim {
        text-align: center;
        font-size: 22px;
        margin: 18px 0 6px;
      }
      .pilgrim-name { font-weight: bold; }
      .meta {
        text-align: center;
        font-size: 13px;
        color: var(--mute);
        margin-bottom: 18px;
      }
      h2 {
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: var(--gold);
        border-bottom: 1px solid var(--gold);
        padding-bottom: 4px;
        margin-top: 24px;
      }
      ul.stamps { list-style: none; padding: 0; margin: 0; }
      .stamp { padding: 6px 0; border-bottom: 1px dotted #d6cfbf; }
      .stamp:last-child { border-bottom: 0; }
      .stamp-name { font-weight: bold; font-size: 14px; }
      .stamp-meta { font-size: 11px; color: var(--mute); }
      .stamp.empty { color: var(--mute); font-style: italic; }
      .entry-title {
        font-size: 20px;
        margin: 8px 0 4px;
      }
      .entry-body {
        font-size: 13px;
        line-height: 1.55;
        white-space: pre-wrap;
      }
      .photos {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
        margin-top: 12px;
      }
      .photo {
        width: 100%;
        aspect-ratio: 4 / 3;
        overflow: hidden;
        border-radius: 6px;
        background: #ece6d5;
      }
      .photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      footer {
        margin-top: 28px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 16px;
        font-size: 11px;
        color: var(--mute);
      }
      footer .domain { font-style: italic; }
      footer .qr { width: 70px; height: 70px; }
    </style>
  </head>
  <body>
    <div class="frame">
      <header>
        <h1 class="title">Compostela</h1>
        <div class="subtitle">SantiagoWays · ${escapeHtml(today)}</div>
      </header>
      <p class="pilgrim">El peregrino <span class="pilgrim-name">${escapeHtml(pilgrim)}</span></p>
      <p class="meta">
        ${routeName ? `${escapeHtml(routeName)}` : 'Camino de Santiago'}
        ${start ? ` · inicio: ${escapeHtml(start)}` : ''}
      </p>

      <h2>Sellos del peregrino</h2>
      <ul class="stamps">${stampsHtml}</ul>

      <h2>Diario · ${escapeHtml(entryDate)}</h2>
      <p class="entry-title">${escapeHtml(entry.title)}</p>
      <p class="entry-body">${escapeHtml(entry.body)}</p>
      ${imagesHtml}

      <footer>
        <div class="domain">santiagoways.app${publicUrl ? ` · ${escapeHtml(publicUrl)}` : ''}</div>
        ${qrSrc ? `<img class="qr" src="${qrSrc}" alt="QR" />` : ''}
      </footer>
    </div>
  </body>
</html>`;
}
