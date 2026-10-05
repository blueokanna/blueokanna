/** Arsenal: the stack as measured-width pills plus region and timezone tiles. */

import { IDENTITY, PALETTE as P, STACK } from '../lib/config.mjs';
import { esc, monoWidth } from '../lib/svg.mjs';

const W = 1200;
const H = 290;
const HEADER_Y = 56;

const PILL = { height: 30, pad: 15, gap: 12, rows: [78, 122] };
const TILE = { width: 250, height: 56, gap: 22, y: 176 };

const TILES = [
  ['STACK', `${STACK.length} tools`, P.accent1],
  ['REGION', IDENTITY.region, P.accent2],
  ['TIMEZONE', IDENTITY.timezoneLabel, P.accent3],
];

function splitRows(items) {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}

function pills() {
  const rowSource = splitRows(STACK);
  let index = 0;

  return rowSource.map((row, rowIndex) => {
    const widths = row.map((label) => Math.round(monoWidth(label, 13) + PILL.pad * 2));
    const total = widths.reduce((sum, w) => sum + w, 0) + PILL.gap * (row.length - 1);
    let x = Math.round((W - total) / 2);
    const y = PILL.rows[rowIndex];

    return row.map((label, i) => {
      const w = widths[i];
      const delay = (index += 1) * 0.35;
      const pill = `
      <rect x="${x}" y="${y}" width="${w}" height="${PILL.height}" rx="15" fill="${P.ink2}" stroke="${P.line}" stroke-width="1"/>
      <rect x="${x}" y="${y}" width="${w}" height="${PILL.height}" rx="15" fill="none" stroke="${P.accent2}" stroke-width="1.2" opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.85;0.35" keyTimes="0;0.35;1" dur="5.2s" begin="${delay.toFixed(2)}s" repeatCount="indefinite"/>
      </rect>
      <text x="${x + w / 2}" y="${y + 20}" font-size="13" fill="${P.silver}" text-anchor="middle">${esc(label)}</text>`;
      x += w + PILL.gap;
      return pill;
    }).join('');
  }).join('');
}

function tiles() {
  const total = TILES.length * TILE.width + (TILES.length - 1) * TILE.gap;
  let x = Math.round((W - total) / 2);
  return TILES.map(([label, value, color]) => {
    const tile = `
      <rect x="${x}" y="${TILE.y}" width="${TILE.width}" height="${TILE.height}" rx="10" fill="${P.ink2}" stroke="${P.line}" stroke-width="1"/>
      <text x="${x + TILE.width / 2}" y="${TILE.y + 26}" font-size="17" letter-spacing="1" fill="${color}" text-anchor="middle">${esc(value)}</text>
      <text x="${x + TILE.width / 2}" y="${TILE.y + 44}" font-size="10" letter-spacing="2" fill="${P.faint}" text-anchor="middle">${esc(label)}</text>`;
    x += TILE.width + TILE.gap;
    return tile;
  }).join('');
}

export function render({ backdrop }) {
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
    <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.glow}" stop-opacity="0.2"/>
      <stop offset="1" stop-color="${P.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0 H0 V34" fill="none" stroke="${P.line}" stroke-width="1" stroke-opacity="0.4"/>
    </pattern>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14"/>
    </clipPath>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="url(#panel)"/>
  <g clip-path="url(#frame)">
    ${backdrop ? `<image x="12" y="12" width="${W - 24}" height="${H - 24}" preserveAspectRatio="xMidYMid slice" opacity="0.18" xlink:href="${backdrop}"/>` : ''}
    <rect x="-34" y="-34" width="${W + 68}" height="${H + 68}" fill="url(#grid)" opacity="0.3">
      <animateTransform attributeName="transform" type="translate" values="0 0;34 34" dur="16s" repeatCount="indefinite"/>
    </rect>
    <circle cx="1080" cy="30" r="170" fill="url(#bloom)">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="9s" repeatCount="indefinite"/>
    </circle>
    <path d="M12 ${HEADER_Y} H${W - 12}" stroke="${P.line}" stroke-width="1"/>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent2}" opacity="0.22">
      <animate attributeName="y" values="12;${H - 14};12" dur="15s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g class="mono">
    <text x="40" y="40" font-size="12" letter-spacing="2" fill="${P.muted}">ARSENAL · 技术栈</text>
    <text x="${W - 40}" y="40" font-size="11" fill="${P.faint}" text-anchor="end">tools: ${STACK.length} · region: ${esc(IDENTITY.region)} · ${esc(IDENTITY.timezoneLabel)}</text>
    ${pills()}
    ${tiles()}
    <path d="M40 256 H1160" stroke="${P.line}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M40 256 H1160" stroke="url(#flow)" stroke-width="2" stroke-linecap="round" stroke-dasharray="160 1400">
      <animate attributeName="stroke-dashoffset" values="0;-1600" dur="6s" repeatCount="indefinite"/>
    </path>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#edge)" stroke-width="1.2" opacity="0.7"/>
</svg>
`;
}
