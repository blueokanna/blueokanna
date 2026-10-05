/**
 * AES-256-GCM container for published artwork.
 *
 * Layout (little-endian-free, all fields byte aligned):
 *
 *   0  4   magic        "BKA1"
 *   4  1   version      0x01
 *   5  1   cipher id    0x01 = AES-256-GCM
 *   6  1   iv length    0x0c (12)
 *   7  1   tag length   0x10 (16)
 *   8  12  iv          unique per seal, never reused
 *  20  16  tag         GCM authentication tag
 *  36  ..  ciphertext
 *
 * The additional authenticated data is `BKA1|<asset id>|v1`, which binds a blob
 * to the slot it was written for: swapping two encrypted files, or renaming one,
 * makes authentication fail instead of silently decrypting the wrong artwork.
 *
 * The key lives only in the ARTWORK_AES_KEY secret; it is never written to the
 * repository, to a log line, or to a file. Only ciphertext is committed.
 */

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';

export const MAGIC = Buffer.from('BKA1', 'ascii');
export const VERSION = 1;
export const CIPHER_AES_256_GCM = 1;
export const IV_BYTES = 12;
export const TAG_BYTES = 16;
export const KEY_BYTES = 32;
export const HEADER_BYTES = 8;
export const MIN_CONTAINER_BYTES = HEADER_BYTES + IV_BYTES + TAG_BYTES;

const ASSET_ID = /^[a-z0-9][a-z0-9-]{0,62}$/;

/** Validates an asset id before it is used as a filename or as AAD. */
export function assertAssetId(assetId) {
  if (typeof assetId !== 'string' || !ASSET_ID.test(assetId)) {
    throw new Error(`invalid asset id ${JSON.stringify(assetId)} (expected [a-z0-9-], max 63 chars)`);
  }
  return assetId;
}

/**
 * Parses the 64 character hex key.
 *
 * Strings that are not exactly 32 bytes once decoded are rejected, so a
 * truncated secret fails loudly at startup instead of producing artwork that
 * can never be decrypted again.
 */
export function parseKey(raw) {
  const hex = String(raw ?? '').trim();
  if (hex.length !== KEY_BYTES * 2 || !/^[0-9a-f]+$/i.test(hex)) {
    throw new Error(`ARTWORK_AES_KEY must be ${KEY_BYTES * 2} hex characters (${KEY_BYTES} bytes), got ${hex.length}`);
  }
  return Buffer.from(hex, 'hex');
}

function aad(assetId) {
  return Buffer.from(`BKA1|${assetId}|v1`, 'utf8');
}

/** Encrypts plaintext into a versioned container bound to `assetId`. */
export function seal(key, assetId, plaintext) {
  assertAssetId(assetId);
  if (!Buffer.isBuffer(plaintext) || plaintext.length === 0) {
    throw new Error('plaintext must be a non-empty buffer');
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: TAG_BYTES });
  cipher.setAAD(aad(assetId));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  const header = Buffer.alloc(HEADER_BYTES);
  MAGIC.copy(header, 0);
  header[4] = VERSION;
  header[5] = CIPHER_AES_256_GCM;
  header[6] = IV_BYTES;
  header[7] = TAG_BYTES;

  return Buffer.concat([header, iv, tag, ciphertext]);
}

/**
 * Decrypts a container produced by {@link seal}.
 *
 * Fails closed: a bad magic byte, an unexpected cipher, a truncated blob or a
 * failed authentication tag all raise instead of returning partial bytes.
 */
export function open(key, assetId, container) {
  assertAssetId(assetId);
  if (!Buffer.isBuffer(container) || container.length < MIN_CONTAINER_BYTES) {
    throw new Error(`container for ${assetId} is truncated (${container?.length ?? 0} bytes)`);
  }
  if (!timingSafeEqual(container.subarray(0, 4), MAGIC)) {
    throw new Error(`container for ${assetId} has a bad magic header`);
  }
  if (container[4] !== VERSION) {
    throw new Error(`container for ${assetId} uses unsupported version ${container[4]}`);
  }
  if (container[5] !== CIPHER_AES_256_GCM) {
    throw new Error(`container for ${assetId} uses unsupported cipher id ${container[5]}`);
  }
  if (container[6] !== IV_BYTES || container[7] !== TAG_BYTES) {
    throw new Error(`container for ${assetId} has unexpected iv/tag lengths`);
  }

  const iv = container.subarray(HEADER_BYTES, HEADER_BYTES + IV_BYTES);
  const tag = container.subarray(HEADER_BYTES + IV_BYTES, MIN_CONTAINER_BYTES);
  const ciphertext = container.subarray(MIN_CONTAINER_BYTES);

  const decipher = createDecipheriv('aes-256-gcm', key, iv, { authTagLength: TAG_BYTES });
  decipher.setAAD(aad(assetId), { plaintextLength: ciphertext.length });
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    // The underlying error text can leak lengths; surface one stable message.
    throw new Error(`authentication failed for ${assetId} — wrong ARTWORK_AES_KEY or tampered blob`);
  }
}

/** Reads the plaintext length recorded by the header arithmetic. */
export function containerInfo(container) {
  return {
    version: container[4],
    cipher: container[5],
    ivBytes: container[6],
    tagBytes: container[7],
    ciphertextBytes: Math.max(0, container.length - MIN_CONTAINER_BYTES),
  };
}
