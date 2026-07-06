import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { ModulePlaceholder } from '@/components/shared/placeholder';

export const metadata: Metadata = { title: '申论案例' };

export default function EssayPage() {
  return (
    <PageShell title="申论案例" description="优秀案例库与历年原题库，含主题标签、可迁移表达与来源链接。">
      <ModulePlaceholder milestone="M5" note="案例/原题双库 + 筛选 + 来源链接 + 导入脚本。" />
    </PageShell>
  );
}
