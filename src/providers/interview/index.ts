import { DefaultInterviewEngine } from './engine';
import { InMemorySessionStore, type SessionStore } from './session-store';
import type { InterviewEngine } from '../types';

// 单例内存存储：在同一进程内保持会话（开发/单实例部署）。
// 真实多实例部署应替换为 PrismaSessionStore / Redis（见 session-store.ts）。
const globalForEngine = globalThis as unknown as {
  interviewStore: SessionStore | undefined;
};
const store = globalForEngine.interviewStore ?? new InMemorySessionStore();
if (process.env.NODE_ENV !== 'production') globalForEngine.interviewStore = store;

export function getInterviewEngine(): InterviewEngine {
  return new DefaultInterviewEngine(store);
}

export { DefaultInterviewEngine } from './engine';
export * from './session-store';
