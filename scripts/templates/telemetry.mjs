/**
 * Telemetry card: GitHub statistics and most-used languages, side by side in
 * one full-width card, so the two panels are identical in height by
 * construction and the page backdrop runs behind both.
 *
 * Every row is driven by a value collected from the API; a row whose value is
 * null is omitted, and the card states its data sources in the footer.
 */

import { PALETTE as P } from '../lib/config.mjs';
import { esc, formatBytes, formatCount, isoDate, backdropSlice, watermarkDefs, watermarkRect } from '../lib/svg.mjs';

const W = 1200;
const H = 470;
const HEADER_Y = 52;

const LEFT = { x: 40, y: 78, w: 560, h: 348 };
const RIGHT = { x: 640, y: 78, w: 520, h: 348 };

/** Row glyphs — drawn, not icon fonts, so nothing depends on the viewer. */
const ICONS = {
  star: (x, y) => `<path d="M${x} ${y - 7} l3.2 6.6 7.2 1 -5.2 5.1 1.3 7.2 -6.5 -3.4 -6.5 3.4 1.3 -7.2 -5.2 -5.1 7.2 -1 z" fill="${P.accent2}"/>`,
  commits: (x, y) => `<path d="M${x - 9} ${y} h5 M${x + 4} ${y} h5" stroke="${P.accent2}" stroke-width="1.6" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${P.accent2}" stroke-width="1.6"/>`,
  pr: (x, y) => `<circle cx="${x - 6}" cy="${y - 5}" r="3" fill="none" stroke="${P.accent2}" stroke-width="1.5"/><path d="M${x - 6} ${y - 2} v9" stroke="${P.accent2}" stroke-width="1.5" stroke-linecap="round"/><circle cx="${x + 6}" cy="${y + 5}" r="3" fill="none" stroke="${P.accent2}" stroke-width="1.5"/><path d="M${x + 6} ${y - 9} v10" stroke="${P.accent2}" stroke-width="1.5" stroke-linecap="round"/>`,
  issue: (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${P.accent2}" stroke-width="1.6"/><path d="M${x} ${y - 3.4} v4 M${x} ${y + 3} v0.4" stroke="${P.accent2}" stroke-width="1.7" stroke-linecap="round"/>`,
  repo: (x, y) => `<path d="M${x - 7} ${y - 7} h11 a3 3 0 0 1 3 3 v11 a3 3 0 0 1 -3 3 h-11 z" fill="none" stroke="${P.accent2}" stroke-width="1.5"/><path d="M${x - 4} ${y - 7} v17" stroke="${P.accent2}" stroke-width="1.5"/>`,
  users: (x, y) => `<circle cx="${x - 3}" cy="${y - 4}" r="3.6" fill="none" stroke="${P.accent2}" stroke-width="1.5"/><path d="M${x - 9} ${y + 6} c0 -4 2.6 -6 6 -6 s6 2 6 6" fill="none" stroke="${P.accent2}" stroke-width="1.5" stroke-linecap="round"/><path d="M${x + 5} ${y - 6} a3.4 3.4 0 0 1 0 7 M${x + 6} ${y + 1} c3 0 5 2 5 5" fill="none" stroke="${P.accent2}" stroke-width="1.4" stroke-linecap="round"/>`,
  calendar: (x, y) => `<rect x="${x - 8}" y="${y - 7}" width="16" height="15" rx="2" fill="none" stroke="${P.accent2}" stroke-width="1.5"/><path d="M${x - 8} ${y - 2} h16 M${x - 4} ${y - 10} v4 M${x + 4} ${y - 10} v4" stroke="${P.accent2}" stroke-width="1.5" stroke-linecap="round"/>`,
};

/** Statistics rows, in display order. Rows with a null value are dropped. */
function statRows(metrics) {
  const rows = [
    ['star', 'Total stars earned', formatCount(metrics.stars)],
    ['commits', 'Total commits', formatCount(metrics.commits)],
    ['pr', 'Total pull requests', formatCount(metrics.pullRequests)],
    ['issue', 'Total issues', formatCount(metrics.issues)],
    ['repo', 'Public repositories', formatCount(metrics.repositories)],
    ['users', 'Followers', formatCount(metrics.followers)],
    ['calendar', 'On GitHub since', metrics.since ? String(metrics.since) : null],
  ].filter(([, , value]) => value !== null);

  return rows.map(([icon, label, value], index) => {
    const y = LEFT.y + 56 + index * 38;
    return `
      <g>
        ${ICONS[icon](LEFT.x + 18, y - 4)}
        <text x="${LEFT.x + 44}" y="${y}" font-size="12.5" fill="${P.ice}">${esc(label)}</text>
        <text x="${LEFT.x + LEFT.w - 18}" y="${y}" font-size="14.5" font-weight="700" fill="${P.silver}" text-anchor="end">${esc(value)}</text>
        <path d="M${LEFT.x + 14} ${y + 13} H${LEFT.x + LEFT.w - 14}" stroke="${P.line}" stroke-width="1" stroke-opacity="0.45"/>
      </g>`;
  }).join('');
}

/** Stacked byte bar plus a two-column legend. */
function languagePanels(metrics) {
  const languages = metrics.languages;
  if (!languages.length) {
    return `
      <text x="${RIGHT.x + RIGHT.w / 2}" y="${RIGHT.y + 150}" font-size="12" fill="${P.muted}" text-anchor="middle">language data unavailable this run</text>`;
  }

  const barY = RIGHT.y + 46;
  const barW = RIGHT.w - 36;
  let cursor = RIGHT.x + 18;
  const segments = languages.map((language) => {
    const width = (language.percent / 100) * barW;
    const segment = `<rect x="${cursor.toFixed(2)}" y="${barY}" width="${Math.max(2, width).toFixed(2)}" height="12" fill="${language.color}"/>`;
    cursor += width;
    return segment;
  }).join('');

  const columns = [0, 1];
  const legend = columns.map((column) => {
    const slice = languages.slice(column * 4, column * 4 + 4);
    return slice.map((language, row) => {
      const x = RIGHT.x + 18 + column * 250;
      const y = barY + 46 + row * 36;
      return `
        <g>
          <rect x="${x}" y="${y - 8}" width="9" height="9" rx="2" fill="${language.color}"/>
          <text x="${x + 16}" y="${y}" font-size="12" fill="${P.silver}">${esc(language.name)}</text>
          <text x="${x + 236}" y="${y}" font-size="12" fill="${P.ice}" text-anchor="end">${language.percent.toFixed(2)}%</text>
          <text x="${x + 16}" y="${y + 15}" font-size="10" fill="${P.muted}">${esc(formatBytes(language.bytes))}</text>
        </g>`;
    }).join('');
  }).join('');

  return `
    <rect x="${RIGHT.x + 18}" y="${barY}" width="${barW}" height="12" rx="6" fill="${P.ink0}" stroke="${P.line}" stroke-width="1"/>
    <g clip-path="url(#barClip)">${segments}</g>
    <rect x="${RIGHT.x + 18}" y="${barY}" width="${barW}" height="12" rx="6" fill="none" stroke="${P.lineBright}" stroke-width="1"/>
    ${legend}
    <text x="${RIGHT.x + 18}" y="${RIGHT.y + RIGHT.h - 6}" font-size="10" letter-spacing="1" fill="${P.muted}">bytes aggregated across ${metrics.languageRepos || 'the largest'} repositories</text>`;
}

function panel(x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${P.ink0}" fill-opacity="0.34" stroke="${P.lineBright}" stroke-width="1"/>`;
}

export function render({ backdrop, metrics, renderedAt }) {
  const sources = metrics.sources.length ? metrics.sources.join(' · ') : 'github api';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="github telemetry">
  <defs>
    <linearGradient id="panel" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${P.ink1}"/>
      <stop offset="1" stop-color="#0a1424"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.6" stop-color="${P.accent3}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.ink0}" stop-opacity="0.66"/>
      <stop offset="0.35" stop-color="${P.ink0}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.72"/>
    </linearGradient>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14"/>
    </clipPath>
    <clipPath id="barClip">
      <rect x="${RIGHT.x + 18}" y="${RIGHT.y + 54}" width="${RIGHT.w - 36}" height="12" rx="6"/>
    </clipPath>
    ${watermarkDefs(P)}
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="url(#panel)"/>
  <g clip-path="url(#frame)">
    ${backdropSlice(backdrop)}
    <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="url(#topfade)"/>
    ${watermarkRect({ x: 12, y: 12, width: W - 24, height: H - 24 })}
    <path d="M12 ${HEADER_Y} H${W - 12}" stroke="${P.lineBright}" stroke-width="1"/>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent2}" opacity="0.22">
      <animate attributeName="y" values="12;${H - 14};12" dur="14s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g class="mono">
    <text x="40" y="37" font-size="12" letter-spacing="2" fill="${P.ice}">⟨ 01 ⟩ TELEMETRY · GITHUB API</text>
    <text x="${W - 40}" y="37" font-size="11" fill="${P.ice}" fill-opacity="0.85" text-anchor="end">rendered ${esc(isoDate(renderedAt))} · ${esc(sources)}</text>
  </g>

  ${panel(LEFT.x, LEFT.y, LEFT.w, LEFT.h)}
  <g class="mono">
    <text x="${LEFT.x + 18}" y="${LEFT.y + 30}" font-size="11" letter-spacing="3" fill="${P.accent2}">GITHUB STATS</text>
    ${statRows(metrics)}
  </g>

  ${panel(RIGHT.x, RIGHT.y, RIGHT.w, RIGHT.h)}
  <g class="mono">
    <text x="${RIGHT.x + 18}" y="${RIGHT.y + 30}" font-size="11" letter-spacing="3" fill="${P.accent2}">MOST USED LANGUAGES</text>
    ${languagePanels(metrics)}
  </g>

  <g class="mono">
    <text x="40" y="${H - 26}" font-size="10" fill="${P.muted}">data: github api · no values are cached or estimated</text>
    <text x="${W - 40}" y="${H - 26}" font-size="10" fill="${P.muted}" text-anchor="end">backdrop · aes-256-gcm at rest</text>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#edge)" stroke-width="1.2" opacity="0.72"/>
</svg>
`;
}
