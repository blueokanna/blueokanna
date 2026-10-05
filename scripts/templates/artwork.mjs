/**
 * Artwork showcase: the portrait in a lit frame next to its description,
 * specification table and two detail crops. Every copy of the artwork shown
 * here is the watermarked derivative, and the repository only stores it
 * encrypted — the plaintext never touches a commit.
 */

import { IDENTITY, PALETTE as P } from '../lib/config.mjs';
import { esc } from '../lib/svg.mjs';

const W = 1200;
const H = 660;
const HEADER_Y = 56;

const FRAME = { x: 56, y: 76, w: 297, h: 528 };
const DETAIL = { size: 176, y: 434, x: 400, gap: 196 };

const SPECS = [
  ['FORMAT', 'jpeg · 8-bit · srgb'],
  ['RESOLUTION', '768 × 1365'],
  ['PROTECTION', `${IDENTITY.artworkCipher} at rest`],
  ['LICENCE', 'all rights reserved'],
];

const DESCRIPTION = [
  '蓝发与白发的一对新人在月夜殿堂前相拥，白玫瑰与蓝丝带沿石阶铺开。',
  'Two brides beneath a moonlit cathedral — white roses, blue ribbon,',
  'and a sky full of doves.',
];

function specRows() {
  return SPECS.map(([label, value], index) => {
    const y = 296 + index * 30;
    return `
      <text x="400" y="${y}" font-size="11" letter-spacing="2" fill="${P.faint}">${esc(label)}</text>
      <text x="1160" y="${y}" font-size="12" fill="${P.ice}" text-anchor="end">${esc(value)}</text>
      <path d="M400 ${y + 8} H1160" stroke="${P.line}" stroke-width="1" stroke-opacity="${index === SPECS.length - 1 ? 0.9 : 0.45}"/>`;
  }).join('');
}

function detail(uri, label, x) {
  if (!uri) return '';
  return `
    <g>
      <rect x="${x}" y="${DETAIL.y}" width="${DETAIL.size}" height="${DETAIL.size}" rx="10" fill="${P.ink2}" stroke="${P.line}" stroke-width="1"/>
      <g clip-path="url(#detailClip)">
        <image x="${x + 6}" y="${DETAIL.y + 6}" width="${DETAIL.size - 12}" height="${DETAIL.size - 12}" preserveAspectRatio="xMidYMid slice" xlink:href="${uri}"/>
      </g>
      <text x="${x + 8}" y="${DETAIL.y + DETAIL.size + 18}" font-size="10" letter-spacing="1" fill="${P.faint}">${esc(label)}</text>
    </g>`;
}

export function render({ portrait, detailA, detailB }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="original artwork">
  <defs>
    <linearGradient id="panel" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${P.ink1}"/>
      <stop offset="0.55" stop-color="${P.ink0}"/>
      <stop offset="1" stop-color="#0a1424"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${P.accent1}"/>
      <stop offset="0.55" stop-color="${P.accent3}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.7" stop-color="${P.accent1}"/>
      <stop offset="1" stop-color="${P.accent2}"/>
    </linearGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${P.silver}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${P.silver}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${P.silver}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.glow}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${P.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0 H0 V34" fill="none" stroke="${P.line}" stroke-width="1" stroke-opacity="0.4"/>
    </pattern>
    <clipPath id="frame">
      <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14"/>
    </clipPath>
    <clipPath id="portraitClip">
      <rect x="${FRAME.x + 6}" y="${FRAME.y + 6}" width="${FRAME.w - 12}" height="${FRAME.h - 12}" rx="10"/>
    </clipPath>
    <clipPath id="detailClip">
      <rect x="${DETAIL.x + 6}" y="${DETAIL.y + 6}" width="${DETAIL.size - 12}" height="${DETAIL.size - 12}" rx="8"/>
    </clipPath>
    <style>
      .mono { font-family: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    </style>
  </defs>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="url(#panel)"/>
  <g clip-path="url(#frame)">
    <rect x="-34" y="-34" width="${W + 68}" height="${H + 68}" fill="url(#grid)" opacity="0.28">
      <animateTransform attributeName="transform" type="translate" values="0 0;34 34" dur="18s" repeatCount="indefinite"/>
    </rect>
    <path d="M12 ${HEADER_Y} H${W - 12}" stroke="${P.line}" stroke-width="1"/>
    <text class="mono" x="40" y="40" font-size="12" letter-spacing="2" fill="${P.muted}">ORIGINAL ARTWORK · 原创画作</text>
    <text class="mono" x="${W - 40}" y="40" font-size="11" letter-spacing="1.5" fill="${P.faint}" text-anchor="end">github.com/${esc(IDENTITY.login)}</text>
    <rect x="12" y="0" width="${W - 24}" height="2" fill="${P.accent2}" opacity="0.24">
      <animate attributeName="y" values="12;${H - 14};12" dur="16s" repeatCount="indefinite"/>
    </rect>
    <ellipse cx="${FRAME.x + FRAME.w / 2}" cy="${FRAME.y + FRAME.h / 2}" rx="240" ry="300" fill="url(#bloom)">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="9s" repeatCount="indefinite"/>
    </ellipse>
  </g>

  <g>
    <rect x="${FRAME.x}" y="${FRAME.y}" width="${FRAME.w}" height="${FRAME.h}" rx="14" fill="${P.ink2}" stroke="${P.line}" stroke-width="1"/>
    <g clip-path="url(#portraitClip)">
      <image x="${FRAME.x + 6}" y="${FRAME.y + 6}" width="${FRAME.w - 12}" height="${FRAME.h - 12}" preserveAspectRatio="xMidYMid slice" xlink:href="${portrait}"/>
      <g transform="skewX(-14)" opacity="0.55">
        <rect x="${FRAME.x - 300}" y="${FRAME.y}" width="120" height="${FRAME.h}" fill="url(#sweep)">
          <animateTransform attributeName="transform" type="translate" values="0 0;620 0" dur="9s" repeatCount="indefinite"/>
        </rect>
      </g>
    </g>
    <rect x="${FRAME.x}" y="${FRAME.y}" width="${FRAME.w}" height="${FRAME.h}" rx="14" fill="none" stroke="${P.lineBright}" stroke-width="1.4"/>
    <rect x="${FRAME.x}" y="${FRAME.y}" width="${FRAME.w}" height="3" rx="1.5" fill="url(#edge)" opacity="0.85"/>
    <text class="mono" x="${FRAME.x}" y="${FRAME.y + FRAME.h + 26}" font-size="10" letter-spacing="1" fill="${P.faint}">768 × 1365 · ${esc(IDENTITY.artworkCipher)}</text>
  </g>

  <g class="mono">
    <text x="400" y="112" font-size="30" font-weight="700" letter-spacing="3" fill="url(#title)">ORIGINAL ARTWORK</text>
    <text x="400" y="142" font-size="13" letter-spacing="1" fill="${P.accent2}">#01 · hanayome · 花嫁 · ${esc(IDENTITY.year)}</text>
    <path d="M400 158 H1160" stroke="${P.line}" stroke-width="1"/>
    ${DESCRIPTION.map((line, index) => `<text x="400" y="${192 + index * 24}" font-size="13" fill="${P.muted}">${esc(line)}</text>`).join('\n    ')}
    ${specRows()}
  </g>

  ${detail(detailA, 'detail · 01', DETAIL.x)}
  ${detail(detailB, 'detail · 02', DETAIL.x + DETAIL.gap)}

  <g class="mono">
    <rect x="792" y="434" width="368" height="${DETAIL.size}" rx="10" fill="${P.ink2}" stroke="${P.line}" stroke-width="1"/>
    <text x="812" y="464" font-size="10" letter-spacing="3" fill="${P.faint}">NOTICE</text>
    <path d="M812 474 H1140" stroke="${P.line}" stroke-width="1"/>
    <text x="812" y="502" font-size="13" fill="${P.silver}">未经许可禁止转载 · do not redistribute</text>
    <text x="812" y="528" font-size="12" fill="${P.muted}">© ${esc(IDENTITY.year)} ${esc(IDENTITY.login)} · all rights reserved</text>
    <text x="812" y="556" font-size="11" fill="${P.faint}">repository copy encrypted · ${esc(IDENTITY.artworkCipher)}</text>
    <text x="812" y="582" font-size="11" fill="${P.accent2}" opacity="0.9">published derivative · watermarked</text>
    <rect x="812" y="592" width="6" height="6" fill="${P.gold}">
      <animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite"/>
    </rect>
  </g>

  <rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="url(#edge)" stroke-width="1.3" opacity="0.72"/>
</svg>
`;
}
