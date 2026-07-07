import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { ExamNewsView } from '@/components/exam-news/exam-news-view';
import { getExamInfoFreshness, listExamInfo } from '@/services/exam-info.service';

export const metadata: Metadata = {
  title: '招录情报',
  description:
    '汇总国考、省考、国企、事业单位、三支一扶招录公告，含报名时间、招录人数、学历要求与来源链接，持续更新。',
  alternates: { canonical: '/exam-news' },
  openGraph: {
    title: '招录情报 · 上岸小助手',
    description: '国考/省考/国企/事业单位/三支一扶招录信息聚合，来源可溯源。',
  },
};

// 招录信息随时间变化，禁用静态缓存以体现「最新」语义。
export const dynamic = 'force-dynamic';

export default async function ExamNewsPage() {
  const [initialItems, freshness] = await Promise.all([listExamInfo(), getExamInfoFreshness()]);

  return (
    <PageShell
      heroKey="exam-news"
      title="招录情报"
      description="汇总国考、省考、国企、事业单位、三支一扶招录信息，来源链接可溯源。"
    >
      <ExamNewsView initialItems={initialItems} freshness={freshness} />
    </PageShell>
  );
}
