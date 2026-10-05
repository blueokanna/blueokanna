/**
 * Hero banner: the artwork as a full-bleed backdrop behind an instrumentation
 * layer — tick rulers, a reticle, a signal readout, drifting data motes and a
 * slow ken-burns push. Nothing decorative that is not also technical.
 */

import { IDENTITY, PALETTE as P } from '../lib/config.mjs';
import { esc, isoDate, monoWidth } from '../lib/svg.mjs';

const W = 1200;
const H = 640;
const SCRIM_Y = 470;

/** Drifting motes: small squares falling with a lazy horizontal sway. */
const MOTES = [
  { x: 1042, start: -40, dur: 15, bob: 8, sway: 18, size: 3, op: 0.5 },
  { x: 918, start: -150, dur: 19, bob: 10, sway: -22, size: 2.5, op: 0.42 },
  { x: 1168, start: -90, dur: 22, bob: 9, sway: 20, size: 3.5, op: 0.36 },
  { x: 812, start: -240, dur: 25, bob: 11, sway: -16, size: 2, op: 0.3 },
  { x: 1086, start: 40, dur: 17, bob: 7, sway: 14, size: 2.5, op: 0.28 },
  { x: 880, start: 130, dur: 27, bob: 12, sway: -24, size: 3, op: 0.24 },
];

function motes() {
  return MOTES.map((m) => `
      <g><animateTransform attributeName="transform" type="translate" values="0 ${m.start};0 ${H + 20}" dur="${m.dur}s" repeatCount="indefinite"/>
        <g><animateTransform attributeName="transform" type="translate" values="0 0;${m.sway} 0;0 0;-${m.sway} 0;0 0" dur="${m.bob}s" repeatCount="indefinite"/>
          <rect x="${m.x}" y="0" width="${m.size}" height="${m.size}" fill="${P.accent1}" opacity="${m.op}"/></g></g>`).join('');
}

/** Vertical streaks: short telemetry trails, staggered down the right edge. */
const STREAKS = [
  { x: 1136, start: -60, dur: 6, len: 46, op: 0.3 },
  { x: 1002, start: -220, dur: 7.5, len: 34, op: 0.24 },
  { x: 946, start: -420, dur: 9, len: 52, op: 0.2 },
];

function streaks() {
  return STREAKS.map((s) => `
      <rect x="${s.x}" y="0" width="1.4" height="${s.len}" fill="${P.accent1}" opacity="${s.op}">
        <animateTransform attributeName="transform" type="translate" values="0 ${s.start};0 ${H + 60}" dur="${s.dur}s" repeatCount="indefinite"/>
      </rect>`).join('');
}

/** Top and left tick rulers; the pitch is 40 px on both axes. */
function rulers() {
  const top = [];
  for (let x = 40; x <= W - 40; x += 40) {
    const tall = (x / 40) % 5 === 0;
    top.push(`<path d="M${x} 14 V${tall ? 24 : 19}"/>`);
  }
  const left = [];
  for (let y = 40; y <= H - 40; y += 40) {
    const tall = (y / 40) % 5 === 0;
    left.push(`<path d="M14 ${y} H${tall ? 24 : 19}"/>`);
  }
  return `<g stroke="${P.accent2}" stroke-width="1" stroke-opacity="0.45">${top.join('')}${left.join('')}</g>`;
}

/** Signal readout: an animated equaliser that stays inside the HUD frame. */
function equaliser() {
  return Array.from({ length: 7 }, (_, i) => {
    const x = 1046 + i * 12;
    const peak = 8 + ((i * 5) % 14);
    return `<rect x="${x}" y="${364 - peak}" width="5" height="${peak}" rx="1.5" fill="${i > 4 ? P.accent1 : P.accent2}" opacity="0.85">
      <animate attributeName="height" values="${peak};${peak * 0.45};${peak * 1.3};${peak}" dur="${(1.6 + i * 0.17).toFixed(2)}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="${364 - peak};${364 - peak * 0.45};${364 - peak * 1.3};${364 - peak}" dur="${(1.6 + i * 0.17).toFixed(2)}s" repeatCount="indefinite"/>
    </rect>`;
  }).join('');
}

export function render({ hero, renderedAt }) {
  const editionBox = Math.round(monoWidth(IDENTITY.edition, 11, 2) + 26);
  const specText = `${W} × ${H} · SVG`;
  const specBox = Math.round(monoWidth(specText, 11, 1) + 26);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(IDENTITY.name)} — banner">
  <defs>
    <linearGradient id="grade" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#0a1c31" stop-opacity="0.38"/>
      <stop offset="0.45" stop-color="#0a1626" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.44" r="0.78">
      <stop offset="0.42" stop-color="${P.ink0}" stop-opacity="0"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.62"/>
    </radialGradient>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.ink1}" stop-opacity="0"/>
      <stop offset="0.4" stop-color="${P.ink0}" stop-opacity="0.74"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.97"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.5" stop-color="${P.accent3}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.62" stop-color="${P.accent1}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.silver}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${P.silver}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${P.silver}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.glow}" stop-opacity="0.24"/>
      <stop offset="1" stop-color="${P.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="${P.silver}" fill-opacity="0.04"/>
    </pattern>
    <filter id="glow" x="-40%" y="-60%" width="180%" height="220%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="16"/>
    </clipPath>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="16" fill="${P.ink1}"/>
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

    ${motes()}
    ${streaks()}

    <rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="url(#scan)"/>

    ${rulers()}

    <g transform="translate(1010,196)" fill="none" stroke="${P.accent1}" stroke-opacity="0.5">
      <circle r="54" stroke-width="1"/>
      <circle r="34" stroke-width="0.8" stroke-dasharray="4 8">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="24s" repeatCount="indefinite"/>
      </circle>
      <path d="M-70 0 H-40 M40 0 H70 M0 -70 V-40 M0 40 V70" stroke-width="1"/>
      <circle r="2.4" fill="${P.accent2}" stroke="none"/>
    </g>
    ${equaliser()}

    <rect x="12" y="${SCRIM_Y}" width="${W - 24}" height="${H - SCRIM_Y - 12}" fill="url(#scrim)"/>
    <path d="M12 ${SCRIM_Y} H${W - 12}" stroke="${P.accent2}" stroke-opacity="0.45" stroke-width="1"/>
    <path d="M12 ${SCRIM_Y} H400" stroke="${P.accent1}" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="2 6"/>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent1}" opacity="0.22">
      <animate attributeName="y" values="12;${H - 14};12" dur="15s" repeatCount="indefinite"/>
    </rect>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="16" fill="none" stroke="url(#edge)" stroke-width="1.4" opacity="0.85"/>

  <g class="mono">
    <rect x="34" y="34" width="${editionBox}" height="24" rx="6" fill="${P.ink0}" fill-opacity="0.76" stroke="${P.accent2}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="${34 + editionBox / 2}" y="50" font-size="11" letter-spacing="2" fill="${P.accent1}" text-anchor="middle">${esc(IDENTITY.edition)}</text>
    <rect x="${W - 34 - specBox}" y="34" width="${specBox}" height="24" rx="6" fill="${P.ink0}" fill-opacity="0.76" stroke="${P.lineBright}" stroke-width="1"/>
    <text x="${W - 34 - specBox / 2}" y="50" font-size="11" letter-spacing="1" fill="${P.ice}" text-anchor="middle">${esc(specText)}</text>

    <text x="60" y="${SCRIM_Y + 88}" font-size="42" font-weight="700" letter-spacing="3" fill="${P.accent2}" fill-opacity="0.5" filter="url(#glow)">${esc(IDENTITY.name)}</text>
    <text x="60" y="${SCRIM_Y + 88}" font-size="42" font-weight="700" letter-spacing="3" fill="url(#name)">${esc(IDENTITY.name)}</text>
    <path d="M62 ${SCRIM_Y + 104} H${Math.round(62 + monoWidth(IDENTITY.name, 42, 3))}" stroke="${P.accent2}" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round"/>

    <text x="62" y="${SCRIM_Y + 132}" font-size="14" fill="${P.ice}">${esc(IDENTITY.tagline)}</text>

    <g text-anchor="end">
      <text x="${W - 60}" y="${SCRIM_Y + 86}" font-size="13" letter-spacing="1" fill="${P.accent2}">${esc(IDENTITY.region)} · ${esc(IDENTITY.timezoneLabel)}</text>
      <text x="${W - 60}" y="${SCRIM_Y + 110}" font-size="12" fill="${P.muted}">rendered ${esc(isoDate(renderedAt))}</text>
    </g>
    <text x="62" y="${SCRIM_Y + 152}" font-size="11" letter-spacing="1" fill="${P.faint}">backdrop art · ${esc(IDENTITY.heroCipher)} at rest · all rights reserved</text>
  </g>

  <g stroke="url(#edge)" stroke-width="2" fill="none" opacity="0.85">
    <path d="M20 116 V28 Q20 24 24 24 H92"/>
    <path d="M${W - 20} 116 V28 Q${W - 20} 24 ${W - 24} 24 H${W - 92}"/>
  </g>
</svg>
`;
}
