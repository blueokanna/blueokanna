/** Slim sync strip used above the metrics graph. */

import { IDENTITY, PALETTE as P } from '../lib/config.mjs';
import { esc, monoWidth } from '../lib/svg.mjs';

const W = 1200;
const H = 150;

const TITLE = '// rendering profile assets';
const CHIPS = ['banner', 'profile', 'cards'];

function chips() {
  const width = 104;
  const gap = 14;
  const total = CHIPS.length * width + (CHIPS.length - 1) * gap;
  let x = W - 40 - total;
  return CHIPS.map((label, index) => {
    const chip = `
      <rect x="${x}" y="32" width="${width}" height="24" rx="12" fill="${P.ink2}" stroke="${P.line}" stroke-width="1"/>
      <rect x="${x}" y="32" width="${width}" height="24" rx="12" fill="none" stroke="${P.accent2}" stroke-width="1.2" opacity="0.16">
        <animate attributeName="opacity" values="0.16;0.9;0.36" keyTimes="0;0.4;1" dur="5s" begin="${(index * 1.6).toFixed(1)}s" repeatCount="indefinite"/>
      </rect>
      <text x="${x + width / 2}" y="48" font-size="11" fill="${P.ice}" text-anchor="middle">${esc(label)}</text>`;
    x += width + gap;
    return chip;
  }).join('');
}

export function render({ renderedAt }) {
  const dotX = Math.round(40 + monoWidth(TITLE, 12) + 16);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="syncing github metrics">
  <defs>
    <linearGradient id="panel" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${P.ink1}"/>
      <stop offset="1" stop-color="#0a1424"/>
    </linearGradient>
    <linearGradient id="fill" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent3}"/>
      <stop offset="0.55" stop-color="${P.accent2}"/>
      <stop offset="1" stop-color="${P.accent1}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.silver}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${P.silver}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${P.silver}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.6" stop-color="${P.accent3}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.glow}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${P.glow}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14"/>
    </clipPath>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="url(#panel)"/>
  <g clip-path="url(#frame)">
    <circle cx="1120" cy="10" r="150" fill="url(#bloom)">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="7s" repeatCount="indefinite"/>
    </circle>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent2}" opacity="0.22">
      <animate attributeName="y" values="12;${H - 14};12" dur="13s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g class="mono">
    <text x="40" y="48" font-size="12" fill="${P.ice}">${esc(TITLE)}</text>
    <circle cx="${dotX}" cy="44" r="3.4" fill="${P.accent1}">
      <animate attributeName="opacity" values="1;0.15;1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    ${chips()}

    <rect x="40" y="88" width="880" height="10" rx="5" fill="${P.ink0}" stroke="${P.line}" stroke-width="1"/>
    <g stroke="${P.line}" stroke-width="1" opacity="0.6">
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${128 + i * 88} 90 V96"/>`).join('')}
    </g>
    <rect x="41" y="89" width="6" height="8" rx="4" fill="url(#fill)">
      <animate attributeName="width" values="6;878;6" dur="9s" repeatCount="indefinite"/>
    </rect>
    <rect x="41" y="89" width="120" height="8" rx="4" fill="url(#shine)" opacity="0.35">
      <animate attributeName="x" values="41;800;41" dur="9s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.35;0.35;0.1;0.35" keyTimes="0;0.85;0.95;1" dur="9s" repeatCount="indefinite"/>
    </rect>

    <g font-size="15">
      <text x="${W - 60}" y="99" fill="${P.accent3}" text-anchor="end" opacity="0">
        [ 21% ]
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.06;0.1;0.3;0.33" dur="9s" repeatCount="indefinite"/>
      </text>
      <text x="${W - 60}" y="99" fill="${P.accent1}" text-anchor="end" opacity="0">
        [ 64% ]
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.36;0.4;0.62;0.65" dur="9s" repeatCount="indefinite"/>
      </text>
      <text x="${W - 60}" y="99" fill="${P.silver}" text-anchor="end" font-weight="700" opacity="0">
        [ 100% ]
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.68;0.72;0.97;1" dur="9s" repeatCount="indefinite"/>
      </text>
    </g>

    <text x="40" y="128" font-size="11" fill="${P.faint}">pipeline: node · output: static svg · refresh: daily 00:00 UTC / 08:00 ${esc(IDENTITY.timezoneLabel.split(' ')[0])}</text>
    <text x="${W - 40}" y="128" font-size="11" fill="${P.faint}" text-anchor="end">smil · 60fps · 0 js · rendered ${esc(renderedAt)}</text>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#edge)" stroke-width="1.2" opacity="0.7"/>
</svg>
`;
}
