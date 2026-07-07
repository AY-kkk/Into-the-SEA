import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { EssayView } from '@/components/essay/essay-view';
import {
  getOriginalYears,
  listEssayCasesAsync,
  listEssayOriginalsAsync,
} from '@/services/essay.service';

export const metadata: Metadata = {
  title: '申论案例',
  description:
    '申论优秀案例与历年原题库，覆盖生态、治理、民生等主题，含可迁移表达与来源出处，助力素材积累。',
  alternates: { canonical: '/essay' },
  openGraph: {
    title: '申论案例 · 上岸小助手',
    description: '申论案例 / 原题双库，按主题筛选，来源可溯源。',
  },
};

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
