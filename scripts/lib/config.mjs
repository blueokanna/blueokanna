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
 *  hero     the banner crop, sharp, watermarked
 *  page     the whole vertical artwork; every wide card draws a slice of this
 *           one image so the backdrop reads as a single sheet behind the page
 */
export const ARTWORK = {
  hero: 'hero-night',
  page: 'canvas-page',
};

/** Page-canvas geometry: source width, and the slice offset per card. */
export const CANVAS = {
  width: 640,
  height: 1138,
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
  'assets/divider.svg',
  'assets/footer.svg',
];
