#!/usr/bin/env node
/**
 * Encrypts a prepared artwork file into the repository.
 *
 *   ARTWORK_AES_KEY=<64 hex chars> node scripts/pack-artwork.mjs \
 *     --id hero-night --in ~/renders/hero-night.jpg
 *
 * or, to avoid putting the key in the environment:
 *
 *   node scripts/pack-artwork.mjs --id hero-night --in hero.jpg --key-file ~/.keys/artwork.key
 *
 * The plaintext file is read, sealed and written to assets/artwork/<id>.jpg.enc.
 * Plaintext is never copied into the repository and never printed.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PATHS } from './lib/config.mjs';
import { assertAssetId, containerInfo, open, parseKey, seal } from './artwork-crypto.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { id: null, input: null, keyFile: null, verify: null };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) throw new Error(`${flag} requires a value`);
      i += 1;
      return next;
    };
    switch (flag) {
      case '--id': args.id = value(); break;
      case '--in': args.input = value(); break;
      case '--key-file': args.keyFile = value(); break;
      case '--verify': args.verify = value(); break;
      case '--help': case '-h': args.help = true; break;
      default: throw new Error(`unknown argument ${flag}`);
    }
  }
  return args;
}

async function loadKey(keyFile) {
  if (keyFile) {
    const hex = (await readFile(resolve(keyFile), 'utf8')).trim();
    return parseKey(hex);
  }
  const hex = process.env.ARTWORK_AES_KEY;
  if (!hex) {
    throw new Error('provide the key with --key-file or the ARTWORK_AES_KEY environment variable');
  }
  return parseKey(hex);
}

function containerPath(id) {
  return join(ROOT, PATHS.artwork, `${id}.jpg.enc`);
}

function report(id, container, plaintextBytes, digest) {
  const info = containerInfo(container);
  console.log(`packed  ${id}`);
  console.log(`  container : assets/artwork/${id}.jpg.enc (${container.length} bytes)`);
  console.log(`  format    : v${info.version} aes-256-gcm, iv ${info.ivBytes}B, tag ${info.tagBytes}B`);
  console.log(`  plaintext : ${plaintextBytes} bytes, sha256 ${digest}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('usage: node scripts/pack-artwork.mjs --id <asset> --in <file.jpg> [--key-file <path>]');
    console.log('       node scripts/pack-artwork.mjs --verify <asset> [--key-file <path>]');
    return 0;
  }

  const key = await loadKey(args.keyFile);

  if (args.verify) {
    const id = assertAssetId(args.verify);
    const container = await readFile(containerPath(id));
    const plaintext = open(key, id, container);
    console.log(`verified ${id}`);
    console.log(`  plaintext : ${plaintext.length} bytes`);
    console.log(`  sha256    : ${createHash('sha256').update(plaintext).digest('hex')}`);
    return 0;
  }

  if (!args.id || !args.input) {
    throw new Error('both --id and --in are required (see --help)');
  }

  const id = assertAssetId(args.id);
  const plaintext = await readFile(resolve(args.input));
  const container = seal(key, id, plaintext);

  // Round-trip before writing: a blob that fails to reopen must never be committed.
  const check = open(key, id, container);
  if (!check.equals(plaintext)) {
    throw new Error('round-trip mismatch — refusing to write the container');
  }

  const target = containerPath(id);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, container);

  report(id, container, plaintext.length, createHash('sha256').update(plaintext).digest('hex'));
  console.log(`  source    : ${basename(args.input)} (not copied into the repository)`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(`pack-artwork: ${error.message}`);
    process.exit(1);
  },
);
