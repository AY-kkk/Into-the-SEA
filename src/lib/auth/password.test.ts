import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
  it('hashes with scrypt$ format and salt (not plaintext)', async () => {
    const hash = await hashPassword('correct-horse-battery');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(hash).not.toContain('correct-horse-battery');
    expect(hash.split('$')).toHaveLength(4);
  });

  it('verifies the correct password', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(await verifyPassword('s3cret-pass', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(await verifyPassword('wrong-pass', hash)).toBe(false);
  });

  it('produces different hashes for same password (random salt)', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    expect(a).not.toEqual(b);
  });

  it('rejects malformed stored hash', async () => {
    expect(await verifyPassword('x', 'not-a-valid-hash')).toBe(false);
  });
});
