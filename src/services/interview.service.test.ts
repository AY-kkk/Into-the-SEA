import { describe, expect, it } from 'vitest';
import {
  askedCount,
  generateNext,
  generateOpening,
  generateReport,
} from './interview.service';
import type { InterviewConfig, InterviewMessage } from '@/types/interview';

const config: InterviewConfig = {
  positionId: 'national-admin',
  positionName: '国考综合管理岗',
  mode: 'structured',
  questionCount: 5,
};

describe('interview.service', () => {
  it('generates an opening interviewer question', async () => {
    const msg = await generateOpening(config);
    expect(msg.role).toBe('interviewer');
    expect(msg.content.length).toBeGreaterThan(0);
  });

  it('generates a follow-up that references the previous interviewer msg', async () => {
    const opening = await generateOpening(config);
    const history: InterviewMessage[] = [
      opening,
      {
        id: 'a1',
        role: 'candidate',
        content: '我在校期间组织过大型活动。',
        createdAt: new Date().toISOString(),
      },
    ];
    const next = await generateNext(config, history);
    expect(next.role).toBe('interviewer');
    expect(next.followUpOf).toBe(opening.id);
  });

  it('counts asked interviewer questions', () => {
    const messages: InterviewMessage[] = [
      { id: '1', role: 'interviewer', content: 'q1', createdAt: '' },
      { id: '2', role: 'candidate', content: 'a1', createdAt: '' },
      { id: '3', role: 'interviewer', content: 'q2', createdAt: '' },
    ];
    expect(askedCount(messages)).toBe(2);
  });

  it('generates a multi-dimension report', async () => {
    const messages: InterviewMessage[] = [
      { id: '1', role: 'interviewer', content: '请自我介绍', createdAt: '' },
      { id: '2', role: 'candidate', content: '我是...', createdAt: '' },
    ];
    const report = await generateReport(config, messages);
    expect(report.overallScore).toBeGreaterThan(0);
    expect(report.scores.length).toBeGreaterThan(0);
    expect(report.summary.length).toBeGreaterThan(0);
  });
});
