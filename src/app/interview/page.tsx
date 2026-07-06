import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { InterviewView } from '@/components/interview/interview-view';
import { listPositions } from '@/services/job-prep.service';

export const metadata: Metadata = { title: '模拟面试' };

export default function InterviewPage() {
  const positions = listPositions();

  return (
    <PageShell
      title="模拟面试"
      description="结构化 AI 面试官逐题追问，支持结构化 / 行为 / 压力三种模式；会话本地持久化，结束后生成多维度面试报告。"
    >
      <InterviewView positions={positions} />
    </PageShell>
  );
}
