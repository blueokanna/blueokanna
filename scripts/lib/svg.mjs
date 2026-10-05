/** Small SVG helpers shared by every template. */

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
