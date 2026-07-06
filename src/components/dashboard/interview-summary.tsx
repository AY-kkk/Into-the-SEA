'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessagesSquare, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInterviewStore } from '@/store/interview-store';
import { formatDate } from '@/lib/utils';

/** 最近面试摘要（来自持久化会话）。 */
export function InterviewSummary() {
  const sessions = useInterviewStore((s) => s.sessions);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const recent = hydrated ? sessions.slice(0, 3) : [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessagesSquare className="h-5 w-5 text-primary" /> 最近面试
        </CardTitle>
        <Button asChild variant="ghost" size="sm" className="text-primary">
          <Link href="/interview">
            去面试 <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有面试记录，去做一次模拟面试吧。</p>
        ) : (
          recent.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{s.config.positionName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {s.report ? (
                  <Badge variant="success">{s.report.overallScore} 分</Badge>
                ) : (
                  <Badge variant="warning">进行中</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
