/**
 * Profile card: the GitHub account avatar inside an animated ring, identity
 * lines, live statistics that were actually returned by the API, and a
 * showcase panel. Nothing on this card is invented — chips whose data is
 * missing are simply not drawn.
 */

import { IDENTITY, PALETTE as P, STACK } from '../lib/config.mjs';
import { esc, isoDate, monoWidth } from '../lib/svg.mjs';

const W = 1200;
const H = 300;
const HEADER_Y = 56;
const CENTER_Y = 172;
const AVATAR = { cx: 150, cy: CENTER_Y, r: 80 };

function statChips(account) {
  const items = [];
  if (account?.publicRepos !== null && account?.publicRepos !== undefined) items.push(['REPOS', account.publicRepos]);
  if (account?.followers !== null && account?.followers !== undefined) items.push(['FOLLOWERS', account.followers]);
  if (account?.following !== null && account?.following !== undefined) items.push(['FOLLOWING', account.following]);
  if (account?.createdAt) items.push(['SINCE', new Date(account.createdAt).getUTCFullYear()]);

  let x = 286;
  return items.map(([label, value]) => {
    const text = `${label} ${value}`;
    const w = Math.round(monoWidth(text, 11, 1) + 22);
    const chip = `
      <rect x="${x}" y="222" width="${w}" height="24" rx="12" fill="${P.ink2}" stroke="${P.line}" stroke-width="1"/>
      <text x="${x + w / 2}" y="238" font-size="11" letter-spacing="1" fill="${P.ice}" text-anchor="middle">${esc(text)}</text>`;
    x += w + 10;
    return chip;
  }).join('');
}

function badges() {
  const glyphs = [
    { label: 'star', path: '<path d="M17 8 l3.4 7 7.6 1 -5.6 5.4 1.4 7.6 -6.8 -3.6 -6.8 3.6 1.4 -7.6 -5.6 -5.4 7.6 -1 z" fill="' + P.accent2 + '" opacity="0.9"/>' },
    { label: 'shield', path: `<path d="M11 17 v-6 a6 6 0 0 1 12 0 v6 M9 17 h16 v9 h-16 z" fill="none" stroke="${P.accent2}" stroke-width="1.6" stroke-linejoin="round"/>` },
    { label: 'pulse', path: `<path d="M9 17 h5 l3 -5 l3 10 l3 -5 h5" fill="none" stroke="${P.accent1}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>` },
    { label: 'code', path: `<path d="M13 13 l-5 7 5 7 M27 13 l5 7 -5 7 M23 11 l-4 18" fill="none" stroke="${P.ice}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>` },
    { label: 'rose', path: `<path d="M20 21 c-6 -4 -9 -7 -7 -10 c1.5 -2.4 6 -1.6 7 0.6 c1 -2.2 5.5 -3 7 -0.6 c2 3 -1 6 -7 10 z" fill="${P.rose}" opacity="0.9"/>` },
  ];

  return glyphs.map((glyph, index) => {
    const x = 286 + index * 44;
    return `
      <g>
        <rect x="${x}" y="252" width="34" height="34" rx="9" fill="${P.ink2}" stroke="${P.line}" stroke-width="1"/>
        <g transform="translate(${x},252)">${glyph.path}</g>
        <title>${glyph.label}</title>
      </g>`;
  }).join('');
}

export function render({ account, avatar, renderedAt }) {
  const portrait = avatar
    ? `<g clip-path="url(#avatarClip)">
        <image x="${AVATAR.cx - AVATAR.r - 4}" y="${AVATAR.cy - AVATAR.r - 4}" width="${(AVATAR.r + 4) * 2}" height="${(AVATAR.r + 4) * 2}" preserveAspectRatio="xMidYMid slice" xlink:href="${avatar.uri}"/>
      </g>`
    : `<circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r - 2}" fill="${P.ink2}"/>
       <text x="${AVATAR.cx}" y="${AVATAR.cy + 6}" font-size="13" fill="${P.faint}" text-anchor="middle" class="mono">avatar unavailable</text>`;

  const repos = account?.publicRepos;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(IDENTITY.login)} profile card">
  <defs>
    <linearGradient id="panel" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${P.ink1}"/>
      <stop offset="0.55" stop-color="${P.ink0}"/>
      <stop offset="1" stop-color="#0a1424"/>
    </linearGradient>
    <linearGradient id="inner" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.ink2}"/>
      <stop offset="1" stop-color="#0c1a2c"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.55" stop-color="${P.accent3}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.5" stop-color="${P.accent3}"/>
      <stop offset="1" stop-color="${P.gold}"/>
    </linearGradient>
    <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent1}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${P.accent1}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${P.accent1}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="ringbloom" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.glow}" stop-opacity="0.3"/>
      <stop offset="1" stop-color="${P.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0 H0 V34" fill="none" stroke="${P.line}" stroke-width="1" stroke-opacity="0.44"/>
    </pattern>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14"/>
    </clipPath>
    <clipPath id="avatarClip">
      <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r}"/>
    </clipPath>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
      .ui { font-family: "Motiva Sans", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="url(#panel)"/>
  <g clip-path="url(#frame)">
    <rect x="-34" y="-34" width="${W + 68}" height="${H + 68}" fill="url(#grid)" opacity="0.32">
      <animateTransform attributeName="transform" type="translate" values="0 0;34 34" dur="18s" repeatCount="indefinite"/>
    </rect>
    <path d="M12 ${HEADER_Y} H${W - 12}" stroke="${P.line}" stroke-width="1"/>
    <text class="mono" x="40" y="40" font-size="12" letter-spacing="2" fill="${P.muted}">PROFILE · ${esc(IDENTITY.login)}</text>
    <text class="mono" x="${W - 40}" y="40" font-size="11" letter-spacing="1.5" fill="${P.faint}" text-anchor="end">github.com/${esc(IDENTITY.login)}</text>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent2}" opacity="0.24">
      <animate attributeName="y" values="12;${H - 14};12" dur="14s" repeatCount="indefinite"/>
    </rect>
  </g>

  <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 40}" fill="url(#ringbloom)">
    <animate attributeName="opacity" values="0.7;1;0.7" dur="7s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 4}" fill="${P.ink0}"/>
  ${portrait}
  <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r}" fill="none" stroke="${P.ink0}" stroke-width="3"/>
  <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 4}" fill="none" stroke="${P.line}" stroke-width="1.4"/>
  <g>
    <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 4}" fill="none" stroke="url(#ring)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="150 420"/>
    <animateTransform attributeName="transform" type="rotate" from="0 ${AVATAR.cx} ${AVATAR.cy}" to="360 ${AVATAR.cx} ${AVATAR.cy}" dur="10s" repeatCount="indefinite"/>
  </g>
  <g>
    <circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 13}" fill="none" stroke="${P.accent2}" stroke-width="1" stroke-dasharray="3 12" opacity="0.5"/>
    <animateTransform attributeName="transform" type="rotate" from="360 ${AVATAR.cx} ${AVATAR.cy}" to="0 ${AVATAR.cx} ${AVATAR.cy}" dur="26s" repeatCount="indefinite"/>
  </g>
  ${repos === null || repos === undefined ? '' : `<g class="ui">
    <circle cx="${AVATAR.cx + 62}" cy="${AVATAR.cy + 62}" r="25" fill="${P.ink1}" stroke="url(#edge)" stroke-width="1.6"/>
    <text x="${AVATAR.cx + 62}" y="${AVATAR.cy + 60}" font-size="17" font-weight="700" fill="${P.silver}" text-anchor="middle">${esc(repos)}</text>
    <text class="mono" x="${AVATAR.cx + 62}" y="${AVATAR.cy + 74}" font-size="7" letter-spacing="1" fill="${P.accent2}" text-anchor="middle">REPOS</text>
  </g>`}

  <g class="mono">
    <text x="286" y="132" font-size="32" font-weight="700" letter-spacing="2" fill="${P.silver}">${esc(IDENTITY.name)}</text>
    <text x="286" y="158" font-size="12" letter-spacing="0.5" fill="${P.muted}">${esc(IDENTITY.handle)} · ${esc(IDENTITY.region)} · ${esc(IDENTITY.timezone)} ${esc(IDENTITY.timezoneLabel.replace('SGT ', ''))}</text>
    <text x="286" y="188" font-size="13" fill="${P.ice}">${esc(IDENTITY.tagline)}</text>
    ${statChips(account)}
    ${badges()}
    <text x="${W - 40}" y="272" font-size="10" letter-spacing="1" fill="${P.faint}" text-anchor="end">rendered ${esc(isoDate(renderedAt))} · data github api</text>
  </g>

  <g class="mono">
    <rect x="${W - 280}" y="86" width="240" height="150" rx="10" fill="url(#inner)" stroke="${P.line}" stroke-width="1"/>
    <text x="${W - 264}" y="110" font-size="10" letter-spacing="3" fill="${P.faint}">SHOWCASE</text>
    <path d="M${W - 264} 120 H${W - 56}" stroke="${P.line}" stroke-width="1"/>
    <text x="${W - 264}" y="144" font-size="11" fill="${P.muted}">STACK</text>
    <text x="${W - 56}" y="144" font-size="12" fill="${P.silver}" text-anchor="end">${STACK.length} tools</text>
    <text x="${W - 264}" y="168" font-size="11" fill="${P.muted}">REGION</text>
    <text x="${W - 56}" y="168" font-size="12" fill="${P.silver}" text-anchor="end">${esc(IDENTITY.region)}</text>
    <text x="${W - 264}" y="192" font-size="11" fill="${P.muted}">TIMEZONE</text>
    <text x="${W - 56}" y="192" font-size="12" fill="${P.silver}" text-anchor="end">${esc(IDENTITY.timezoneLabel)}</text>
    <text x="${W - 264}" y="216" font-size="11" fill="${P.muted}">ARTWORK</text>
    <text x="${W - 56}" y="216" font-size="12" fill="${P.accent2}" text-anchor="end">${esc(IDENTITY.artworkCipher)}</text>
    <rect x="${W - 280}" y="78" width="240" height="2" rx="1" fill="url(#edge)" opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.3;0.9" dur="5s" repeatCount="indefinite"/>
    </rect>
  </g>

  <path d="M286 262 H${W - 300}" stroke="${P.line}" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M286 262 H${W - 300}" stroke="url(#flow)" stroke-width="2" stroke-linecap="round" stroke-dasharray="140 1300">
    <animate attributeName="stroke-dashoffset" values="0;-1440" dur="7s" repeatCount="indefinite"/>
  </path>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#edge)" stroke-width="1.3" opacity="0.72"/>
</svg>
`;
}
