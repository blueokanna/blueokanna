# `scripts/` — profile asset pipeline

Everything under `assets/` is a build artifact. The sources live here, the job
`.github/workflows/profile.yml` runs the build once a day and commits whatever
changed, in a single atomic commit.

```
scripts/
  render.mjs            build entry point -> writes assets/*.svg
  pack-artwork.mjs      encrypts a prepared image into assets/artwork/
  artwork-crypto.mjs    AES-256-GCM container format (seal/open)
  lib/config.mjs        identity, palette, stack, artwork slots, canvas offsets
  lib/github.mjs        account, avatar and the telemetry statistics
  lib/svg.mjs           escaping, data URIs, measured widths, canvas slicing
  templates/*.mjs       one module per rendered card
```

No dependencies: Node 20+ and `node:crypto`, `node:fs`, `fetch` are enough.

## Regenerating locally

```bash
IMAGE_AES_DECRYPT=<64 hex chars> GITHUB_TOKEN=<token> node scripts/render.mjs
node scripts/render.mjs --only divider,about         # skip artwork-dependent cards
```

Without `GITHUB_TOKEN` the telemetry card still renders, but the contribution
counts come from the unauthenticated search index (rate limited) instead of the
GraphQL contributions collection. Every write goes through a temp file and a
rename, so a crashed run cannot leave a half-written card in `assets/`.

## The artwork

Two encrypted slots. Both are decrypted in memory only — no plaintext image is
ever written into the working tree.

```bash
IMAGE_AES_DECRYPT=<hex> node scripts/pack-artwork.mjs --id hero-night  --in hero.jpg
IMAGE_AES_DECRYPT=<hex> node scripts/pack-artwork.mjs --id canvas-page --in canvas.jpg
node scripts/pack-artwork.mjs --verify canvas-page
```

| slot          | pixels    | used by                                                        |
| ------------- | --------- | -------------------------------------------------------------- |
| `hero-night`  | 1200×1024 | `assets/banner.svg` — the banner crop, sharp, watermarked       |
| `canvas-page` | 640×1138  | vertical window in `telemetry/about/footer` — the page backdrop |

`canvas-page` is the whole artwork. Every wide card draws the same image at the
same scale and only shifts its window, so the sections together read as a single
sheet running down the page:

| card        | canvas offset | card height |
| ----------- | ------------- | ----------- |
| `telemetry` | 300           | 560         |
| `about`     | 599           | 290         |
| `footer`    | 754           | 160         |

Offsets live in `CANVAS_OFFSETS` in `render.mjs`; add a card by giving it the
offset that continues the previous one.

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
* Rotation: repack both slots with the new key, commit, then update the secret.
  Old ciphertext simply stops authenticating against the new key.
* A missing key is not fatal: artwork cards are skipped and the previously
  committed files stay in place. An *invalid* blob is fatal, and the run stops
  before anything is committed.

## What is and is not public

Ciphertext is committed; decrypted artwork is not. The rendered cards have to be
public — GitHub displays them as plain images — so the pixels inside them can
always be extracted by anyone who opens the profile. Two measures apply:

* the published derivatives are downscaled and watermarked, and the
  full-resolution original is not stored in this repository;
* every card additionally paints a diagonal `blueokanna` mark
  (`watermarkDefs` / `watermarkRect` in `lib/svg.mjs`) over the artwork, so a
  cropped or re-hosted copy still carries the attribution.

## Telemetry data

`lib/github.mjs` collects, in order of preference:

| value                          | source                                                       |
| ------------------------------ | ------------------------------------------------------------ |
| stars, forks                   | `/users/:login/repos` (owner repos only, forks excluded)      |
| commits, PRs, issues           | GraphQL `contributionsCollection`, else the REST search index |
| repositories, followers, since | `/users/:login`                                               |
| languages                      | `/repos/:owner/:name/languages` over the largest 40 repos     |

A metric that could not be fetched stays `null` and its row is omitted from the
card; nothing is cached, estimated or defaulted to zero.
