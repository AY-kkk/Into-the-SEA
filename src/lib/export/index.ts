'use client';

import type { InterviewReport } from '@/types/interview';
import type { WrongQuestion } from '@/types/question';

/** 触发浏览器下载一个文本文件。 */
export function downloadTextFile(filename: string, content: string, mime = 'text/markdown'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** 将面试报告渲染为 Markdown。 */
export function interviewReportToMarkdown(report: InterviewReport, positionName?: string): string {
  const lines: string[] = [];
  lines.push(`# 模拟面试报告${positionName ? ` · ${positionName}` : ''}`);
  lines.push('');
  lines.push(`- 综合得分：**${report.overallScore}**`);
  lines.push(`- 生成时间：${new Date(report.createdAt).toLocaleString('zh-CN')}`);
  lines.push('');
  lines.push('## 总体评价');
  lines.push(report.summary || '—');
  lines.push('');
  if (report.scores.length) {
    lines.push('## 分维度评分');
    lines.push('');
    lines.push('| 维度 | 得分 | 点评 |');
    lines.push('| --- | --- | --- |');
    for (const s of report.scores) {
      lines.push(`| ${s.dimension} | ${s.score} | ${s.comment ?? ''} |`);
    }
    lines.push('');
  }
  if (report.strengths.length) {
    lines.push('## 优势亮点');
    for (const s of report.strengths) lines.push(`- ${s}`);
    lines.push('');
  }
  if (report.improvements.length) {
    lines.push('## 提升建议');
    for (const s of report.improvements) lines.push(`- ${s}`);
    lines.push('');
  }
  lines.push('---');
  lines.push('_本报告由「上岸小助手」AI 生成，仅供备考参考。_');
  return lines.join('\n');
}

/** 将错题本渲染为 Markdown（含题目快照与解析）。 */
export function wrongBookToMarkdown(wrongBook: WrongQuestion[]): string {
  const lines: string[] = [];
  lines.push('# 错题本导出');
  lines.push('');
  lines.push(`- 导出时间：${new Date().toLocaleString('zh-CN')}`);
  lines.push(`- 错题总数：${wrongBook.length}`);
  lines.push('');
  wrongBook.forEach((w, i) => {
    const q = w.snapshot;
    lines.push(`## ${i + 1}. ${q?.stem ?? `题目 ${w.questionId}`}`);
    lines.push('');
    lines.push(`- 错误次数：${w.wrongCount}　状态：${w.mastered ? '已掌握' : '未掌握'}`);
    if (q) {
      lines.push(`- 正确答案：**${q.answer}**`);
      if (q.explanation) {
        lines.push('');
        lines.push(`解析：${q.explanation}`);
      }
    }
    lines.push('');
  });
  lines.push('---');
  lines.push('_由「上岸小助手」导出。_');
  return lines.join('\n');
}
