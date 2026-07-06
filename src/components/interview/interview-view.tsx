'use client';

import { useEffect, useState } from 'react';
import { History, Plus, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils';
import { InterviewSetup } from './interview-setup';
import { ChatRunner } from './chat-runner';
import { ReportView } from './report-view';
import { useInterviewStore } from '@/store/interview-store';
import { useInterviewContextStore } from '@/store/interview-context-store';
import type { InterviewConfig, InterviewMessage } from '@/types/interview';
import { INTERVIEW_MODE_LABELS } from '@/types/interview';
import type { JobPositionId } from '@/types/job';

type View = 'setup' | 'chat' | 'report';

interface InterviewViewProps {
  positions: Array<{ id: JobPositionId; name: string }>;
}

export function InterviewView({ positions }: InterviewViewProps) {
  const sessions = useInterviewStore((s) => s.sessions);
  const activeId = useInterviewStore((s) => s.activeId);
  const createSession = useInterviewStore((s) => s.createSession);
  const setActive = useInterviewStore((s) => s.setActive);
  const deleteSession = useInterviewStore((s) => s.deleteSession);

  const pending = useInterviewContextStore((s) => s.pending);
  const clearPending = useInterviewContextStore((s) => s.clear);

  const [view, setView] = useState<View>('setup');
  const [starting, setStarting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const active = sessions.find((s) => s.id === activeId) ?? null;

  // 初次进入时，根据活动会话状态决定视图
  useEffect(() => {
    if (!hydrated) return;
    if (active) {
      setView(active.report ? 'report' : 'chat');
    }
  }, [hydrated, active]);

  const start = async (config: InterviewConfig) => {
    setStarting(true);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = (await res.json()) as { message: InterviewMessage };
        createSession(config, data.message);
        clearPending();
        setView('chat');
      }
    } finally {
      setStarting(false);
    }
  };

  if (!hydrated) {
    return <div className="text-sm text-muted-foreground">加载中…</div>;
  }

  const initial = pending
    ? { positionId: pending.positionId, positionName: pending.positionName, context: pending.context }
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'setup' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActive(null);
              setView('setup');
            }}
          >
            <Plus className="h-4 w-4" /> 新面试
          </Button>
          {active ? (
            <>
              <Button
                variant={view === 'chat' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('chat')}
              >
                <MessageSquare className="h-4 w-4" /> 对话
              </Button>
              {active.report ? (
                <Button
                  variant={view === 'report' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('report')}
                >
                  面试报告
                </Button>
              ) : null}
            </>
          ) : null}
        </div>

        {view === 'setup' ? (
          <InterviewSetup
            positions={positions}
            initial={initial}
            starting={starting}
            onStart={start}
          />
        ) : null}
        {view === 'chat' && active ? (
          <ChatRunner session={active} onFinished={() => setView('report')} />
        ) : null}
        {view === 'report' && active?.report ? <ReportView report={active.report} /> : null}
      </div>

      {/* 会话历史（持久化） */}
      <aside className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <History className="h-4 w-4" /> 历史会话
        </p>
        {sessions.length === 0 ? (
          <p className="text-xs text-muted-foreground">还没有面试记录。</p>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                'group cursor-pointer rounded-lg border p-3 text-sm transition-colors hover:bg-secondary',
                s.id === activeId && 'border-primary bg-primary/5',
              )}
              onClick={() => {
                setActive(s.id);
                setView(s.report ? 'report' : 'chat');
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.config.positionName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  aria-label="删除会话"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>
                  {s.status === 'completed' ? '已完成' : '进行中'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {INTERVIEW_MODE_LABELS[s.config.mode]}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
            </div>
          ))
        )}
      </aside>
    </div>
  );
}
