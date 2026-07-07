import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { ExamNewsView } from '@/components/exam-news/exam-news-view';
import { listExamInfo } from '@/services/exam-info.service';

export const metadata: Metadata = { title: '招录情报' };

// 招录信息随时间变化，禁用静态缓存以体现「最新」语义。
export const dynamic = 'force-dynamic';

export default async function ExamNewsPage() {
  const initialItems = await listExamInfo();

  return (
    <PageShell
      heroKey="exam-news"
      title="招录情报"
      description="汇总国考、省考、国企、事业单位、三支一扶招录信息，来源链接可溯源。"
    >
      <ExamNewsView initialItems={initialItems} />
    </PageShell>
  );
}
