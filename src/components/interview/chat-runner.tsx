'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, FileCheck2, UserRound, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useInterviewStore } from '@/store/interview-store';
import { INTERVIEW_MODE_LABELS, type InterviewSession } from '@/types/interview';
import type { InterviewMessage } from '@/types/interview';

interface ChatRunnerProps {
  session: InterviewSession;
  onFinished: () => void;
}

export function ChatRunner({ session, onFinished }: ChatRunnerProps) {
  const appendCandidate = useInterviewStore((s) => s.appendCandidate);
  const appendMessage = useInterviewStore((s) => s.appendMessage);
  const setReport = useInterviewStore((s) => s.setReport);

  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const askedCount = session.messages.filter((m) => m.role === 'interviewer').length;
  const reachedLimit = askedCount >= session.config.questionCount;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [session.messages.length, loading]);

  const submit = async () => {
    if (!answer.trim() || loading) return;
    const userAnswer = answer.trim();
    setAnswer('');
    appendCandidate(session.id, userAnswer);
    setLoading(true);
    try {
      const res = await fetch('/api/interview/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: session.config,
          messages: session.messages,
          userAnswer,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { message: InterviewMessage };
        appendMessage(session.id, data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    setSummarizing(true);
    try {
      const res = await fetch('/api/interview/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: session.config, messages: session.messages }),
      });
      if (res.ok) {
        const data = (await res.json()) as { report: InterviewSession['report'] };
        if (data.report) setReport(session.id, data.report);
        onFinished();
      }
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="default">{session.config.positionName}</Badge>
          <Badge variant="secondary">{INTERVIEW_MODE_LABELS[session.config.mode]}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          已提问 {Math.min(askedCount, session.config.questionCount)} /{' '}
          {session.config.questionCount}
        </span>
      </div>

      <div ref={scrollRef} className="max-h-[52vh] min-h-[300px] space-y-4 overflow-y-auto p-4">
        {session.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bot className="h-4 w-4" />
            <Loader2 className="h-4 w-4 animate-spin" /> 面试官思考中…
          </div>
        ) : null}
      </div>

      <div className="space-y-2 border-t p-4">
        {reachedLimit ? (
          <div className="rounded-lg bg-secondary/60 p-3 text-center text-sm text-muted-foreground">
            已完成设定的 {session.config.questionCount} 个问题，可以生成面试报告了。
          </div>
        ) : null}
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={3}
          placeholder="输入你的回答…（Cmd/Ctrl + Enter 发送）"
          disabled={loading || summarizing}
        />
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={finish} disabled={summarizing || askedCount === 0}>
            {summarizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCheck2 className="h-4 w-4" />
            )}
            结束并生成报告
          </Button>
          <Button onClick={submit} disabled={loading || !answer.trim()}>
            <Send className="h-4 w-4" /> 发送
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: InterviewMessage }) {
  const isInterviewer = message.role === 'interviewer';
  return (
    <div className={cn('flex gap-3', isInterviewer ? 'justify-start' : 'justify-end')}>
      {isInterviewer ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </span>
      ) : null}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isInterviewer
            ? 'rounded-tl-sm bg-secondary text-foreground'
            : 'rounded-tr-sm bg-primary text-primary-foreground',
        )}
      >
        {message.followUpOf && isInterviewer ? (
          <span className="mb-1 block text-xs font-medium text-accent">追问</span>
        ) : null}
        {message.content}
      </div>
      {!isInterviewer ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <UserRound className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );
}
