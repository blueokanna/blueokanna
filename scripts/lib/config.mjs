/**
 * Single source of truth for identity, palette and paths.
 *
 * Every template imports from here so a change to identity or colour lands in
 * all generated assets at once — the palette is tuned to the hanayome artwork
 * (moonlit cathedral blue, silver light, periwinkle ribbon).
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
  artworkCipher: 'AES-256-GCM',
  year: '2026',
};

export const PALETTE = {
  ink0: '#060d18',
  ink1: '#0b1727',
  ink2: '#101f33',
  line: '#1e3555',
  lineBright: '#2b4a72',
  silver: '#eef4ff',
  ice: '#b6d2f5',
  muted: '#7e97b8',
  faint: '#4a6285',
  accent1: '#dbe9ff',
  accent2: '#a9c8f2',
  accent3: '#7ea6e0',
  glow: '#9cc0f0',
  gold: '#e8cf9a',
  rose: '#f4f8ff',
};

export const STACK = [
  'Rust', 'Java', 'C / C++', 'Flutter', 'SQLite', 'Linux', 'Git',
  'Kali', 'IPFS', 'Arduino', 'Postman', 'Actions', 'Windows', 'Android',
];

export const ARTWORK = {
  hero: 'hanayome-hero',
  portrait: 'hanayome-portrait',
  detailA: 'hanayome-detail-a',
  detailB: 'hanayome-detail-b',
};

export const PATHS = {
  assets: 'assets',
  artwork: 'assets/artwork',
  readme: 'README.md',
};

/** Assets regenerated on every run; the commit step diffs exactly these. */
export const GENERATED = [
  'assets/banner.svg',
  'assets/profile.svg',
  'assets/artwork.svg',
  'assets/loading.svg',
  'assets/about.svg',
  'assets/divider.svg',
  'assets/footer.svg',
];
