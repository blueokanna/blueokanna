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
node scripts/render.mjs --only about,footer              # skip artwork-dependent cards
```

Without `GITHUB_TOKEN` the telemetry card still renders, but the contribution
counts come from the unauthenticated search index (rate limited) instead of the
GraphQL contributions collection. Every write goes through a temp file and a
rename, so a crashed run cannot leave a half-written card in `assets/`.

## The artwork

Two encrypted slots. Both are decrypted in memory only — no plaintext image is
ever written into the working tree, and the workflow's guard step fails the run
if any image file ever becomes tracked.

```bash
IMAGE_AES_DECRYPT=<hex> node scripts/pack-artwork.mjs --id hero-night    --in hero.jpg
IMAGE_AES_DECRYPT=<hex> node scripts/pack-artwork.mjs --id backdrop-tail --in tail.jpg
node scripts/pack-artwork.mjs --verify backdrop-tail
```

| slot            | pixels    | used by                                       |
| --------------- | --------- | --------------------------------------------- |
| `hero-night`    | 1200×1025 | `assets/banner.svg` — source rows 164…820      |
| `backdrop-tail` | 1176×835  | window in `telemetry/about/footer` — rows 820…1365 |

### How the page backdrop stays continuous

Source rows 164…1365 are rendered once at a single magnification (×1.5625) and
split across the four cards, so scrolling the profile walks down one image:

| card        | rows shown | card height | tail offset |
| ----------- | ---------- | ----------- | ----------- |
| `banner`    | 164…820    | 1025        | —           |
| `telemetry` | 820…1122   | 470         | 0           |
| `about`     | 1122…1279  | 220         | 470         |
| `footer`    | 1279…1365  | 145         | 690         |

The tail derivative is already at card scale, so a card only slides its window;
`TAIL_OFFSETS` in `lib/config.mjs` is the whole relay and each offset is the
previous offset plus the previous card's height. Changing a card height means
updating the offsets below it — they are intended to be read together.

### Softening policy

* `hero-night` is sampled at 97 % (a 3 % softening) so the banner stays crisp.
* `backdrop-tail` is sampled at 95 % (a 5 % softening).
* `about` and `footer` add `feGaussianBlur stdDeviation="2.5"` over their
  window — a 5 % blur at card scale. The telemetry card draws the backdrop
  sharp, because it carries the densest text.

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

Ciphertext is committed; decrypted artwork is not. The rendered cards, however,
cannot be encrypted — GitHub hands them to the browser as ordinary images, so
anyone who opens the profile can save the pixels they contain. That is a
property of the platform, not of this pipeline. Three measures apply instead:

* the full-resolution original is not in this repository at all;
* the published derivatives are downscaled and carry a baked-in credit plate;
* every card additionally paints a diagonal `blueokanna` mark
  (`watermarkDefs` / `watermarkRect` in `lib/svg.mjs`) over the artwork, so a
  cropped or re-hosted copy still carries the attribution.

The `Guard against plaintext artwork` step in the workflow keeps the first
promise honest: if an image file ever becomes tracked, the run fails.

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
