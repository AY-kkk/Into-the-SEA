import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { JobPrepView } from '@/components/job-prep/job-prep-view';
import { listPositions } from '@/services/job-prep.service';

export const metadata: Metadata = { title: '岗位备考' };

export default function JobPrepPage() {
  const positions = listPositions();

  return (
    <PageShell
      heroKey="job-prep"
      title="岗位备考"
      description="选择目标岗位，获取能力模型、高频题型、面试问题、备考建议与练习路径；粘贴简历要点生成针对性追问，一键携带上下文进入模拟面试。"
    >
      <JobPrepView positions={positions} />
    </PageShell>
  );
}
