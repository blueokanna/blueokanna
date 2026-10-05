# `scripts/` — profile asset pipeline

Everything under `assets/` is a build artifact. The sources live here, the job
`.github/workflows/profile.yml` runs the build once a day and commits whatever
changed, in a single atomic commit.

```
scripts/
  render.mjs            build entry point -> writes assets/*.svg
  pack-artwork.mjs      encrypts a prepared backdrop into assets/artwork/
  artwork-crypto.mjs    AES-256-GCM container format (seal/open)
  lib/config.mjs        identity, palette, stack, artwork slots, generated files
  lib/github.mjs        account + avatar lookup
  lib/svg.mjs           escaping, data URIs, measured monospace widths
  templates/*.mjs       one module per rendered card
```

No dependencies: Node 20+ and `node:crypto`, `node:fs`, `fetch` are enough.

## Regenerating locally

```bash
IMAGE_AES_DECRYPT=<64 hex chars> GITHUB_TOKEN=<token> node scripts/render.mjs
node scripts/render.mjs --only loading,about,divider,footer   # skip the backdrop
```

`--only` is the fast path while iterating on a card: it leaves the artwork
template alone, so no key is required. Every write goes through a temp file and
a rename, so a crashed run cannot leave a half-written card in `assets/`.

## The backdrop

Both slots are stored as ciphertext:

```bash
IMAGE_AES_DECRYPT=<hex> node scripts/pack-artwork.mjs --id hero-night    --in hero.jpg
IMAGE_AES_DECRYPT=<hex> node scripts/pack-artwork.mjs --id backdrop-soft --in soft.jpg
node scripts/pack-artwork.mjs --verify hero-night
```

| slot            | pixels   | used by                                        |
| --------------- | -------- | ---------------------------------------------- |
| `hero-night`    | 1200×820 | `assets/banner.svg`                            |
| `backdrop-soft` | 512×512  | banner + `loading/about/footer` backdrop layer |

`hero-night` is the banner: full-bleed artwork cropped from source y 0–525 so
the moon, the spires and both figures stay in frame. `backdrop-soft` is a
downscaled, re-upscaled square crop (a cheap blur) that each wide card lays
under its own gradient at 18–22 % opacity, so the artwork runs behind the whole
page without hurting contrast.

Container layout (`assets/artwork/<id>.jpg.enc`):

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

The additional authenticated data is `BKA1|<asset id>|v1`, so a blob cannot be
renamed or moved to another slot — authentication fails instead of decrypting
the wrong image. The decoder fails closed on a bad magic, an unknown version, a
truncated body or a failed tag, and `pack-artwork.mjs` refuses to write a blob
it cannot reopen.

### Key handling

* The key lives in the `IMAGE_AES_DECRYPT` repository secret — 64 hex characters.
* It is read from the environment or `--key-file`, never from a command line
  that ends up in a process list or a log.
* Rotation: repack the slot with the new key, commit, then update the secret.
  Old ciphertext simply stops authenticating against the new key.
* A missing key is not fatal: the backdrop is skipped and the previously
  committed banner stays in place. An *invalid* blob is fatal, and the run stops
  before anything is committed.

## What is and is not public

Ciphertext is committed; the decrypted image never touches the working tree,
because `render.mjs` unpacks it in memory and emits the SVG. That SVG has to be
public — GitHub renders it as a plain image, so anyone with the profile open can
extract the pixels it contains. The published copy is therefore a downscaled,
watermarked derivative, and the full-resolution original is not stored in this
repository at all.

