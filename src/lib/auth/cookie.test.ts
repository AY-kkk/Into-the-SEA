import { describe, expect, it } from 'vitest';
import { signValue, verifySignedValue } from './cookie';

describe('signed cookie values', () => {
  it('round-trips a signed value', () => {
    const signed = signValue('sess_123');
    expect(signed).toContain('.');
    expect(verifySignedValue(signed)).toBe('sess_123');
  });

  it('rejects tampered value', () => {
    const signed = signValue('sess_123');
    const tampered = signed.replace('sess_123', 'sess_999');
    expect(verifySignedValue(tampered)).toBeNull();
  });

  it('rejects missing/invalid input', () => {
    expect(verifySignedValue(undefined)).toBeNull();
    expect(verifySignedValue('no-signature')).toBeNull();
  });
});
