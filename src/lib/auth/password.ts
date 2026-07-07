import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;
const N = 16384; // scrypt cost（安全/性能平衡）

function scrypt(password: string, salt: Buffer, keylen: number, cost: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, { N: cost }, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

/**
 * 使用 Node 内置 scrypt 对密码加盐哈希。
 * 存储格式：`scrypt$N$saltHex$hashHex`，无外部依赖、无网络安装成本。
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEYLEN, N);
  return `scrypt$${N}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/** 校验明文密码是否匹配存储的哈希（恒定时间比较，防时序攻击）。 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'scrypt') return false;
  const n = Number(parts[1]);
  const salt = Buffer.from(parts[2] ?? '', 'hex');
  const expected = Buffer.from(parts[3] ?? '', 'hex');
  if (!Number.isFinite(n) || salt.length === 0 || expected.length === 0) return false;
  const derived = await scrypt(password, salt, expected.length, n);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
