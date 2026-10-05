/** Footer: the page canvas closes here, over catalogue waves and the sign-off. */

import { IDENTITY, PALETTE as P } from '../lib/config.mjs';
import { esc, watermarkDefs, watermarkRect } from '../lib/svg.mjs';

const W = 1200;
const H = 160;

function wave(yBase, amplitude, width, duration, opacity, strokeWidth) {
  const segments = [];
  const step = 150;
  let path = `M0 ${yBase}`;
  for (let x = 0; x <= 2400; x += step) {
    path += ` Q${x + step / 2} ${yBase - amplitude} ${x + step} ${yBase}`;
  }
  segments.push(`<g fill="none" stroke="url(#wave)" stroke-width="${strokeWidth}" opacity="${opacity}">
      <path d="${path}">
        <animateTransform attributeName="transform" type="translate" values="0 0;-${width} 0" dur="${duration}s" repeatCount="indefinite"/>
      </path>
    </g>`);
  return segments.join('');
}

export function render({ canvas, renderedAt }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="footer">
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
    <linearGradient id="wave" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.line}" stop-opacity="0.2"/>
      <stop offset="0.5" stop-color="${P.accent2}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${P.line}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.55" stop-color="${P.accent1}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.glow}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${P.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M30 0 H0 V30" fill="none" stroke="${P.line}" stroke-width="1" stroke-opacity="0.36"/>
    </pattern>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14"/>
    </clipPath>
    <filter id="soft" x="-10%" y="-40%" width="120%" height="180%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    ${watermarkDefs(P)}
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="url(#panel)"/>
  <g clip-path="url(#frame)">
    <g filter="url(#soft)">${canvas.slice}</g>
    <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="${P.ink0}" fill-opacity="0.58"/>
    ${watermarkRect({ x: 12, y: 12, width: W - 24, height: H - 24, opacity: 0.5 })}
    <rect x="-30" y="-30" width="${W + 60}" height="${H + 60}" fill="url(#grid)" opacity="0.26">
      <animateTransform attributeName="transform" type="translate" values="0 0;30 0" dur="12s" repeatCount="indefinite"/>
    </rect>
    <circle cx="600" cy="150" r="230" fill="url(#bloom)">
      <animate attributeName="opacity" values="0.65;1;0.65" dur="9s" repeatCount="indefinite"/>
    </circle>
    ${wave(126, 16, 600, 17, 0.5, 1.3)}
    ${wave(142, 16, 600, 12, 0.8, 1.7)}
    ${wave(154, 14, 600, 9, 0.9, 2.2)}
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent2}" opacity="0.25">
      <animate attributeName="y" values="12;${H - 14};12" dur="11s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g class="mono" text-anchor="middle">
    <text x="${W / 2}" y="58" font-size="18" font-weight="700" letter-spacing="2" fill="url(#title)">© ${esc(IDENTITY.year)} ${esc(IDENTITY.name)}</text>
    <text x="${W / 2}" y="82" font-size="12" letter-spacing="1" fill="${P.ice}">${esc(IDENTITY.tagline)}</text>
    <text x="${W / 2}" y="103" font-size="11" letter-spacing="3" fill="${P.accent1}" fill-opacity="0.9">${esc(IDENTITY.edition)} · ${esc(IDENTITY.year)}</text>
  </g>

  <g class="mono" font-size="11">
    <text x="88" y="38" fill="${P.muted}">// end of transmission</text>
    <text x="${W - 142}" y="38" fill="${P.muted}">EOF · ${esc(renderedAt)}</text>
    <rect x="${W - 106}" y="28" width="7" height="12" fill="${P.accent1}">
      <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
    </rect>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#edge)" stroke-width="1.2" opacity="0.7"/>
</svg>
`;
}
