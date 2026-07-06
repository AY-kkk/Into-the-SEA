'use client';

import { CheckCircle2, RotateCw, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SelectNative } from '@/components/ui/select-native';
import { EmptyState } from '@/components/shared/states';
import { usePracticeStore } from '@/store/practice-store';
import { getQuestionById } from '@/services/question.service';
import { QUESTION_TYPE_LABELS, type QuestionType } from '@/types/question';
import { useMemo, useState } from 'react';

export function WrongBook({ onPractice }: { onPractice: (ids: string[]) => void }) {
  const wrongBook = usePracticeStore((s) => s.wrongBook);
  const markMastered = usePracticeStore((s) => s.markMastered);
  const resolveWrong = usePracticeStore((s) => s.resolveWrong);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const rows = useMemo(() => {
    return wrongBook
      .map((w) => ({ w, q: getQuestionById(w.questionId) }))
      .filter((r): r is { w: (typeof wrongBook)[number]; q: NonNullable<ReturnType<typeof getQuestionById>> } =>
        Boolean(r.q),
      )
      .filter((r) => (typeFilter ? r.q.type === typeFilter : true))
      .sort((a, b) => new Date(b.w.lastWrongAt).getTime() - new Date(a.w.lastWrongAt).getTime());
  }, [wrongBook, typeFilter]);

  const activeIds = rows.filter((r) => !r.w.mastered).map((r) => r.q.id);

  if (wrongBook.length === 0) {
    return (
      <EmptyState
        title="错题本为空"
        description="做题时答错的题目会自动收录到这里，方便你重点突破。"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SelectNative
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder="全部题型"
          options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          className="w-44"
        />
        <Button
          size="sm"
          disabled={activeIds.length === 0}
          onClick={() => onPractice(activeIds)}
        >
          <RotateCw className="h-4 w-4" /> 重练未掌握（{activeIds.length}）
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map(({ w, q }) => (
          <Card key={q.id} className={w.mastered ? 'opacity-70' : undefined}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{QUESTION_TYPE_LABELS[q.type as QuestionType]}</Badge>
                <Badge variant="destructive">错 {w.wrongCount} 次</Badge>
                {w.mastered ? <Badge variant="success">已掌握</Badge> : null}
              </div>
              <p className="text-sm font-medium leading-relaxed">{q.stem}</p>
              <p className="text-xs text-muted-foreground">
                正确答案：<span className="font-semibold text-success">{q.answer}</span> · {q.explanation}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant={w.mastered ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => markMastered(q.id, !w.mastered)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {w.mastered ? '取消已掌握' : '标记已掌握'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onPractice([q.id])}>
                  <RotateCw className="h-4 w-4" /> 单题重练
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => resolveWrong(q.id)}
                >
                  <Trash2 className="h-4 w-4" /> 移除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
