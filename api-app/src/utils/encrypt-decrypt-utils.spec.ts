import { encrypt, decrypt } from './encrypt-decrypt-utils';

describe('encrypt-decrypt-utils', () => {
  const secret = 'test-secret-key';

  it('round-trips a value through encrypt/decrypt', () => {
    const plaintext = 'appointment-uid-123';
    const cipher = encrypt(plaintext, secret);

    expect(cipher).toContain('.');
    expect(decrypt(cipher, secret)).toBe(plaintext);
  });

  it('uses a fresh IV per call so identical inputs differ', () => {
    const first = encrypt('same-value', secret);
    const second = encrypt('same-value', secret);

    expect(first).not.toBe(second);
    expect(decrypt(first, secret)).toBe('same-value');
    expect(decrypt(second, secret)).toBe('same-value');
  });
});
