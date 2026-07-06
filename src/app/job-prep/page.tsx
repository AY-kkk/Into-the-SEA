import type { Metadata } from 'next';
import { PageShell } from '@/components/shared/page-shell';
import { ModulePlaceholder } from '@/components/shared/placeholder';

export const metadata: Metadata = { title: '岗位备考' };

export default function JobPrepPage() {
  return (
    <PageShell title="岗位备考" description="按岗位输出能力模型、高频题型、面试问题与简历追问，一键跳转模拟面试。">
      <ModulePlaceholder milestone="M6" note="岗位选择 + 六项输出 + 简历追问 + QuestionSearchProvider。" />
    </PageShell>
  );
}
