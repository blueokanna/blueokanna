/**
 * Hero banner: the artwork full bleed, a slow ken-burns push, drifting petals
 * and an information scrim carrying identity, region and the render date.
 */

import { IDENTITY, PALETTE as P } from '../lib/config.mjs';
import { esc, isoDate, monoWidth } from '../lib/svg.mjs';

const W = 1200;
const H = 640;
const SCRIM_Y = 470;

const PETALS = [
  { x: 1046, start: -40, dur: 15, bob: 8, sway: 20, rot: 22, scale: 1.0, op: 0.42, fill: P.accent1 },
  { x: 912, start: -140, dur: 18, bob: 10, sway: -26, rot: -14, scale: 0.85, op: 0.36, fill: P.accent2 },
  { x: 1168, start: -80, dur: 21, bob: 9, sway: 24, rot: 38, scale: 0.9, op: 0.3, fill: P.silver },
  { x: 808, start: -220, dur: 24, bob: 11, sway: -20, rot: -30, scale: 0.7, op: 0.26, fill: P.accent2 },
  { x: 1084, start: 60, dur: 17, bob: 7, sway: 16, rot: 12, scale: 0.75, op: 0.24, fill: P.accent1 },
  { x: 884, start: 120, dur: 26, bob: 12, sway: -30, rot: 46, scale: 0.65, op: 0.2, fill: P.accent3 },
];

function petals() {
  return PETALS.map((p) => `
      <g><animateTransform attributeName="transform" type="translate" values="0 ${p.start};0 ${H + 20}" dur="${p.dur}s" repeatCount="indefinite"/>
        <g><animateTransform attributeName="transform" type="translate" values="0 0;${p.sway} 0;0 0;-${p.sway} 0;0 0" dur="${p.bob}s" repeatCount="indefinite"/>
          <g transform="translate(${p.x},0) rotate(${p.rot}) scale(${p.scale})" opacity="${p.op}"><use xlink:href="#petal" href="#petal" fill="${p.fill}"/></g></g></g>`).join('');
}

export function render({ hero, renderedAt }) {
  const edition = IDENTITY.edition;
  const editionBox = Math.round(monoWidth(edition, 11, 2) + 26);
  const artBox = 122;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(IDENTITY.name)} — ${esc(edition)}">
  <defs>
    <linearGradient id="grade" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#0a1c31" stop-opacity="0.38"/>
      <stop offset="0.45" stop-color="#0a1626" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#070f1c" stop-opacity="0.5"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.44" r="0.78">
      <stop offset="0.42" stop-color="${P.ink0}" stop-opacity="0"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.6"/>
    </radialGradient>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.ink1}" stop-opacity="0"/>
      <stop offset="0.4" stop-color="${P.ink0}" stop-opacity="0.72"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.97"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.5" stop-color="${P.accent3}"/>
      <stop offset="1" stop-color="${P.accent1}"/>
    </linearGradient>
    <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.62" stop-color="${P.accent1}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.silver}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${P.silver}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${P.silver}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.glow}" stop-opacity="0.26"/>
      <stop offset="1" stop-color="${P.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="${P.silver}" fill-opacity="0.045"/>
    </pattern>
    <filter id="glow" x="-40%" y="-60%" width="180%" height="220%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="18"/>
    </clipPath>
    <g id="petal">
      <path d="M0 0 C5 -3 9 -10 6 -16 C3 -22 -4 -21 -7 -15 C-10 -8 -5 -2 0 0 Z"/>
    </g>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="18" fill="${P.ink1}"/>
  <g clip-path="url(#frame)">
    <g transform="translate(${W / 2},${H / 2})">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1;1.045;1" dur="26s" repeatCount="indefinite"/>
        <image x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" xlink:href="${hero}"/>
      </g>
    </g>

    <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="url(#grade)"/>
    <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="url(#vignette)"/>

    <ellipse cx="290" cy="110" rx="290" ry="180" fill="url(#bloom)">
      <animate attributeName="opacity" values="0.5;0.9;0.5" dur="11s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="1010" cy="150" rx="250" ry="170" fill="url(#bloom)" opacity="0.6">
      <animate attributeName="opacity" values="0.85;0.45;0.85" dur="13s" repeatCount="indefinite"/>
    </ellipse>

    <g transform="skewX(-16)">
      <rect x="-360" y="0" width="230" height="${H}" fill="url(#sweep)">
        <animateTransform attributeName="transform" type="translate" values="0 0;1560 0" dur="9.5s" repeatCount="indefinite"/>
      </rect>
    </g>

    <g opacity="0.85">${petals()}
    </g>

    <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="url(#scan)"/>

    <rect x="12" y="${SCRIM_Y}" width="${W - 24}" height="${H - SCRIM_Y - 12}" fill="url(#scrim)"/>
    <path d="M12 ${SCRIM_Y} H${W - 12}" stroke="${P.accent2}" stroke-opacity="0.45" stroke-width="1"/>
    <path d="M12 ${SCRIM_Y} H400" stroke="${P.accent1}" stroke-opacity="0.55" stroke-width="1" stroke-dasharray="2 6"/>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent1}" opacity="0.26">
      <animate attributeName="y" values="12;${H - 14};12" dur="15s" repeatCount="indefinite"/>
    </rect>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="18" fill="none" stroke="url(#edge)" stroke-width="1.5" opacity="0.9"/>

  <g class="mono">
    <rect x="34" y="34" width="${editionBox}" height="24" rx="6" fill="${P.ink0}" fill-opacity="0.74" stroke="${P.accent2}" stroke-opacity="0.38" stroke-width="1"/>
    <text x="${34 + editionBox / 2}" y="50" font-size="11" letter-spacing="2" fill="${P.accent1}" text-anchor="middle">${esc(edition)}</text>
    <rect x="${W - 34 - artBox}" y="34" width="${artBox}" height="24" rx="6" fill="${P.ink0}" fill-opacity="0.74" stroke="${P.line}" stroke-width="1"/>
    <text x="${W - 34 - artBox / 2}" y="50" font-size="11" letter-spacing="1.5" fill="${P.muted}" text-anchor="middle">ORIGINAL ART</text>

    <text x="60" y="${SCRIM_Y + 88}" font-size="42" font-weight="700" letter-spacing="3" fill="${P.accent2}" fill-opacity="0.5" filter="url(#glow)">${esc(IDENTITY.name)}</text>
    <text x="60" y="${SCRIM_Y + 88}" font-size="42" font-weight="700" letter-spacing="3" fill="url(#name)">${esc(IDENTITY.name)}</text>
    <path d="M62 ${SCRIM_Y + 104} H${Math.round(62 + monoWidth(IDENTITY.name, 42, 3))}" stroke="${P.accent2}" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round"/>

    <text x="62" y="${SCRIM_Y + 132}" font-size="14" fill="${P.ice}">${esc(IDENTITY.tagline)}</text>

    <g text-anchor="end">
      <text x="${W - 60}" y="${SCRIM_Y + 86}" font-size="13" letter-spacing="1" fill="${P.accent2}">${esc(IDENTITY.region)} · ${esc(IDENTITY.timezoneLabel)}</text>
      <text x="${W - 60}" y="${SCRIM_Y + 110}" font-size="12" fill="${P.muted}">rendered ${esc(isoDate(renderedAt))}</text>
    </g>
    <text x="62" y="${SCRIM_Y + 152}" font-size="11" letter-spacing="1" fill="${P.faint}">© ${esc(IDENTITY.login)} · artwork ${esc(IDENTITY.artworkCipher)} at rest · all rights reserved</text>
  </g>

  <g stroke="url(#edge)" stroke-width="2" fill="none" opacity="0.85">
    <path d="M22 120 V32 Q22 28 26 28 H96"/>
    <path d="M${W - 22} 120 V32 Q${W - 22} 28 ${W - 26} 28 H${W - 96}"/>
  </g>
</svg>
`;
}
