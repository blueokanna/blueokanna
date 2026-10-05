/** Hanayome divider: a lace hairline carrying a ribbon bow between white roses. */

import { PALETTE as P } from '../lib/config.mjs';

const W = 1200;
const H = 56;
const CY = 28;

/** Lace scallops: a run of small arcs hugging the centre on both sides. */
function lace(direction) {
  const arcs = [];
  const count = 9;
  for (let i = 0; i < count; i += 1) {
    const x = 600 + direction * (78 + i * 22);
    arcs.push(`<path d="M${x} ${CY - 6} q11 12 22 0"/>`);
  }
  return `<g fill="none" stroke="${P.accent2}" stroke-opacity="0.32" stroke-width="1">${arcs.join('')}</g>`;
}

/** A white rose: three nested petal rings. */
function rose(x, y, scale, delay) {
  return `
    <g transform="translate(${x},${y}) scale(${scale})" opacity="0.95">
      <circle r="11" fill="${P.rose}" fill-opacity="0.14"/>
      <g fill="none" stroke="${P.rose}" stroke-width="1.2" stroke-opacity="0.85">
        <path d="M0 -10 C6 -10 10 -5 10 0 C10 6 5 10 0 10 C-6 10 -10 5 -10 0 C-10 -5 -6 -10 0 -10 Z"/>
        <path d="M0 -6 C3.5 -6 6 -3 6 0 C6 3.5 3 6 0 6 C-3.5 6 -6 3 -6 0 C-6 -3 -3.5 -6 0 -6 Z"/>
      </g>
      <circle r="2.4" fill="${P.gold}" fill-opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.45;0.9" dur="4.5s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>
      <g stroke="${P.rose}" stroke-width="1" stroke-opacity="0.5" fill="none">
        <path d="M0 12 C-2 17 -6 20 -11 22"/>
        <path d="M0 12 C2 17 6 20 11 22"/>
      </g>
    </g>`;
}

/** A four-point sparkle. */
function sparkle(x, y, size, dur, delay) {
  return `
    <path d="M${x} ${y - size} Q${x + size * 0.22} ${y - size * 0.22} ${x + size} ${y} Q${x + size * 0.22} ${y + size * 0.22} ${x} ${y + size} Q${x - size * 0.22} ${y + size * 0.22} ${x - size} ${y} Q${x - size * 0.22} ${y - size * 0.22} ${x} ${y - size} Z"
      fill="${P.accent1}" opacity="0">
      <animate attributeName="opacity" values="0;0.85;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </path>`;
}

export function render() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="section divider">
  <defs>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.line}" stop-opacity="0"/>
      <stop offset="0.2" stop-color="${P.lineBright}" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="${P.accent2}" stop-opacity="0.85"/>
      <stop offset="0.8" stop-color="${P.lineBright}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${P.line}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent1}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${P.accent1}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${P.accent1}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.5" stop-color="${P.accent3}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-140%" width="180%" height="380%">
      <feGaussianBlur stdDeviation="2.6" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <path d="M70 ${CY} H520" stroke="url(#line)" stroke-width="1.3"/>
  <path d="M680 ${CY} H1130" stroke="url(#line)" stroke-width="1.3"/>
  <path d="M70 ${CY} H520" stroke="url(#flow)" stroke-width="1.8" stroke-dasharray="150 1400" filter="url(#glow)">
    <animate attributeName="stroke-dashoffset" values="0;-1500" dur="7s" repeatCount="indefinite"/>
  </path>
  <path d="M680 ${CY} H1130" stroke="url(#flow)" stroke-width="1.8" stroke-dasharray="150 1400" filter="url(#glow)">
    <animate attributeName="stroke-dashoffset" values="-1500;0" dur="7s" repeatCount="indefinite"/>
  </path>

  ${lace(-1)}
  ${lace(1)}

  <g transform="translate(600,${CY})">
    <g>
      <animateTransform attributeName="transform" type="rotate" values="-1.5;1.5;-1.5" dur="7s" repeatCount="indefinite"/>
      <path d="M-4 5 C-16 12 -30 18 -46 22" fill="none" stroke="url(#ribbon)" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
      <path d="M4 5 C16 12 30 18 46 22" fill="none" stroke="url(#ribbon)" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
      <path d="M0 0 C-12 -14 -32 -16 -36 -3 C-39 8 -20 13 -3 4 Z" fill="url(#ribbon)" opacity="0.9"/>
      <path d="M0 0 C12 -14 32 -16 36 -3 C39 8 20 13 3 4 Z" fill="url(#ribbon)" opacity="0.9"/>
      <path d="M0 0 C-12 -14 -32 -16 -36 -3" fill="none" stroke="${P.silver}" stroke-width="0.9" stroke-opacity="0.55"/>
      <path d="M0 0 C12 -14 32 -16 36 -3" fill="none" stroke="${P.silver}" stroke-width="0.9" stroke-opacity="0.55"/>
      <ellipse rx="5" ry="4.4" fill="${P.accent1}" opacity="0.95"/>
    </g>
  </g>

  ${rose(524, CY + 1, 1, 0)}
  ${rose(676, CY + 1, 1, 1.6)}
  ${rose(478, CY + 3, 0.62, 0.8)}
  ${rose(722, CY + 3, 0.62, 2.4)}

  ${sparkle(560, CY - 14, 5, 4, 0.4)}
  ${sparkle(640, CY - 12, 4, 5, 1.5)}
  ${sparkle(600, CY - 22, 3.4, 4.5, 2.6)}
  ${sparkle(516, CY + 12, 3, 5.5, 3.2)}
  ${sparkle(684, CY + 12, 3, 5.5, 1.1)}
</svg>
`;
}
