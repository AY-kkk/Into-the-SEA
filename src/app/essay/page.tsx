import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { EssayView } from '@/components/essay/essay-view';
import { getOriginalYears, listEssayCases, listEssayOriginals } from '@/services/essay.service';

export const metadata: Metadata = { title: '申论案例' };

export default function EssayPage() {
  const initialCases = listEssayCases();
  const initialOriginals = listEssayOriginals();
  const years = getOriginalYears();

  return (
    <PageShell
      title="申论案例"
      description="优秀案例库与历年原题库，含主题标签、可迁移表达、适用场景与来源链接，助力素材积累。"
    >
      <EssayView initialCases={initialCases} initialOriginals={initialOriginals} years={years} />
    </PageShell>
  );
}
