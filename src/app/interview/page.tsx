import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { ModulePlaceholder } from '@/components/shared/placeholder';

export const metadata: Metadata = { title: '模拟面试' };

export default function InterviewPage() {
  return (
    <PageShell title="模拟面试" description="结构化 AI 面试官，逐题追问并生成多维度面试报告，会话持久化。">
      <ModulePlaceholder milestone="M7" note="InterviewEngine + 会话持久化 + 聊天式 UI + 报告。" />
    </PageShell>
  );
}
