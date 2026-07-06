import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { ModulePlaceholder } from '@/components/shared/placeholder';

export const metadata: Metadata = { title: '行测刷题' };

export default function PracticePage() {
  return (
    <PageShell title="行测刷题" description="言语、数量、判断、资料、常识五大题型，支持多模式与错题本闭环。">
      <ModulePlaceholder milestone="M4" note="题库 seed + 五种模式 + 即时反馈 + 错题本。" />
    </PageShell>
  );
}
