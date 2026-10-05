#!/usr/bin/env node
/**
 * Builds every generated asset in assets/.
 *
 *   IMAGE_AES_DECRYPT=<64 hex chars> [GITHUB_TOKEN=<token>] node scripts/render.mjs
 *
 * Behaviour that matters in CI:
 *
 *  - Artwork blobs are decrypted in memory and never written to disk; only the
 *    rendered SVG (which has to be public for the profile to display it) leaves
 *    this process.
 *  - A missing IMAGE_AES_DECRYPT skips the artwork-dependent assets and leaves
 *    the last good files in place, so losing the secret degrades nothing.
 *  - A blob that fails authentication is a hard error: a tampered or mismatched
 *    container must never silently overwrite committed artwork.
 *  - A failed GitHub lookup only drops rows from the telemetry card; the card
 *    still renders, and the banner falls back to a monogram.
 *
 * Exit codes: 0 success (possibly with skipped assets), 1 fatal.
 */

import { readFile, writeFile, appendFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ARTWORK, IDENTITY, PATHS } from './lib/config.mjs';
import { canvasSlice, dataUri, isoDate } from './lib/svg.mjs';
import { open as openContainer, parseKey } from './artwork-crypto.mjs';
import { collectMetrics, fetchAccount, fetchAvatar } from './lib/github.mjs';

import * as banner from './templates/banner.mjs';
import * as telemetry from './templates/telemetry.mjs';
import * as about from './templates/about.mjs';
import * as divider from './templates/divider.mjs';
import * as footer from './templates/footer.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CARD_WIDTH = 1200 - 24;

/** Asset id -> template slot. Adding artwork is a one line change here. */
const ARTWORK_SLOTS = [
  { file: ARTWORK.hero, slot: 'hero' },
  { file: ARTWORK.page, slot: 'page' },
];

/**
 * Vertical window of the page canvas used by each card, in source pixels.
 *
 * The banner shows the top of the artwork; these offsets continue below it, so
 * scrolling the profile walks down one continuous backdrop.
 */
const CANVAS_OFFSETS = {
  telemetry: 300,
  about: 599,
  footer: 754,
};

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
  if (!process.env.IMAGE_AES_DECRYPT) {
    console.warn('render: IMAGE_AES_DECRYPT is not set — artwork assets are left untouched');
    return null;
  }

  const key = parseKey(process.env.IMAGE_AES_DECRYPT);
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
      args.only = String(argv[++i] ?? '').split(',').map((value) => value.trim()).filter(Boolean);
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
    console.log('usage: IMAGE_AES_DECRYPT=<hex> [GITHUB_TOKEN=<token>] node scripts/render.mjs [--only banner,telemetry,about,divider,footer]');
    return 0;
  }

  const renderedAt = new Date();
  const stamp = isoDate(renderedAt);
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
  const wanted = (name) => !args.only || args.only.includes(name);
  const results = [];
  const skipped = [];

  const artworkData = await decryptArtwork();
  const canvasUri = artworkData?.decoded.page ?? null;

  const sliceFor = (key) => canvasSlice({
    uri: canvasUri,
    cardWidth: CARD_WIDTH,
    offset: CANVAS_OFFSETS[key],
  });

  if (wanted('banner')) {
    if (!canvasUri) {
      skipped.push('assets/banner.svg');
    } else {
      const account = await fetchAccount(IDENTITY.login, token);
      const avatar = account ? await fetchAvatar(account, token) : null;
      if (!avatar) console.warn('render: continuing without the avatar — the banner falls back to a monogram');

      const svg = banner.render({
        hero: artworkData.decoded.hero,
        account,
        avatar: avatar ? { uri: dataUri(avatar.mime, avatar.buffer), source: avatar.source } : null,
        renderedAt,
      });
      results.push(['assets/banner.svg', await writeAtomic('assets/banner.svg', svg)]);
    }
  }

  // Telemetry numbers come from the live API. A lookup that fails only drops
  // rows; the card still renders with whatever was collected.
  const metrics = wanted('telemetry') && canvasUri ? await collectMetrics(IDENTITY.login, token) : null;

  const statics = [
    ['assets/telemetry.svg', 'telemetry', () => telemetry.render({
      canvas: { slice: sliceFor('telemetry') },
      metrics,
      renderedAt,
    })],
    ['assets/about.svg', 'about', () => about.render({ canvas: { slice: sliceFor('about') }, renderedAt: stamp })],
    ['assets/divider.svg', 'divider', () => divider.render()],
    ['assets/footer.svg', 'footer', () => footer.render({ canvas: { slice: sliceFor('footer') }, renderedAt: stamp })],
  ];

  for (const [path, name, build] of statics) {
    if (!wanted(name)) continue;
    if (name !== 'divider' && !canvasUri) {
      skipped.push(path);
      continue;
    }
    results.push([path, await writeAtomic(path, build())]);
  }

  console.log('render: generated assets');
  for (const [path, bytes] of results) {
    const digest = createHash('sha256').update(await readFile(join(ROOT, path))).digest('hex').slice(0, 12);
    console.log(`  ${path.padEnd(24)} ${String(bytes).padStart(8)} bytes  sha256:${digest}`);
  }

  if (artworkData) {
    console.log('render: decrypted artwork (in memory only)');
    for (const [name, containerBytes, plaintextBytes] of artworkData.summary) {
      console.log(`  ${name.padEnd(26)} ${containerBytes} -> ${plaintextBytes} bytes`);
    }
  }

  if (metrics) {
    const collected = ['stars', 'commits', 'pullRequests', 'issues', 'repositories', 'followers']
      .filter((key) => metrics[key] !== null);
    console.log(`render: telemetry rows -> ${collected.join(', ') || 'none'}${metrics.languages.length ? ` · ${metrics.languages.length} languages` : ''}`);
  }

  // Hand the exact file list to the commit step so the workflow never has to
  // duplicate it — config.mjs stays the single source of truth.
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      [
        'generated<<RENDER_EOF',
        ...results.map(([path]) => path),
        'RENDER_EOF',
        `artwork=${artworkData ? 'rendered' : 'skipped'}`,
        '',
      ].join('\n'),
      'utf8',
    );
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
