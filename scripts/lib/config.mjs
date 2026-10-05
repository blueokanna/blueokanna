/**
 * Single source of truth for identity, palette and paths.
 *
 * Every template imports from here so an identity or colour change lands in
 * all generated assets at once. The palette is steel blue on near-black — it
 * picks up the hero artwork's moonlight and reads as instrumentation rather
 * than decoration.
 */

export const IDENTITY = {
  login: 'blueokanna',
  name: 'BLUEOKANNA',
  handle: '@blueokanna',
  tagline: 'backend engineer · systems & performance · open source',
  stackLine: 'rust · java · flutter · linux',
  email: 'blueokanna@gmail.com',
  region: 'South Africa',
  timezone: 'Asia/Singapore',
  timezoneLabel: 'SGT UTC+8',
  edition: 'BLUEOKANNA EDITION',
  heroCipher: 'AES-256-GCM',
  year: '2026',
};

export const PALETTE = {
  ink0: '#050c16',
  ink1: '#0a1524',
  ink2: '#0f2035',
  line: '#1c3350',
  lineBright: '#2b4a72',
  silver: '#e8f1ff',
  ice: '#a9c8ee',
  muted: '#7a93b4',
  faint: '#47607e',
  accent1: '#cfe4ff',
  accent2: '#66c0f4',
  accent3: '#4d8fd6',
  glow: '#6db4ea',
};

export const STACK = [
  'Rust', 'Java', 'C / C++', 'Flutter', 'SQLite', 'Linux', 'Git',
  'Kali', 'IPFS', 'Arduino', 'Postman', 'Actions', 'Windows', 'Android',
];

/**
 * Encrypted artwork slots.
 *
 *  hero   the banner crop, sharp, watermarked (source rows 164..820)
 *  tail   the continuation below the banner (rows 820..1365), already rendered
 *         at card scale so every card can slide its window over it
 */
export const ARTWORK = {
  hero: 'hero-night',
  tail: 'backdrop-tail',
};

/**
 * Page backdrop geometry.
 *
 * The whole page is one image at one magnification. Source rows 164..1365 are
 * shown across four cards: the banner takes 1200x1025, then telemetry, about
 * and footer take 470 + 220 + 145 = 835 px of the tail derivative, which is
 * itself 1176x835. Card heights below must match the templates.
 */
export const CANVAS = {
  heroWidth: 1200,
  heroHeight: 1025,
  tailWidth: 1176,
  tailHeight: 835,
};

/** Offsets into the tail derivative, in card pixels. */
export const TAIL_OFFSETS = {
  telemetry: 0,
  about: 470,
  footer: 690,
};

export const PATHS = {
  assets: 'assets',
  artwork: 'assets/artwork',
  readme: 'README.md',
};

/** Assets regenerated on every run; the commit step diffs exactly these. */
export const GENERATED = [
  'assets/banner.svg',
  'assets/telemetry.svg',
  'assets/about.svg',
  'assets/footer.svg',
];
