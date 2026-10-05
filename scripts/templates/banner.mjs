/**
 * Hero banner.
 *
 * Two regions, one card:
 *
 *   top     the artwork full bleed with an instrumentation layer — tick
 *           rulers, a reticle, an animated signal equaliser, drifting data
 *           motes, telemetry streaks and a slow ken-burns push. The crop keeps
 *           the moon, the cathedral spires and both figures.
 *   bottom  the profile strip: account avatar in a rotating ring, identity
 *           lines, live statistics, technical badge glyphs and a readout
 *           panel. Statistics come from the API — a value that was not
 *           returned is omitted rather than printed as zero.
 */

import { CANVAS, IDENTITY, PALETTE as P, STACK } from '../lib/config.mjs';
import { esc, isoDate, monoWidth } from '../lib/svg.mjs';

const W = 1200;
const H = 1005;
const INSET = 12;
const ART_H = 1005;
const STRIP_Y = 713;
const BOTTOM = H - 10;

/** Strip geometry, derived from one anchor so the three columns stay aligned. */
const NAME_Y = STRIP_Y + 86;
const HANDLE_Y = STRIP_Y + 114;
const TAGLINE_Y = STRIP_Y + 142;
const CHIP_Y = STRIP_Y + 166;
const BADGE_Y = STRIP_Y + 206;
const READOUT_Y = STRIP_Y + 40;

const AVATAR = { cx: 112, cy: STRIP_Y + 150, r: 62 };

/** Drifting motes: small squares falling with a lazy horizontal sway. */
const MOTES = [
  { x: 1042, start: -40, dur: 15, bob: 8, sway: 18, size: 3, op: 0.5 },
  { x: 918, start: -150, dur: 19, bob: 10, sway: -22, size: 2.5, op: 0.42 },
  { x: 1168, start: -90, dur: 22, bob: 9, sway: 20, size: 3.5, op: 0.36 },
  { x: 812, start: -240, dur: 25, bob: 11, sway: -16, size: 2, op: 0.3 },
  { x: 296, start: -180, dur: 21, bob: 9, sway: 16, size: 2.5, op: 0.28 },
  { x: 880, start: 130, dur: 27, bob: 12, sway: -24, size: 3, op: 0.24 },
];

/** Vertical telemetry streaks, staggered across the right half. */
const STREAKS = [
  { x: 1136, start: -60, dur: 6, len: 46, op: 0.3 },
  { x: 1002, start: -220, dur: 7.5, len: 34, op: 0.24 },
  { x: 862, start: -420, dur: 9, len: 52, op: 0.2 },
];

function motes() {
  return MOTES.map((m) => `
      <g><animateTransform attributeName="transform" type="translate" values="0 ${m.start};0 ${STRIP_Y + 40}" dur="${m.dur}s" repeatCount="indefinite"/>
        <g><animateTransform attributeName="transform" type="translate" values="0 0;${m.sway} 0;0 0;-${m.sway} 0;0 0" dur="${m.bob}s" repeatCount="indefinite"/>
          <rect x="${m.x}" y="0" width="${m.size}" height="${m.size}" fill="${P.accent1}" opacity="${m.op}"/></g></g>`).join('');
}

function streaks() {
  return STREAKS.map((s) => `
      <rect x="${s.x}" y="0" width="1.4" height="${s.len}" fill="${P.accent1}" opacity="${s.op}">
        <animateTransform attributeName="transform" type="translate" values="0 ${s.start};0 ${STRIP_Y + 60}" dur="${s.dur}s" repeatCount="indefinite"/>
      </rect>`).join('');
}

/** Tick rulers along the top and left edges; pitch is 40 px on both axes. */
function rulers() {
  const top = [];
  for (let x = 40; x <= W - 40; x += 40) {
    const tall = (x / 40) % 5 === 0;
    top.push(`<path d="M${x} 14 V${tall ? 24 : 19}"/>`);
  }
  const left = [];
  for (let y = 40; y <= STRIP_Y - 40; y += 40) {
    const tall = (y / 40) % 5 === 0;
    left.push(`<path d="M14 ${y} H${tall ? 24 : 19}"/>`);
  }
  return `<g stroke="${P.accent2}" stroke-width="1" stroke-opacity="0.45">${top.join('')}${left.join('')}</g>`;
}

/** Animated signal equaliser sitting just above the strip. */
function equaliser() {
  const base = STRIP_Y - 62;
  return Array.from({ length: 7 }, (_, i) => {
    const x = 1046 + i * 12;
    const peak = 8 + ((i * 5) % 14);
    const duration = (1.6 + i * 0.17).toFixed(2);
    return `<rect x="${x}" y="${base - peak}" width="5" height="${peak}" rx="1.5" fill="${i > 4 ? P.accent1 : P.accent2}" opacity="0.85">
      <animate attributeName="height" values="${peak};${peak * 0.45};${peak * 1.3};${peak}" dur="${duration}s" repeatCount="indefinite"/>
      <animate attributeName="y" values="${base - peak};${base - peak * 0.45};${base - peak * 1.3};${base - peak}" dur="${duration}s" repeatCount="indefinite"/>
    </rect>`;
  }).join('');
}

function statChips(account) {
  const items = [];
  if (account?.publicRepos !== null && account?.publicRepos !== undefined) items.push(['REPOS', account.publicRepos]);
  if (account?.followers !== null && account?.followers !== undefined) items.push(['FOLLOWERS', account.followers]);
  if (account?.following !== null && account?.following !== undefined) items.push(['FOLLOWING', account.following]);
  if (account?.createdAt) items.push(['SINCE', new Date(account.createdAt).getUTCFullYear()]);

  let x = 214;
  return items.map(([label, value]) => {
    const text = `${label} ${value}`;
    const width = Math.round(monoWidth(text, 11, 1) + 22);
    const chip = `
      <rect x="${x}" y="${CHIP_Y}" width="${width}" height="24" rx="12" fill="${P.ink0}" fill-opacity="0.42" stroke="${P.lineBright}" stroke-width="1"/>
      <text x="${x + width / 2}" y="${CHIP_Y + 16}" font-size="11" letter-spacing="1" fill="${P.ice}" text-anchor="middle">${esc(text)}</text>`;
    x += width + 10;
    return chip;
  }).join('');
}

/** Technical badge glyphs — iconography, not claims. */
function badges() {
  const glyphs = [
    `<path d="M17 8 l3.4 7 7.6 1 -5.6 5.4 1.4 7.6 -6.8 -3.6 -6.8 3.6 1.4 -7.6 -5.6 -5.4 7.6 -1 z" fill="${P.accent2}" opacity="0.9"/>`,
    `<path d="M11 17 v-6 a6 6 0 0 1 12 0 v6 M9 17 h16 v9 h-16 z" fill="none" stroke="${P.accent2}" stroke-width="1.6" stroke-linejoin="round"/>`,
    `<path d="M9 17 h5 l3 -5 l3 10 l3 -5 h5" fill="none" stroke="${P.accent1}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`,
    `<path d="M13 13 l-5 7 5 7 M27 13 l5 7 -5 7 M23 11 l-4 18" fill="none" stroke="${P.ice}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<rect x="11" y="12" width="18" height="12" rx="2" fill="none" stroke="${P.accent2}" stroke-width="1.5"/><path d="M11 29 h11 M26 29 h2" stroke="${P.accent2}" stroke-width="1.5" stroke-linecap="round"/>`,
  ];
  return glyphs.map((glyph, index) => {
    const x = 214 + index * 44;
    return `
      <g>
        <rect x="${x}" y="${BADGE_Y}" width="34" height="34" rx="9" fill="${P.ink0}" fill-opacity="0.42" stroke="${P.lineBright}" stroke-width="1"/>
        <g transform="translate(${x},${BADGE_Y})">${glyph}</g>
      </g>`;
  }).join('');
}

/** Readout panel: label/value rows, values right aligned in their column. */
function readout(renderedAt) {
  const rows = [
    ['STACK', `${STACK.length} tools`],
    ['REGION', IDENTITY.region],
    ['TIMEZONE', `${IDENTITY.timezone} · ${IDENTITY.timezoneLabel}`],
    ['BACKDROP', IDENTITY.heroCipher],
    ['PIPELINE', 'node · 0 deps · static svg'],
    ['RENDERED', isoDate(renderedAt)],
  ];

  const body = rows.map(([label, value], index) => {
    const y = READOUT_Y + 54 + index * 26;
    return `
      <text x="792" y="${y}" font-size="11" fill="${P.muted}">${esc(label)}</text>
      <text x="1148" y="${y}" font-size="12" fill="${index === 3 ? P.accent2 : P.silver}" text-anchor="end">${esc(value)}</text>
      <path d="M792 ${y + 8} H1148" stroke="${P.lineBright}" stroke-width="1" stroke-opacity="0.55"/>`;
  }).join('');

  return `
    <rect x="774" y="${READOUT_Y}" width="392" height="${BOTTOM - READOUT_Y - 20}" rx="10" fill="${P.ink0}" fill-opacity="0.3" stroke="${P.lineBright}" stroke-width="1"/>
    <rect x="774" y="${READOUT_Y}" width="392" height="2" rx="1" fill="${P.accent2}" opacity="0.85">
      <animate attributeName="opacity" values="0.85;0.3;0.85" dur="5s" repeatCount="indefinite"/>
    </rect>
    <text x="792" y="${READOUT_Y + 26}" font-size="10" letter-spacing="3" fill="${P.muted}">READOUT</text>
    ${body}`;
}

export function render({ hero, account, avatar, renderedAt }) {
  const editionBox = Math.round(monoWidth(IDENTITY.edition, 11, 2) + 26);
  const specText = `${W} × ${H} · SVG`;
  const specBox = Math.round(monoWidth(specText, 11, 1) + 26);

  const portrait = avatar
    ? `<g clip-path="url(#avatarClip)">
        <image x="${AVATAR.cx - AVATAR.r}" y="${AVATAR.cy - AVATAR.r}" width="${AVATAR.r * 2}" height="${AVATAR.r * 2}" preserveAspectRatio="xMidYMid slice" xlink:href="${avatar.uri}"/>
      </g>`
    : `<circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r}" fill="${P.ink2}"/>
       <text class="ui" x="${AVATAR.cx}" y="${AVATAR.cy + 12}" font-size="34" font-weight="700" fill="${P.muted}" text-anchor="middle">${esc(IDENTITY.name.charAt(0))}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(IDENTITY.name)} — banner">
  <defs>
    <linearGradient id="grade" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#0a1c31" stop-opacity="0.34"/>
      <stop offset="0.45" stop-color="#0a1626" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.5"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.36" r="0.8">
      <stop offset="0.44" stop-color="${P.ink0}" stop-opacity="0"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.6"/>
    </radialGradient>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.ink0}" stop-opacity="0"/>
      <stop offset="0.22" stop-color="${P.ink0}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${P.ink0}" stop-opacity="0.32"/>
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
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.5" stop-color="${P.accent2}"/>
      <stop offset="1" stop-color="${P.accent3}"/>
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
    <filter id="tsh" x="-20%" y="-60%" width="140%" height="260%">
      <feDropShadow dx="0" dy="1.2" stdDeviation="2.2" flood-color="#02060c" flood-opacity="0.95"/>
    </filter>
    <clipPath id="frame">
      <rect x="12" y="0" width="${W - 24}" height="${H}" rx="16"/>
    </clipPath>
    <clipPath id="artClip">
      <rect x="12" y="0" width="${W - 24}" height="${H}"/>
    </clipPath>
    <clipPath id="avatarClip">
      <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r}"/>
    </clipPath>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
      .ui { font-family: "Motiva Sans", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    </style>
  </defs>

  <rect x="12" y="0" width="${W - 24}" height="${H}" rx="16" fill="${P.ink1}"/>

  <g clip-path="url(#artClip)">
    <g transform="translate(${W / 2},${ART_H / 2})">
      <g>
        <animateTransform attributeName="transform" type="scale" values="1;1.045;1" dur="30s" repeatCount="indefinite"/>
        <image x="${-(CANVAS.heroWidth / 2)}" y="${-ART_H / 2}" width="${CANVAS.heroWidth}" height="${ART_H}" preserveAspectRatio="none" xlink:href="${hero}"/>
      </g>
    </g>
    <rect x="12" y="0" width="${W - 24}" height="${H}" fill="url(#grade)"/>
    <rect x="12" y="0" width="${W - 24}" height="${H}" fill="url(#vignette)"/>

    <ellipse cx="290" cy="120" rx="300" ry="190" fill="url(#bloom)">
      <animate attributeName="opacity" values="0.5;0.9;0.5" dur="11s" repeatCount="indefinite"/>
    </ellipse>
    <ellipse cx="1010" cy="150" rx="250" ry="170" fill="url(#bloom)" opacity="0.6">
      <animate attributeName="opacity" values="0.85;0.45;0.85" dur="13s" repeatCount="indefinite"/>
    </ellipse>

    <g transform="skewX(-16)">
      <rect x="-360" y="0" width="230" height="${STRIP_Y + 40}" fill="url(#sweep)">
        <animateTransform attributeName="transform" type="translate" values="0 0;1560 0" dur="9.5s" repeatCount="indefinite"/>
      </rect>
    </g>

    ${motes()}
    ${streaks()}
    <rect x="12" y="0" width="${W - 24}" height="${H}" fill="url(#scan)"/>
    ${rulers()}

    <g transform="translate(1002,300)" fill="none" stroke="${P.accent1}" stroke-opacity="0.62">
      <circle r="54" stroke-width="1"/>
      <circle r="34" stroke-width="0.8" stroke-dasharray="4 8">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="24s" repeatCount="indefinite"/>
      </circle>
      <path d="M-70 0 H-40 M40 0 H70 M0 -70 V-40 M0 40 V70" stroke-width="1"/>
      <circle r="2.4" fill="${P.accent2}" stroke="none"/>
    </g>
    <rect x="896" y="366" width="212" height="52" rx="8" fill="${P.ink0}" fill-opacity="0.62" stroke="${P.lineBright}" stroke-width="1"/>
    <text class="mono" x="1002" y="387" font-size="11" letter-spacing="3" fill="${P.accent1}" text-anchor="middle">MOONLIT CATHEDRAL</text>
    <text class="mono" x="1002" y="406" font-size="10" letter-spacing="0.5" fill="${P.ice}" fill-opacity="0.9" text-anchor="middle">src 768 × 1365 · frame 1176 × 1005</text>
    ${equaliser()}

    <path d="M12 ${STRIP_Y} H${W - 12}" stroke="${P.accent2}" stroke-opacity="0.4" stroke-width="1"/>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent1}" opacity="0.22">
      <animate attributeName="y" values="12;${STRIP_Y + 24};12" dur="15s" repeatCount="indefinite"/>
    </rect>
  </g>

  <g clip-path="url(#frame)">
    <rect x="12" y="${STRIP_Y}" width="${W - 24}" height="${BOTTOM - STRIP_Y}" fill="url(#scrim)"/>
    <rect x="12" y="${STRIP_Y}" width="${W - 24}" height="1" fill="${P.accent2}" opacity="0.3"/>
    <rect x="12" y="${STRIP_Y}" width="${W - 24}" height="1" fill="${P.accent1}" opacity="0.18"/>
  </g>

  <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 26}" fill="url(#bloom)">
    <animate attributeName="opacity" values="0.7;1;0.7" dur="7s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 4}" fill="${P.ink0}" fill-opacity="0.85"/>
  ${portrait}
  <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r}" fill="none" stroke="${P.ink0}" stroke-width="3" stroke-opacity="0.9"/>
  <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 4}" fill="none" stroke="${P.line}" stroke-width="1.4"/>
  <g>
    <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 4}" fill="none" stroke="url(#ring)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="120 340"/>
    <animateTransform attributeName="transform" type="rotate" from="0 ${AVATAR.cx} ${AVATAR.cy}" to="360 ${AVATAR.cx} ${AVATAR.cy}" dur="11s" repeatCount="indefinite"/>
  </g>
  <g>
    <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 12}" fill="none" stroke="${P.accent2}" stroke-width="1" stroke-dasharray="3 12" opacity="0.5"/>
    <animateTransform attributeName="transform" type="rotate" from="360 ${AVATAR.cx} ${AVATAR.cy}" to="0 ${AVATAR.cx} ${AVATAR.cy}" dur="26s" repeatCount="indefinite"/>
  </g>

  <g class="mono" filter="url(#tsh)">
    <text x="214" y="${NAME_Y}" font-size="34" font-weight="700" letter-spacing="2" fill="url(#name)">${esc(IDENTITY.name)}</text>
    <text x="216" y="${HANDLE_Y}" font-size="12" fill="${P.ice}" fill-opacity="0.92">${esc(IDENTITY.handle)} · ${esc(IDENTITY.region)} · ${esc(IDENTITY.timezone)} ${esc(IDENTITY.timezoneLabel.replace('SGT ', ''))}</text>
    <text x="216" y="${TAGLINE_Y}" font-size="13" fill="${P.ice}">${esc(IDENTITY.tagline)}</text>
    ${statChips(account)}
    ${badges()}
    <text x="62" y="${BOTTOM - 12}" font-size="11" letter-spacing="1" fill="${P.ice}" fill-opacity="0.9">© ${esc(IDENTITY.login)} · backdrop art ${esc(IDENTITY.heroCipher)} at rest · all rights reserved</text>
    <text x="${W - 62}" y="${BOTTOM - 12}" font-size="11" letter-spacing="1" fill="${P.ice}" fill-opacity="0.9" text-anchor="end">github.com/${esc(IDENTITY.login)}</text>
    ${readout(renderedAt)}
  </g>

  <rect x="12" y="0" width="${W - 24}" height="${H}" rx="16" fill="none" stroke="url(#edge)" stroke-width="1.4" opacity="0.85"/>
  <g class="mono">
    <rect x="34" y="34" width="${editionBox}" height="24" rx="6" fill="${P.ink0}" fill-opacity="0.76" stroke="${P.accent2}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="${34 + editionBox / 2}" y="50" font-size="11" letter-spacing="2" fill="${P.accent1}" text-anchor="middle">${esc(IDENTITY.edition)}</text>
    <rect x="${W - 34 - specBox}" y="34" width="${specBox}" height="24" rx="6" fill="${P.ink0}" fill-opacity="0.76" stroke="${P.lineBright}" stroke-width="1"/>
    <text x="${W - 34 - specBox / 2}" y="50" font-size="11" letter-spacing="1" fill="${P.ice}" text-anchor="middle">${esc(specText)}</text>
  </g>
  <g stroke="url(#edge)" stroke-width="2" fill="none" opacity="0.85">
    <path d="M20 116 V28 Q20 24 24 24 H92"/>
    <path d="M${W - 20} 116 V28 Q${W - 20} 24 ${W - 24} 24 H${W - 92}"/>
  </g>
</svg>
`;
}

