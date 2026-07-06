import { createId } from '@/lib/utils';
import {
  generateNext,
  generateOpening,
  generateReport,
} from '@/services/interview.service';
import type {
  InterviewConfig,
  InterviewMessage,
  InterviewReport,
  InterviewSession,
} from '@/types/interview';
import type { InterviewEngine } from '../types';
import { InMemorySessionStore, type SessionStore } from './session-store';

/**
 * 默认面试引擎：实现 InterviewEngine 抽象。
 * 会话状态委托给 SessionStore（默认内存，可替换 Prisma/Redis 实现持久化）。
 * 问题/报告生成委托给 interview.service（底层 LLMProvider）。
 */
export class DefaultInterviewEngine implements InterviewEngine {
  readonly name = 'default-interview-engine';

  constructor(private readonly store: SessionStore = new InMemorySessionStore()) {}

  async startSession(config: InterviewConfig): Promise<InterviewSession> {
    const opening = await generateOpening(config);
    const now = new Date().toISOString();
    const session: InterviewSession = {
      id: createId('sess'),
      config,
      status: 'active',
      messages: [opening],
      createdAt: now,
      updatedAt: now,
    };
    await this.store.save(session);
    return session;
  }

  async generateNextQuestion(
    sessionId: string,
    userAnswer?: string,
  ): Promise<InterviewMessage> {
    const session = await this.store.get(sessionId);
    if (!session) throw new Error(`[InterviewEngine] 会话不存在：${sessionId}`);

    if (userAnswer && userAnswer.trim()) {
      session.messages.push({
        id: createId('msg'),
        role: 'candidate',
        content: userAnswer,
        createdAt: new Date().toISOString(),
      });
    }

    const next = await generateNext(session.config, session.messages);
    session.messages.push(next);
    session.updatedAt = new Date().toISOString();
    await this.store.save(session);
    return next;
  }

  async summarizeSession(sessionId: string): Promise<InterviewReport> {
    const session = await this.store.get(sessionId);
    if (!session) throw new Error(`[InterviewEngine] 会话不存在：${sessionId}`);
    const report = await generateReport(session.config, session.messages);
    report.sessionId = sessionId;
    session.report = report;
    session.status = 'completed';
    session.updatedAt = new Date().toISOString();
    await this.store.save(session);
    return report;
  }
}
