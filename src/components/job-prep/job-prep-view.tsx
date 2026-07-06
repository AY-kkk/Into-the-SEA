'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, MessagesSquare, FileSearch, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SourceLink } from '@/components/shared/source-link';
import { cn } from '@/lib/utils/cn';
import { ProfilePanels } from './profile-panels';
import { useInterviewContextStore } from '@/store/interview-context-store';
import { assembleProfile } from '@/services/job-prep.service';
import { FOLLOW_UP_TYPE_LABELS } from '@/types/job';
import type { JobPositionId, QuestionSearchResult, ResumeFollowUp } from '@/types/job';

interface JobPrepViewProps {
  positions: Array<{ id: JobPositionId; name: string }>;
}

const FOLLOW_UP_VARIANT: Record<string, 'default' | 'accent' | 'warning' | 'destructive'> = {
  experience: 'default',
  motivation: 'accent',
  competency: 'warning',
  stress: 'destructive',
};

export function JobPrepView({ positions }: JobPrepViewProps) {
  const router = useRouter();
  const setPending = useInterviewContextStore((s) => s.setPending);

  const [selected, setSelected] = useState<JobPositionId>(positions[0]!.id);
  const [customName, setCustomName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [followUps, setFollowUps] = useState<ResumeFollowUp[]>([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionSearchResult[]>([]);
  const [qLoading, setQLoading] = useState(false);

  const positionName =
    selected === 'custom'
      ? customName.trim() || '自定义岗位'
      : positions.find((p) => p.id === selected)!.name;

  const profile = useMemo(
    () => assembleProfile(selected, { customName: positionName }),
    [selected, positionName],
  );

  const handleFollowUps = async () => {
    if (!resumeText.trim()) return;
    setFollowLoading(true);
    try {
      const res = await fetch('/api/job-prep/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, positionName }),
      });
      if (res.ok) {
        const data = (await res.json()) as { followUps: ResumeFollowUp[] };
        setFollowUps(data.followUps);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSearch = async () => {
    setQLoading(true);
    try {
      const res = await fetch(
        `/api/job-prep/questions?positionName=${encodeURIComponent(positionName)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as { results: QuestionSearchResult[] };
        setQuestions(data.results);
      }
    } finally {
      setQLoading(false);
    }
  };

  const goInterview = () => {
    const contextParts = [
      `岗位：${positionName}`,
      `能力模型：${profile.competencyModel.map((c) => c.name).join('、')}`,
    ];
    if (followUps.length) {
      contextParts.push(
        `简历追问方向：${followUps.map((f) => FOLLOW_UP_TYPE_LABELS[f.type]).join('、')}`,
      );
    }
    setPending({
      positionId: selected,
      positionName,
      context: contextParts.join('；'),
    });
    router.push('/interview');
  };

  return (
    <div className="space-y-6">
      {/* 岗位选择 */}
      <div className="rounded-lg border bg-card p-4">
        <p className="mb-3 text-sm font-medium">选择目标岗位</p>
        <div className="flex flex-wrap gap-2">
          {positions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                selected === p.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-secondary',
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        {selected === 'custom' ? (
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="输入自定义岗位名称，如「数据分析岗」"
            className="mt-3 max-w-sm"
          />
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{positionName} · 备考方案</h3>
        <Button variant="accent" onClick={goInterview}>
          <MessagesSquare className="h-4 w-4" /> 一键模拟面试
        </Button>
      </div>

      {/* 六项输出：前五项 */}
      <ProfilePanels profile={profile} />

      {/* 简历追问 */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Sparkles className="h-5 w-5 text-accent" />
          <CardTitle className="text-base">简历追问生成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            粘贴你的简历要点（每行一条），系统生成针对性追问，覆盖经历深挖 / 动机匹配 / 岗位胜任 /
            压力测试。
          </p>
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={4}
            placeholder={
              '例如：\n主导校园招聘系统开发，用户 3000+\n获校级三好学生\n担任学生会部长，组织大型活动'
            }
          />
          <Button onClick={handleFollowUps} disabled={followLoading || !resumeText.trim()}>
            {followLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            生成追问
          </Button>

          {followUps.length ? (
            <div className="space-y-3 pt-2">
              {followUps.map((f, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={FOLLOW_UP_VARIANT[f.type]}>
                      {FOLLOW_UP_TYPE_LABELS[f.type]}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{f.question}</p>
                  <p className="mt-1 text-xs text-muted-foreground">考察点：{f.intent}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 题库联网检索 */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">岗位题库检索</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handleSearch} disabled={qLoading}>
            {qLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSearch className="h-4 w-4" />
            )}
            联网搜索
          </Button>
        </CardHeader>
        <CardContent>
          {questions.length ? (
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{q.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{q.snippet}</p>
                  <div className="mt-2">
                    {/* source_url 红线 */}
                    <SourceLink url={q.sourceUrl} name={q.sourceName ?? '查看来源'} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              点击「联网搜索」获取「{positionName}」相关的笔试面试资料（结果保留来源链接）。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
