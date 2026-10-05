/**
 * Footer: the last slice of the page backdrop, closing over catalogue waves and
 * the sign-off line.
 */

import { IDENTITY, PALETTE as P } from '../lib/config.mjs';
import { esc, backdropSlice, watermarkDefs, watermarkRect } from '../lib/svg.mjs';

const W = 1200;
const H = 145;

function wave(yBase, amplitude, width, duration, opacity, strokeWidth) {
  const step = 150;
  let path = `M0 ${yBase}`;
  for (let x = 0; x <= 2400; x += step) {
    path += ` Q${x + step / 2} ${yBase - amplitude} ${x + step} ${yBase}`;
  }
  return `<g fill="none" stroke="url(#wave)" stroke-width="${strokeWidth}" opacity="${opacity}">
      <path d="${path}">
        <animateTransform attributeName="transform" type="translate" values="0 0;-${width} 0" dur="${duration}s" repeatCount="indefinite"/>
      </path>
    </g>`;
}

export function render({ backdrop, renderedAt }) {
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
      <stop offset="0.5" stop-color="${P.accent2}" stop-opacity="0.7"/>
      <stop offset="1" stop-color="${P.line}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.55" stop-color="${P.accent1}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.ink0}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.66"/>
    </linearGradient>
    <filter id="soft5" x="-6%" y="-40%" width="112%" height="180%">
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
    ${watermarkRect({ x: 12, y: 12, width: W - 24, height: H - 24, opacity: 0.5 })}
    ${wave(112, 12, 600, 17, 0.45, 1.2)}
    ${wave(126, 12, 600, 12, 0.7, 1.6)}
    ${wave(138, 10, 600, 9, 0.85, 2)}
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent2}" opacity="0.25">
      <animate attributeName="y" values="12;${H - 14};12" dur="11s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g class="mono">
    <text x="40" y="37" font-size="11" letter-spacing="3" fill="${P.ice}">⟨ 03 ⟩ SUPPORT · 支持</text>
    <text x="88" y="37" font-size="11" fill="${P.muted}">// end of transmission</text>
    <text x="${W - 40}" y="37" font-size="11" fill="${P.ice}" text-anchor="end">EOF · ${esc(renderedAt)}</text>
    <rect x="${W - 30}" y="27" width="7" height="12" fill="${P.accent1}">
      <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g class="mono" text-anchor="middle">
    <text x="${W / 2}" y="66" font-size="18" font-weight="700" letter-spacing="2" fill="url(#title)">© ${esc(IDENTITY.year)} ${esc(IDENTITY.name)}</text>
    <text x="${W / 2}" y="88" font-size="12" letter-spacing="1" fill="${P.ice}">${esc(IDENTITY.tagline)}</text>
    <text x="${W / 2}" y="108" font-size="11" letter-spacing="3" fill="${P.accent1}" fill-opacity="0.9">${esc(IDENTITY.edition)} · ${esc(IDENTITY.year)}</text>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#edge)" stroke-width="1.2" opacity="0.72"/>
</svg>
`;
}
