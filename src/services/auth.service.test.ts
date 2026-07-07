import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'its-auth-'));
  process.env.ITS_RUNTIME_DIR = dir;
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
  delete process.env.ITS_RUNTIME_DIR;
});

// 动态导入，确保 env 已设置且 store 单例可重置
async function fresh() {
  const store = await import('@/lib/auth/store');
  store.__resetAuthStore();
  return import('@/services/auth.service');
}

describe('auth.service (file store)', () => {
  beforeEach(async () => {
    // 每个用例用独立邮箱避免冲突
  });

  it('registers a user and creates a session', async () => {
    const svc = await fresh();
    const { user, session } = await svc.register({
      email: 'Alice@Example.com',
      name: 'Alice',
      password: 'password123',
    });
    expect(user.email).toBe('alice@example.com');
    expect(session.id).toBeTruthy();
    expect(session.userId).toBe(user.id);
  });

  it('rejects duplicate email', async () => {
    const svc = await fresh();
    await svc.register({ email: 'dup@example.com', name: 'D', password: 'password123' });
    await expect(
      svc.register({ email: 'dup@example.com', name: 'D2', password: 'password123' }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
  });

  it('logs in with correct credentials and rejects wrong password', async () => {
    const svc = await fresh();
    await svc.register({ email: 'bob@example.com', name: 'Bob', password: 'password123' });
    const { user } = await svc.login({ email: 'bob@example.com', password: 'password123' });
    expect(user.email).toBe('bob@example.com');
    await expect(svc.login({ email: 'bob@example.com', password: 'nope' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('resolves user by session and returns null after logout', async () => {
    const svc = await fresh();
    const { session } = await svc.register({
      email: 'carol@example.com',
      name: 'Carol',
      password: 'password123',
    });
    const u = await svc.getUserBySession(session.id);
    expect(u?.email).toBe('carol@example.com');
    await svc.logout(session.id);
    expect(await svc.getUserBySession(session.id)).toBeNull();
  });

  it('reset password lets user log in with new password', async () => {
    const svc = await fresh();
    await svc.register({ email: 'dave@example.com', name: 'Dave', password: 'oldpassword' });
    await svc.resetPassword({ email: 'dave@example.com', newPassword: 'newpassword1' });
    await expect(
      svc.login({ email: 'dave@example.com', password: 'oldpassword' }),
    ).rejects.toThrow();
    const { user } = await svc.login({ email: 'dave@example.com', password: 'newpassword1' });
    expect(user.email).toBe('dave@example.com');
  });

  it('reset password for unknown email does not throw (no enumeration)', async () => {
    const svc = await fresh();
    await expect(
      svc.resetPassword({ email: 'ghost@example.com', newPassword: 'whatever1' }),
    ).resolves.toBeUndefined();
  });
});
