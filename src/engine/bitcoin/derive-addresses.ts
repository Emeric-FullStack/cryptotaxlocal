/**
 * BIP84 address derivation from zpub (native SegWit)
 *
 * Derives bc1q receiving addresses from a BIP84 extended public key (zpub).
 * Uses @scure/bip32 + @scure/base + @noble/hashes — pure ESM, zero Node.js polyfills.
 */
import { HDKey } from '@scure/bip32';
import { base58check, bech32 } from '@scure/base';
import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';

// Version bytes for extended public keys
const ZPUB_VERSION = new Uint8Array([0x04, 0xb2, 0x47, 0x46]);
const XPUB_VERSION = new Uint8Array([0x04, 0x88, 0xb2, 0x1e]);

const b58c = base58check(sha256);

/**
 * Convert zpub (BIP84) to xpub (BIP32) by swapping version bytes.
 * HDKey only understands xpub — this bridges the gap.
 */
function zpubToXpub(zpub: string): string {
  const decoded = b58c.decode(zpub); // 78 bytes: 4 version + 74 data

  // Sanity check: first 4 bytes must match zpub version
  const version = decoded.slice(0, 4);
  if (
    version[0] !== ZPUB_VERSION[0] ||
    version[1] !== ZPUB_VERSION[1] ||
    version[2] !== ZPUB_VERSION[2] ||
    version[3] !== ZPUB_VERSION[3]
  ) {
    throw new Error(
      'Invalid zpub: expected version bytes 0x04b24746, got 0x' +
        Array.from(version)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
    );
  }

  // Swap version bytes: zpub → xpub
  const modified = new Uint8Array(decoded.length);
  modified.set(XPUB_VERSION, 0);
  modified.set(decoded.slice(4), 4);

  return b58c.encode(modified);
}

/**
 * HASH160 = RIPEMD160(SHA256(data))
 * Standard Bitcoin hash for pubkey → address conversion.
 */
function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

/**
 * Compressed public key → native SegWit (bech32) address.
 * Witness version 0, 20-byte pubkey hash.
 */
function pubkeyToBech32Address(pubkey: Uint8Array): string {
  const h = hash160(pubkey);
  const words = bech32.toWords(h);
  // Witness version 0 prepended to the words array
  return bech32.encode('bc', [0, ...words]);
}

export interface DerivedAddress {
  index: number;
  path: string;
  address: string;
}

/**
 * Derive BIP84 native SegWit receiving addresses from a zpub.
 *
 * The zpub is assumed to be at depth m/84'/0'/0'.
 * We derive m/0/i (receiving chain) for i = 0..count-1.
 *
 * @param zpub - BIP84 extended public key (starts with "zpub")
 * @param count - Number of addresses to derive (default: 20)
 * @returns Array of derived addresses with metadata
 */
export function deriveAddressesFromZpub(
  zpub: string,
  count: number = 20
): DerivedAddress[] {
  const xpub = zpubToXpub(zpub);
  const root = HDKey.fromExtendedKey(xpub);

  // Derive the receiving chain (m/0)
  const receivingChain = root.deriveChild(0);

  const addresses: DerivedAddress[] = [];

  for (let i = 0; i < count; i++) {
    const child = receivingChain.deriveChild(i);

    if (!child.publicKey) {
      throw new Error(`Failed to derive public key at index ${i}`);
    }

    addresses.push({
      index: i,
      path: `m/0/${i}`,
      address: pubkeyToBech32Address(child.publicKey),
    });
  }

  return addresses;
}
