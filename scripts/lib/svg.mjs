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
 * Places the page backdrop inside a card.
 *
 * The image bleeds to the card's top and bottom edges so consecutive cards meet
 * on a single hairline: only `offset` changes between them, and each offset
 * continues exactly where the previous card stopped. That is what makes the
 * artwork read as one sheet down the page instead of a repeating texture.
 */
export function backdropSlice({ uri, offset, x = 12 }) {
  return `<image x="${x}" y="${(-offset).toFixed(1)}" width="${CANVAS.tailWidth}" height="${CANVAS.tailHeight}" preserveAspectRatio="none" xlink:href="${uri}"/>`;
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
