/**
 * Section divider: a measured rule with tick marks, a hexagonal node and a
 * travelling data pulse. Instrument panel, not ornament.
 */

import { PALETTE as P } from '../lib/config.mjs';

const W = 1200;
const H = 46;
const CY = 23;

const TICKS = 28;

function ticks() {
  const marks = [];
  for (let i = 0; i <= TICKS; i += 1) {
    const x = 80 + (i * (W - 160)) / TICKS;
    if (x > 520 && x < 680) continue;
    const tall = i % 4 === 0;
    marks.push(`<path d="M${x.toFixed(1)} ${CY - (tall ? 7 : 4)} V${CY + (tall ? 7 : 4)}"/>`);
  }
  return `<g stroke="${P.lineBright}" stroke-width="1" stroke-opacity="0.75">${marks.join('')}</g>`;
}

export function render() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="section divider">
  <defs>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.line}" stop-opacity="0"/>
      <stop offset="0.16" stop-color="${P.lineBright}" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="${P.accent2}" stop-opacity="0.8"/>
      <stop offset="0.84" stop-color="${P.lineBright}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${P.line}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent1}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${P.accent1}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${P.accent1}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="node" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.55" stop-color="${P.accent2}"/>
      <stop offset="1" stop-color="${P.accent3}"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-260%" width="180%" height="620%">
      <feGaussianBlur stdDeviation="2.4" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <path d="M60 ${CY} H1140" stroke="url(#rule)" stroke-width="1.2"/>
  ${ticks()}
  <path d="M60 ${CY} H1140" stroke="url(#flow)" stroke-width="2" stroke-dasharray="150 1400" filter="url(#glow)">
    <animate attributeName="stroke-dashoffset" values="0;-1500" dur="6s" repeatCount="indefinite"/>
  </path>

  <g transform="translate(600,${CY})">
    <path d="M-28 0 L-20 -10 H20 L28 0 L20 10 H-20 Z" fill="${P.ink0}" stroke="url(#node)" stroke-width="1.4"/>
    <path d="M-20 -10 L20 10 M-20 10 L20 -10" stroke="${P.accent3}" stroke-width="0.9" stroke-opacity="0.5"/>
    <path d="M-20 0 H20" stroke="${P.accent1}" stroke-width="1" stroke-opacity="0.7"/>
    <circle r="3" fill="${P.accent1}">
      <animate attributeName="opacity" values="1;0.2;1" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <g>
      <path d="M-38 0 H-28 M28 0 H38" stroke="${P.accent2}" stroke-width="1.2" stroke-opacity="0.85"/>
      <circle cx="-38" cy="0" r="1.8" fill="${P.accent2}"/>
      <circle cx="38" cy="0" r="1.8" fill="${P.accent2}"/>
      <path d="M-38 -6 V-11 M38 -6 V-11 M-38 6 V11 M38 6 V11" stroke="${P.lineBright}" stroke-width="1"/>
    </g>
  </g>

  <g fill="${P.accent2}" opacity="0.85">
    <rect x="86" y="${CY - 14}" width="2" height="8"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.6s" repeatCount="indefinite"/></rect>
    <rect x="266" y="${CY - 14}" width="2" height="8"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.6s" begin="0.5s" repeatCount="indefinite"/></rect>
    <rect x="446" y="${CY - 14}" width="2" height="8"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.6s" begin="1s" repeatCount="indefinite"/></rect>
    <rect x="754" y="${CY - 14}" width="2" height="8"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.6s" begin="1.5s" repeatCount="indefinite"/></rect>
    <rect x="934" y="${CY - 14}" width="2" height="8"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.6s" begin="2s" repeatCount="indefinite"/></rect>
    <rect x="1114" y="${CY - 14}" width="2" height="8"><animate attributeName="opacity" values="0.2;1;0.2" dur="2.6s" begin="0.2s" repeatCount="indefinite"/></rect>
  </g>
</svg>
`;
}
