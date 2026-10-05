# `scripts/` — profile asset pipeline

Everything under `assets/` is a build artifact. The sources live here, the CI job
`.github/workflows/profile.yml` runs the build once a day and commits whatever
changed, in a single atomic commit.

```
scripts/
  render.mjs            build entry point -> writes assets/*.svg
  pack-artwork.mjs      encrypts a prepared artwork derivative into assets/artwork/
  artwork-crypto.mjs    AES-256-GCM container format (seal/open)
  lib/config.mjs        identity, palette, stack, generated file list
  lib/github.mjs        account + avatar lookup
  lib/svg.mjs           escaping, data URIs, measured monospace widths
  templates/*.mjs       one module per rendered card
```

No dependencies. Node 20+ is enough (`node:crypto`, `node:fs`, `fetch`).

## Regenerating locally

```bash
ARTWORK_AES_KEY=<64 hex chars> GITHUB_TOKEN=<token> node scripts/render.mjs
node scripts/render.mjs --only loading,about,divider,footer   # skip the artwork
```

`--only` is the fast path while iterating on a card: it leaves the artwork
templates alone, so no key is required.

## How the artwork is protected

The repository only ever stores ciphertext. Nothing in the pipeline writes a
decrypted image to disk — `render.mjs` unpacks into memory and emits the SVG,
which has to be public for GitHub to display it.

```bash
# prepare a derivative (any tool), then pack it
ARTWORK_AES_KEY=<hex> node scripts/pack-artwork.mjs --id hanayome-hero --in hero.jpg
node scripts/pack-artwork.mjs --verify hanayome-hero
```

| slot                 | pixels    | used by            |
| -------------------- | --------- | ------------------ |
| `hanayome-hero`      | 1200×640  | `assets/banner.svg`  |
| `hanayome-portrait`  | 640×1138  | `assets/artwork.svg` |
| `hanayome-detail-a`  | 240×240   | `assets/artwork.svg` |
| `hanayome-detail-b`  | 240×240   | `assets/artwork.svg` |

Container layout (`assets/artwork/*.jpg.enc`):

```
0  4  magic "BKA1"
4  1  version        0x01
5  1  cipher id      0x01 = AES-256-GCM
6  1  iv length      12
7  1  tag length     16
8 12  iv             fresh random nonce per seal
20 16  tag            GCM authentication tag
36 ..  ciphertext
```

Additional authenticated data is `BKA1|<asset id>|v1`, so a blob cannot be
renamed or swapped with another slot — authentication fails instead. The
decoder fails closed on a bad magic, an unknown version, a truncated body or a
failed tag.

### Key handling

* Store the key as the `ARTWORK_AES_KEY` repository secret (64 hex chars).
* Never pass it on a command line that gets logged; use the environment or
  `--key-file` for local runs.
* Rotating: repack every slot with the new key, commit, update the secret in the
  same order — old ciphertext simply stops authenticating.
* A missing key is not fatal: artwork is skipped and the previous committed
  banners stay in place.

## What is and is not public

Ciphertext is committed, decrypted artwork is not. The rendered SVG necessarily
contains the published derivative, because GitHub renders it as a plain image —
anyone with the profile open can extract that copy. That is why the published
derivatives are watermarked and downscaled, and why the originals are not
stored in this repository at all.
