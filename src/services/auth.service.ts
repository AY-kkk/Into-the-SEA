import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { getAuthStore, SESSION_TTL_DAYS } from '@/lib/auth/store';
import type { Session, User } from '@/types/user';

export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: 'EMAIL_TAKEN' | 'INVALID_CREDENTIALS' | 'NOT_FOUND',
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** 注册：校验邮箱唯一性 → 加密存储密码 → 建会话。 */
export async function register(input: {
  email: string;
  name: string;
  password: string;
}): Promise<{ user: User; session: Session }> {
  const store = getAuthStore();
  const existing = await store.findByEmail(input.email);
  if (existing) throw new AuthError('该邮箱已注册', 'EMAIL_TAKEN');
  const passwordHash = await hashPassword(input.password);
  const user = await store.createUser({
    email: input.email,
    name: input.name,
    passwordHash,
  });
  const session = await store.createSession(user.id, SESSION_TTL_DAYS);
  return { user, session };
}

/** 登录：核对密码（恒定时间）→ 建会话。 */
export async function login(input: {
  email: string;
  password: string;
}): Promise<{ user: User; session: Session }> {
  const store = getAuthStore();
  const found = await store.findByEmail(input.email);
  if (!found) throw new AuthError('邮箱或密码错误', 'INVALID_CREDENTIALS');
  const ok = await verifyPassword(input.password, found.passwordHash);
  if (!ok) throw new AuthError('邮箱或密码错误', 'INVALID_CREDENTIALS');
  const session = await store.createSession(found.id, SESSION_TTL_DAYS);
  const user: User = {
    id: found.id,
    email: found.email,
    name: found.name,
    plan: found.plan,
    createdAt: found.createdAt,
  };
  return { user, session };
}

/** 登出：删除会话。 */
export async function logout(sessionId: string): Promise<void> {
  await getAuthStore().deleteSession(sessionId);
}

/** 由 sessionId 解析当前用户（会话过期/不存在返回 null）。 */
export async function getUserBySession(sessionId: string): Promise<User | null> {
  const store = getAuthStore();
  const session = await store.getSession(sessionId);
  if (!session) return null;
  return store.findById(session.userId);
}

/**
 * 重置密码（MVP：邮箱直连重置，不发信；真实场景应发带签名 token 的邮件）。
 * TODO(real): 接入邮件发送 + 一次性重置 token（当前直接校验邮箱存在后允许重置）。
 */
export async function resetPassword(input: { email: string; newPassword: string }): Promise<void> {
  const store = getAuthStore();
  const found = await store.findByEmail(input.email);
  // 不暴露邮箱是否存在（防枚举）：找不到也返回成功。
  if (!found) return;
  const passwordHash = await hashPassword(input.newPassword);
  await store.updatePassword(found.id, passwordHash);
}
