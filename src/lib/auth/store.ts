import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createId } from '@/lib/utils';
import { env, shouldUseDbForAuth } from '@/lib/env';
import type { Session, User } from '@/types/user';

/** 用户 + 会话存储抽象：DB（Prisma）与文件（无数据库环境）双实现。 */
export interface AuthStore {
  createUser(input: { email: string; name: string; passwordHash: string }): Promise<User>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  findById(id: string): Promise<User | null>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  updatePlan(userId: string, plan: 'free' | 'pro'): Promise<User | null>;
  createSession(userId: string, ttlDays: number): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;
}

// ── 文件实现（默认，无数据库时的真实持久化）──
interface FileShape {
  users: Array<User & { passwordHash: string }>;
  sessions: Session[];
}

const DATA_DIR = process.env.ITS_RUNTIME_DIR ?? join(process.cwd(), 'data', 'runtime');
const FILE = join(DATA_DIR, 'auth.json');

function readFile(): FileShape {
  try {
    if (!existsSync(FILE)) return { users: [], sessions: [] };
    return JSON.parse(readFileSync(FILE, 'utf-8')) as FileShape;
  } catch {
    return { users: [], sessions: [] };
  }
}

function writeFile(data: FileShape): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

class FileAuthStore implements AuthStore {
  async createUser(input: { email: string; name: string; passwordHash: string }): Promise<User> {
    const data = readFile();
    const user: User & { passwordHash: string } = {
      id: createId('usr'),
      email: input.email.toLowerCase(),
      name: input.name,
      plan: 'free',
      passwordHash: input.passwordHash,
      createdAt: new Date().toISOString(),
    };
    data.users.push(user);
    writeFile(data);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.createdAt,
    };
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const u = readFile().users.find((x) => x.email === email.toLowerCase());
    return u ? { ...u, plan: u.plan ?? 'free' } : null;
  }

  async findById(id: string): Promise<User | null> {
    const u = readFile().users.find((x) => x.id === id);
    return u
      ? { id: u.id, email: u.email, name: u.name, plan: u.plan ?? 'free', createdAt: u.createdAt }
      : null;
  }

  async updatePlan(userId: string, plan: 'free' | 'pro'): Promise<User | null> {
    const data = readFile();
    const u = data.users.find((x) => x.id === userId);
    if (!u) return null;
    u.plan = plan;
    writeFile(data);
    return { id: u.id, email: u.email, name: u.name, plan: u.plan, createdAt: u.createdAt };
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const data = readFile();
    const u = data.users.find((x) => x.id === userId);
    if (u) {
      u.passwordHash = passwordHash;
      writeFile(data);
    }
  }

  async createSession(userId: string, ttlDays: number): Promise<Session> {
    const data = readFile();
    const now = Date.now();
    const session: Session = {
      id: createId('sess'),
      userId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttlDays * 86_400_000).toISOString(),
    };
    // 顺带清理过期会话
    data.sessions = data.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
    data.sessions.push(session);
    writeFile(data);
    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    const s = readFile().sessions.find((x) => x.id === id);
    if (!s) return null;
    if (new Date(s.expiresAt).getTime() <= Date.now()) return null;
    return s;
  }

  async deleteSession(id: string): Promise<void> {
    const data = readFile();
    data.sessions = data.sessions.filter((s) => s.id !== id);
    writeFile(data);
  }
}

// ── Prisma 实现（DATA_SOURCE=db 时）──
class PrismaAuthStore implements AuthStore {
  private async db() {
    const { prisma } = await import('@/lib/db/prisma');
    return prisma;
  }

  async createUser(input: { email: string; name: string; passwordHash: string }): Promise<User> {
    const db = await this.db();
    const u = await db.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash: input.passwordHash,
      },
    });
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      plan: (u.plan as 'free' | 'pro') ?? 'free',
      createdAt: u.createdAt.toISOString(),
    };
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const db = await this.db();
    const u = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    return u
      ? {
          id: u.id,
          email: u.email,
          name: u.name,
          plan: (u.plan as 'free' | 'pro') ?? 'free',
          passwordHash: u.passwordHash,
          createdAt: u.createdAt.toISOString(),
        }
      : null;
  }

  async findById(id: string): Promise<User | null> {
    const db = await this.db();
    const u = await db.user.findUnique({ where: { id } });
    return u
      ? {
          id: u.id,
          email: u.email,
          name: u.name,
          plan: (u.plan as 'free' | 'pro') ?? 'free',
          createdAt: u.createdAt.toISOString(),
        }
      : null;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    const db = await this.db();
    await db.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async updatePlan(userId: string, plan: 'free' | 'pro'): Promise<User | null> {
    const db = await this.db();
    const u = await db.user.update({ where: { id: userId }, data: { plan } });
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      plan: (u.plan as 'free' | 'pro') ?? 'free',
      createdAt: u.createdAt.toISOString(),
    };
  }

  async createSession(userId: string, ttlDays: number): Promise<Session> {
    const db = await this.db();
    const s = await db.session.create({
      data: { userId, expiresAt: new Date(Date.now() + ttlDays * 86_400_000) },
    });
    return {
      id: s.id,
      userId: s.userId,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    };
  }

  async getSession(id: string): Promise<Session | null> {
    const db = await this.db();
    const s = await db.session.findUnique({ where: { id } });
    if (!s || s.expiresAt.getTime() <= Date.now()) return null;
    return {
      id: s.id,
      userId: s.userId,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    };
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.db();
    await db.session.delete({ where: { id } }).catch(() => undefined);
  }
}

let store: AuthStore | null = null;

/** 工厂：DATA_SOURCE=db 用 Prisma，否则文件持久化（均为服务端真实持久化）。 */
export function getAuthStore(): AuthStore {
  if (!store) store = shouldUseDbForAuth() ? new PrismaAuthStore() : new FileAuthStore();
  return store;
}

/** 测试用：重置单例。 */
export function __resetAuthStore(): void {
  store = null;
}

export const SESSION_TTL_DAYS = env.SESSION_TTL_DAYS;
