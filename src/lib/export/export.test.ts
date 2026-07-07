import { describe, expect, it } from 'vitest';
import { interviewReportToMarkdown, wrongBookToMarkdown } from './index';
import type { InterviewReport } from '@/types/interview';
import type { WrongQuestion } from '@/types/question';

describe('export to markdown', () => {
  const report: InterviewReport = {
    sessionId: 's1',
    overallScore: 82,
    scores: [{ dimension: '综合分析', score: 84, comment: '条理清晰' }],
    strengths: ['逻辑清晰'],
    improvements: ['补充量化'],
    summary: '整体表现良好。',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders interview report with score, dimensions, strengths', () => {
    const md = interviewReportToMarkdown(report, '综合管理');
    expect(md).toContain('# 模拟面试报告 · 综合管理');
    expect(md).toContain('综合得分：**82**');
    expect(md).toContain('| 综合分析 | 84 | 条理清晰 |');
    expect(md).toContain('- 逻辑清晰');
    expect(md).toContain('- 补充量化');
  });

  it('renders wrong book with snapshot answer & explanation', () => {
    const wrong: WrongQuestion[] = [
      {
        questionId: 'q1',
        wrongCount: 2,
        lastWrongAt: '2026-01-02T00:00:00.000Z',
        mastered: false,
        snapshot: { id: 'q1', type: 'verbal', stem: '题干A', answer: 'B', explanation: '因为B' },
      },
    ];
    const md = wrongBookToMarkdown(wrong);
    expect(md).toContain('# 错题本导出');
    expect(md).toContain('错题总数：1');
    expect(md).toContain('题干A');
    expect(md).toContain('正确答案：**B**');
    expect(md).toContain('因为B');
  });

  it('handles empty sections gracefully', () => {
    const md = interviewReportToMarkdown({
      ...report,
      scores: [],
      strengths: [],
      improvements: [],
    });
    expect(md).toContain('# 模拟面试报告');
    expect(md).not.toContain('## 分维度评分');
  });
});
