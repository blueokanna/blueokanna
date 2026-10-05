/**
 * Arsenal: the stack as measured-width pills plus region and timezone tiles.
 * Carries its own section label so the page needs no markdown heading between
 * cards — that is what keeps the backdrop unbroken.
 */

import { IDENTITY, PALETTE as P, STACK } from '../lib/config.mjs';
import { esc, monoWidth, backdropSlice, watermarkDefs, watermarkRect } from '../lib/svg.mjs';

const W = 1200;
const H = 220;
const HEADER_Y = 52;

const PILL = { height: 28, pad: 14, gap: 12, rows: [70, 110] };
const TILE = { width: 250, height: 46, gap: 22, y: 152 };

const TILES = [
  ['STACK', `${STACK.length} tools`],
  ['REGION', IDENTITY.region],
  ['TIMEZONE', IDENTITY.timezoneLabel],
];

function pills() {
  const half = Math.ceil(STACK.length / 2);
  const rows = [STACK.slice(0, half), STACK.slice(half)];
  let index = 0;

  return rows.map((row, rowIndex) => {
    const widths = row.map((label) => Math.round(monoWidth(label, 12) + PILL.pad * 2));
    const total = widths.reduce((sum, width) => sum + width, 0) + PILL.gap * (row.length - 1);
    let x = Math.round((W - total) / 2);
    const y = PILL.rows[rowIndex];

    return row.map((label, i) => {
      const width = widths[i];
      const delay = (index += 1) * 0.32;
      const pill = `
      <rect x="${x}" y="${y}" width="${width}" height="${PILL.height}" rx="14" fill="${P.ink0}" fill-opacity="0.4" stroke="${P.lineBright}" stroke-width="1"/>
      <rect x="${x}" y="${y}" width="${width}" height="${PILL.height}" rx="14" fill="none" stroke="${P.accent2}" stroke-width="1.2" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.8;0.3" keyTimes="0;0.35;1" dur="5s" begin="${delay.toFixed(2)}s" repeatCount="indefinite"/>
      </rect>
      <text x="${x + width / 2}" y="${y + 19}" font-size="12" fill="${P.silver}" text-anchor="middle">${esc(label)}</text>`;
      x += width + PILL.gap;
      return pill;
    }).join('');
  }).join('');
}

function tiles() {
  const total = TILES.length * TILE.width + (TILES.length - 1) * TILE.gap;
  let x = Math.round((W - total) / 2);
  return TILES.map(([label, value]) => {
    const tile = `
      <rect x="${x}" y="${TILE.y}" width="${TILE.width}" height="${TILE.height}" rx="9" fill="${P.ink0}" fill-opacity="0.4" stroke="${P.lineBright}" stroke-width="1"/>
      <text x="${x + 14}" y="${TILE.y + 21}" font-size="14" letter-spacing="0.5" fill="${P.silver}">${esc(value)}</text>
      <text x="${x + TILE.width - 14}" y="${TILE.y + 21}" font-size="10" letter-spacing="2" fill="${P.ice}" text-anchor="end">${esc(label)}</text>`;
    x += TILE.width + TILE.gap;
    return tile;
  }).join('');
}

export function render({ backdrop, renderedAt }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="arsenal">
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
    <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent1}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${P.accent1}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${P.accent1}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.ink0}" stop-opacity="0.52"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.62"/>
    </linearGradient>
    <filter id="soft5" x="-6%" y="-30%" width="112%" height="160%">
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14"/>
    </clipPath>
    ${watermarkDefs(P)}
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="url(#panel)"/>
  <g clip-path="url(#frame)">
    <g filter="url(#soft5)">${backdropSlice(backdrop)}</g>
    <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="url(#shade)"/>
    ${watermarkRect({ x: 12, y: 12, width: W - 24, height: H - 24 })}
    <path d="M12 ${HEADER_Y} H${W - 12}" stroke="${P.lineBright}" stroke-width="1"/>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent2}" opacity="0.22">
      <animate attributeName="y" values="12;${H - 14};12" dur="13s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g class="mono">
    <text x="40" y="37" font-size="12" letter-spacing="2" fill="${P.ice}">⟨ 02 ⟩ ARSENAL · 技术栈</text>
    <text x="${W - 40}" y="37" font-size="11" fill="${P.ice}" fill-opacity="0.85" text-anchor="end">tools: ${STACK.length} · region: ${esc(IDENTITY.region)} · ${esc(IDENTITY.timezoneLabel)} · ${esc(renderedAt)}</text>
    ${pills()}
    ${tiles()}
    <path d="M40 ${H - 20} H${W - 40}" stroke="${P.lineBright}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M40 ${H - 20} H${W - 40}" stroke="url(#flow)" stroke-width="2" stroke-linecap="round" stroke-dasharray="160 1400">
      <animate attributeName="stroke-dashoffset" values="0;-1600" dur="6s" repeatCount="indefinite"/>
    </path>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#edge)" stroke-width="1.2" opacity="0.72"/>
</svg>
`;
}
