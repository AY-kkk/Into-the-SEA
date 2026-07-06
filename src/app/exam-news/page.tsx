import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { ModulePlaceholder } from '@/components/shared/placeholder';

export const metadata: Metadata = { title: '招录情报' };

export default function ExamNewsPage() {
  return (
    <PageShell title="招录情报" description="汇总国考、省考、国企、事业单位、三支一扶招录信息，来源链接可溯源。">
      <ModulePlaceholder milestone="M3" note="列表 + 多维筛选 + 来源链接展示 + ExamInfoProvider 接入与四态。" />
    </PageShell>
  );
}
