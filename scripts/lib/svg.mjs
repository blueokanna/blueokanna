/** Small SVG helpers shared by every template. */

import { CANVAS } from './config.mjs';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

/** Escapes text for use in SVG character data and attribute values. */
export function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

/** Wraps binary image data into a data URI that survives the camo proxy. */
export function dataUri(mime, buffer) {
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

export const FONT_MONO = 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace';
export const FONT_UI = '"Motiva Sans", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * Width of a monospace string. Labels and cursors are placed from measured
 * text instead of hand-tuned offsets, which is what caused earlier overlaps.
 */
export function monoWidth(text, size, letterSpacing = 0) {
  const glyphs = [...String(text)].length;
  return glyphs * size * 0.6 + Math.max(0, glyphs - 1) * letterSpacing;
}

/** Formats a date as YYYY-MM-DD without depending on the host locale. */
export function isoDate(value = new Date()) {
  return new Date(value).toISOString().slice(0, 10);
}

/** 1420 -> "1.4k", 998 -> "998". Used for counters on the telemetry card. */
export function formatCount(value) {
  if (value === null || value === undefined) return null;
  if (value < 1000) return String(value);
  if (value < 10000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${Math.round(value / 1000)}k`;
}

/** 4194304 -> "4.2 MB". */
export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return null;
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 100 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

/**
 * Places the page canvas inside a card.
 *
 * Every card draws the same image at the same scale and only shifts the window,
 * so consecutive sections read as one continuous backdrop: `offset` is the
 * canvas row, in source pixels, that lands on the card's first row.
 */
export function canvasSlice({ uri, cardWidth, cardHeight, offset, x = 12, y = 12 }) {
  const scale = cardWidth / CANVAS.width;
  const height = (CANVAS.height * scale).toFixed(1);
  return `<image x="${x}" y="${(y - offset * scale).toFixed(1)}" width="${cardWidth}" height="${height}" preserveAspectRatio="none" xlink:href="${uri}"/>`;
}

/**
 * Diagonal ownership mark drawn over the artwork inside the rendered card.
 *
 * The published card necessarily contains the artwork pixels, so the mark is
 * baked into the SVG too: a scraped copy still carries the attribution.
 */
export function watermarkDefs(palette, id = 'wm') {
  return `<pattern id="${id}" width="220" height="150" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
      <text x="0" y="90" font-size="15" font-weight="700" letter-spacing="1" fill="${palette.accent1}" fill-opacity="0.05">blueokanna</text>
    </pattern>`;
}

/** Paints the mark across a rectangle. */
export function watermarkRect({ id = 'wm', x, y, width, height, opacity = 0.55 }) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="url(#${id})" opacity="${opacity}"/>`;
}
