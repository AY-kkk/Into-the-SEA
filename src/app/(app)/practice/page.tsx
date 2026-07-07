import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { PracticeView } from '@/components/practice/practice-view';
import { getTypeCounts } from '@/services/question.service';

export const metadata: Metadata = { title: '行测刷题' };

export default async function PracticePage() {
  const typeCounts = await getTypeCounts();

  return (
    <PageShell
      heroKey="practice"
      title="行测刷题"
      description="言语、数量、判断、资料、常识五大题型，支持顺序 / 随机 / 专项 / 套卷 / 错题重练，答错自动入错题本。"
    >
      <PracticeView typeCounts={typeCounts} />
    </PageShell>
  );
}
