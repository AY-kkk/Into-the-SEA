import { createHmac, timingSafeEqual } from 'node:crypto';
import { getAuthSecret } from '@/lib/env';

export const SESSION_COOKIE = 'its_session';

/** 用 HMAC-SHA256 对 sessionId 签名，格式 `value.signature`（base64url）。 */
export function signValue(value: string): string {
  const sig = createHmac('sha256', getAuthSecret()).update(value).digest('base64url');
  return `${value}.${sig}`;
}

/** 校验签名并返回原始 value；非法返回 null。 */
export function verifySignedValue(signed: string | undefined): string | null {
  if (!signed) return null;
  const idx = signed.lastIndexOf('.');
  if (idx <= 0) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = createHmac('sha256', getAuthSecret()).update(value).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? value : null;
}
