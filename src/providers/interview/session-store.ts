import type { InterviewSession } from '@/types/interview';

/** 会话存储抽象：便于在内存 / 数据库 / Redis 间切换。 */
export interface SessionStore {
  get(id: string): Promise<InterviewSession | undefined>;
  save(session: InterviewSession): Promise<void>;
  delete(id: string): Promise<void>;
}

/** 内存实现（默认，进程内持久，用于开发与无数据库环境）。 */
export class InMemorySessionStore implements SessionStore {
  private readonly map = new Map<string, InterviewSession>();

  async get(id: string): Promise<InterviewSession | undefined> {
    return this.map.get(id);
  }
  async save(session: InterviewSession): Promise<void> {
    this.map.set(session.id, session);
  }
  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }
}

/**
 * Prisma 会话存储骨架（真实持久化）。
 * TODO(real): 使用 InterviewSession / InterviewMessage 表实现读写；
 * report 存 JSON 字段。当前抛错以提示未接入。
 */
export class PrismaSessionStore implements SessionStore {
  async get(_id: string): Promise<InterviewSession | undefined> {
    // TODO(real): prisma.interviewSession.findUnique({ include: { messages: true } })
    throw new Error('[PrismaSessionStore] 尚未接入数据库（TODO）');
  }
  async save(_session: InterviewSession): Promise<void> {
    // TODO(real): upsert session + messages
    throw new Error('[PrismaSessionStore] 尚未接入数据库（TODO）');
  }
  async delete(_id: string): Promise<void> {
    throw new Error('[PrismaSessionStore] 尚未接入数据库（TODO）');
  }
}
