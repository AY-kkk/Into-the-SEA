import Link from 'next/link';
import { ArrowRight, Newspaper, Target, PenLine, MapPin, Users, Anchor } from 'lucide-react';
import { PageShell } from '@/components/shared/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SourceLink } from '@/components/shared/source-link';
import { StatCards } from '@/components/dashboard/stat-cards';
import { InterviewSummary } from '@/components/dashboard/interview-summary';
import { getLatestExamInfo } from '@/services/exam-info.service';
import { getRecommendedCases } from '@/services/essay.service';
import { listPositions } from '@/services/job-prep.service';
import { EXAM_CATEGORY_LABELS, ENROLL_STATUS_LABELS } from '@/types/common';
import { ESSAY_TOPIC_LABELS } from '@/types/essay';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [latestNews, recommendedCases] = await Promise.all([
    getLatestExamInfo(3),
    Promise.resolve(getRecommendedCases(2)),
  ]);
  const positions = listPositions()
    .filter((p) => p.id !== 'custom')
    .slice(0, 3);

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
      {/* Hero */}
      <div className="bg-grid overflow-hidden rounded-lg border">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-card/95 to-card/60 p-8">
          <Badge variant="accent" className="w-fit">
            <Anchor className="mr-1 h-3.5 w-3.5" /> Into the SEA · 上岸工作台
          </Badge>
          <h3 className="max-w-xl text-balance text-2xl font-semibold tracking-tight">
            从信息差到上岸，把备考流程装进一个工作台
          </h3>
          <p className="max-w-2xl text-sm text-muted-foreground">
            聚合招录情报、岗位能力模型、行测题库、申论素材与 AI 模拟面试，随时掌握进度。
          </p>
        </div>
      </div>

      {/* 客户端聚合数据卡片 */}
      <StatCards />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 今日招录动态 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Newspaper className="h-5 w-5 text-primary" /> 今日招录动态
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/exam-news">
                查看全部 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestNews.map((n) => (
              <div key={n.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{EXAM_CATEGORY_LABELS[n.category]}</Badge>
                  <Badge variant="secondary">{ENROLL_STATUS_LABELS[n.status]}</Badge>
                  <span className="text-sm font-medium">{n.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {n.region}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {n.headcount.toLocaleString()} 人
                  </span>
                  <span>报名截止 {formatDate(n.enrollEnd)}</span>
                  <SourceLink url={n.sourceUrl} name={n.sourceName ?? '来源'} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 最近面试摘要 */}
        <InterviewSummary />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 推荐岗位 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" /> 推荐岗位
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/job-prep">
                更多岗位 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {positions.map((p) => (
              <Link
                key={p.id}
                href="/job-prep"
                className="rounded-lg border p-3 text-sm transition-colors hover:bg-secondary"
              >
                <p className="font-medium">{p.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                  查看备考方案 <ArrowRight className="h-3.5 w-3.5" />
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* 申论推荐 */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <PenLine className="h-5 w-5 text-primary" /> 申论推荐
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/essay">
                案例库 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedCases.map((c) => (
              <div key={c.id} className="space-y-1 border-b pb-2 last:border-0 last:pb-0">
                <p className="text-sm font-medium leading-snug">{c.title}</p>
                <div className="flex flex-wrap gap-1">
                  {c.topics.map((t) => (
                    <Badge key={t} variant="accent" className="font-normal">
                      {ESSAY_TOPIC_LABELS[t]}
                    </Badge>
                  ))}
                </div>
                <SourceLink url={c.sourceUrl} name={c.sourceName ?? '来源'} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
