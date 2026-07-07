import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { EssayView } from '@/components/essay/essay-view';
import {
  getOriginalYears,
  listEssayCasesAsync,
  listEssayOriginalsAsync,
} from '@/services/essay.service';

export const metadata: Metadata = { title: '申论案例' };

export default async function EssayPage() {
  const [initialCasesPage, initialOriginalsPage] = await Promise.all([
    listEssayCasesAsync(),
    listEssayOriginalsAsync(),
  ]);
  const years = getOriginalYears();

  return (
    <PageShell
      heroKey="essay"
      title="申论案例"
      description="优秀案例库与历年原题库，含主题标签、可迁移表达、适用场景与来源链接，助力素材积累。"
    >
      <EssayView
        initialCases={initialCasesPage.items}
        initialCasesTotal={initialCasesPage.total}
        initialOriginals={initialOriginalsPage.items}
        initialOriginalsTotal={initialOriginalsPage.total}
        years={years}
      />
    </PageShell>
  );
}
