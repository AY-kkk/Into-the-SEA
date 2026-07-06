'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, CheckCircle2, NotebookPen, MessagesSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePracticeStore } from '@/store/practice-store';
import { useInterviewStore } from '@/store/interview-store';
import { computeStats } from '@/lib/practice-stats';

/** 客户端聚合：练习进度 / 正确率 / 错题数 / 面试次数（来自持久化 store）。 */
export function StatCards() {
  const records = usePracticeStore((s) => s.records);
  const wrongBook = usePracticeStore((s) => s.wrongBook);
  const sessions = useInterviewStore((s) => s.sessions);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const stats = computeStats(records, wrongBook);
  const completedInterviews = sessions.filter((s) => s.status === 'completed').length;

  const cards = [
    {
      label: '已练习题目',
      value: hydrated ? stats.answered : 0,
      icon: Target,
      href: '/practice',
      tone: 'text-primary bg-primary/10',
    },
    {
      label: '综合正确率',
      value: hydrated ? `${stats.accuracy}%` : '—',
      icon: CheckCircle2,
      href: '/practice',
      tone: 'text-success bg-success/10',
    },
    {
      label: '待攻克错题',
      value: hydrated ? stats.activeWrong : 0,
      icon: NotebookPen,
      href: '/practice',
      tone: 'text-accent bg-accent/12',
    },
    {
      label: '完成面试',
      value: hydrated ? completedInterviews : 0,
      icon: MessagesSquare,
      href: '/interview',
      tone: 'text-primary bg-primary/10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link key={c.label} href={c.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <span className={`flex h-11 w-11 items-center justify-center rounded-lg ${c.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
