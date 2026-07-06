import { describe, expect, it } from 'vitest';
import { DefaultInterviewEngine } from './engine';
import { InMemorySessionStore } from './session-store';
import type { InterviewConfig } from '@/types/interview';

const config: InterviewConfig = {
  positionId: 'soe-management-trainee',
  positionName: '国企管培生',
  mode: 'behavioral',
  questionCount: 4,
};

describe('DefaultInterviewEngine (persistence)', () => {
  it('starts, advances and summarizes a persisted session', async () => {
    const store = new InMemorySessionStore();
    const engine = new DefaultInterviewEngine(store);

    const session = await engine.startSession(config);
    expect(session.messages.length).toBe(1);
    expect(session.status).toBe('active');

    // 会话已持久化到 store
    const stored = await store.get(session.id);
    expect(stored).toBeDefined();

    const next = await engine.generateNextQuestion(session.id, '我主导过校园招聘项目。');
    expect(next.role).toBe('interviewer');

    const afterAnswer = await store.get(session.id);
    // opening + candidate + next = 3
    expect(afterAnswer!.messages.length).toBe(3);

    const report = await engine.summarizeSession(session.id);
    expect(report.sessionId).toBe(session.id);

    const completed = await store.get(session.id);
    expect(completed!.status).toBe('completed');
    expect(completed!.report).toBeDefined();
  });

  it('throws for unknown session', async () => {
    const engine = new DefaultInterviewEngine(new InMemorySessionStore());
    await expect(engine.generateNextQuestion('nope')).rejects.toThrow();
  });
});
