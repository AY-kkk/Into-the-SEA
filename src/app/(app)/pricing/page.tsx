import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { PricingView } from '@/components/billing/pricing-view';

export const metadata: Metadata = {
  title: '会员套餐',
  description: '上岸小助手会员套餐：免费版与专业版，AI 用量分层，助力高效备考。',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <PageShell
      heroKey="job-prep"
      title="会员套餐"
      description="选择适合你的备考方案。免费版即可体验全部核心功能，专业版提供更高的 AI 额度与导出能力。"
    >
      <PricingView />
    </PageShell>
  );
}
