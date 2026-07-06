import Link from 'next/link';
import { ArrowRight, Newspaper, Target, ListChecks, PenLine, MessagesSquare } from 'lucide-react';
import { PageShell } from '@/components/shared/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MODULES = [
  { href: '/exam-news', label: '招录情报', icon: Newspaper, note: '汇总国考/省考/国企招录动态' },
  { href: '/job-prep', label: '岗位备考', icon: Target, note: '能力模型 + 简历追问' },
  { href: '/practice', label: '行测刷题', icon: ListChecks, note: '五大题型 + 错题本' },
  { href: '/essay', label: '申论案例', icon: PenLine, note: '优秀案例 + 历年原题' },
  { href: '/interview', label: '模拟面试', icon: MessagesSquare, note: 'AI 面试官 + 反馈' },
];

export default function DashboardPage() {
  return (
    <PageShell
      title="备考总览"
      description="信息收集 · 岗位备考 · 行测刷题 · 申论学习 · 模拟面试，一站式陪你上岸。"
      actions={
        <Button asChild variant="accent">
          <Link href="/practice">
            开始今日刷题 <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-lg border bg-grid">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-card/95 to-card/60 p-8">
          <Badge variant="accent" className="w-fit">
            MVP · 里程碑 M0 脚手架已就绪
          </Badge>
          <h3 className="max-w-xl text-2xl font-semibold tracking-tight text-balance">
            从信息差到上岸，把备考流程装进一个工作台
          </h3>
          <p className="max-w-2xl text-sm text-muted-foreground">
            后续里程碑将逐步补齐真实数据层、Provider 抽象与五大模块闭环。当前为导航与布局骨架。
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.href} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-base">{m.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{m.note}</p>
                <Button asChild variant="ghost" size="sm" className="px-0 text-primary">
                  <Link href={m.href}>
                    进入模块 <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
