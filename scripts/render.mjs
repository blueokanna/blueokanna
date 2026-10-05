#!/usr/bin/env node
/**
 * Builds every generated asset in assets/.
 *
 *   ARTWORK_AES_KEY=<64 hex chars> GITHUB_TOKEN=<token> node scripts/render.mjs
 *
 * Behaviour that matters in CI:
 *
 *  - Artwork blobs are decrypted in memory and never written to disk; only the
 *    rendered SVG (which has to be public for the profile to display it) leaves
 *    this process.
 *  - A missing ARTWORK_AES_KEY skips the artwork templates and leaves the last
 *    good files in place, so losing the secret degrades nothing.
 *  - A blob that fails authentication is a hard error: a tampered or mismatched
 *    container must never silently overwrite committed artwork.
 *  - A failed GitHub metadata call skips profile.svg instead of republishing a
 *    card without the avatar or with missing statistics.
 *
 * Exit codes: 0 success (possibly with skipped assets), 1 fatal.
 */

import { readFile, writeFile, appendFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ARTWORK, IDENTITY, PATHS } from './lib/config.mjs';
import { dataUri, isoDate } from './lib/svg.mjs';
import { open as openContainer, parseKey } from './artwork-crypto.mjs';
import { fetchAccount, fetchAvatar } from './lib/github.mjs';

import * as banner from './templates/banner.mjs';
import * as profile from './templates/profile.mjs';
import * as loading from './templates/loading.mjs';
import * as about from './templates/about.mjs';
import * as divider from './templates/divider.mjs';
import * as footer from './templates/footer.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Asset id -> template slot. Adding artwork is a one line change here. */
const ARTWORK_SLOTS = [
  { file: ARTWORK.hero, slot: 'hero' },
];

async function writeAtomic(relativePath, contents) {
  const target = join(ROOT, relativePath);
  await mkdir(dirname(target), { recursive: true });
  const temporary = `${target}.tmp-${process.pid}`;
  await writeFile(temporary, contents, 'utf8');
  await rename(temporary, target);
  return contents.length;
}

/**
 * Decrypts every artwork blob, or returns null when the key is absent.
 * Authentication failures propagate: they mean tampering or a wrong key.
 */
async function decryptArtwork() {
  if (!process.env.ARTWORK_AES_KEY) {
    console.warn('render: ARTWORK_AES_KEY is not set — artwork assets are left untouched');
    return null;
  }

  const key = parseKey(process.env.ARTWORK_AES_KEY);
  const decoded = {};
  const summary = [];

  for (const { file, slot } of ARTWORK_SLOTS) {
    const container = await readFile(join(ROOT, PATHS.artwork, `${file}.jpg.enc`));
    const plaintext = openContainer(key, file, container);
    decoded[slot] = dataUri('image/jpeg', plaintext);
    summary.push([`${file}.jpg.enc`, container.length, plaintext.length]);
  }

  return { decoded, summary };
}

function parseArgs(argv) {
  const args = { only: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--only') {
      args.only = String(argv[++i] ?? '').split(',').map((v) => v.trim()).filter(Boolean);
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      args.help = true;
    } else {
      throw new Error(`unknown argument ${argv[i]}`);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('usage: ARTWORK_AES_KEY=<hex> [GITHUB_TOKEN=<token>] node scripts/render.mjs [--only banner,profile,...]');
    return 0;
  }

  const renderedAt = new Date();
  const stamp = isoDate(renderedAt);
  const wanted = (name) => !args.only || args.only.includes(name);
  const results = [];
  const skipped = [];

  const artworkData = await decryptArtwork();

  if (artworkData && wanted('banner')) {
    results.push(['assets/banner.svg', await writeAtomic('assets/banner.svg', banner.render({ hero: artworkData.decoded.hero, renderedAt }))]);
  } else if (!artworkData) {
    skipped.push('assets/banner.svg');
  }

  if (wanted('profile')) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
    const account = await fetchAccount(IDENTITY.login, token);
    const avatar = account ? await fetchAvatar(account, token) : null;

    if (!avatar) {
      // Never downgrade a published card: keep the committed one instead.
      skipped.push('assets/profile.svg');
    } else {
      const svg = profile.render({
        account,
        avatar: { uri: dataUri(avatar.mime, avatar.buffer), source: avatar.source },
        renderedAt,
      });
      results.push(['assets/profile.svg', await writeAtomic('assets/profile.svg', svg)]);
    }
  }

  const statics = [
    ['assets/loading.svg', () => loading.render({ renderedAt })],
    ['assets/about.svg', () => about.render()],
    ['assets/divider.svg', () => divider.render()],
    ['assets/footer.svg', () => footer.render({ renderedAt: stamp })],
  ];

  for (const [path, build] of statics) {
    const name = path.replace('assets/', '').replace('.svg', '');
    if (!wanted(name)) continue;
    results.push([path, await writeAtomic(path, build())]);
  }

  console.log('render: generated assets');
  for (const [path, bytes] of results) {
    const digest = createHash('sha256').update(await readFile(join(ROOT, path))).digest('hex').slice(0, 12);
    console.log(`  ${path.padEnd(22)} ${String(bytes).padStart(8)} bytes  sha256:${digest}`);
  }

  // Hand the exact file list to the commit step so the workflow never has to
  // duplicate it — config.mjs stays the single source of truth.
  if (process.env.GITHUB_OUTPUT) {
    const paths = results.map(([path]) => path).join('\n');
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `generated<<RENDER_EOF\n${paths}\nRENDER_EOF\nartwork=${artworkData ? 'rendered' : 'skipped'}\n`,
      'utf8',
    );
  }

  if (artworkData) {
    console.log('render: decrypted artwork (in memory only)');
    for (const [name, containerBytes, plaintextBytes] of artworkData.summary) {
      console.log(`  ${name.padEnd(30)} ${containerBytes} -> ${plaintextBytes} bytes`);
    }
  }

  if (skipped.length) {
    console.log(`render: left untouched -> ${skipped.join(', ')}`);
  }

  return 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(`render: ${error.message}`);
    process.exit(1);
  },
);
