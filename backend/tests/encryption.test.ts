import { describe, it, expect } from 'vitest';

import { encryptSecret, decryptSecret } from '../src/utils/crypto.js';

describe('crypto', () => {
  it('encrypts and decrypts secrets', () => {
    const plain = 'secret-pass';
    const encrypted = encryptSecret(plain);
    const decrypted = decryptSecret(encrypted.encrypted, encrypted.iv, encrypted.tag);
    expect(decrypted).toBe(plain);
  });
});
