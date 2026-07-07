'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SourceLink } from '@/components/shared/source-link';
import { cn } from '@/lib/utils/cn';
import { usePracticeStore } from '@/store/practice-store';
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS, type Question } from '@/types/question';
import { Mascot } from '@/components/shared/mascot';

interface QuizRunnerProps {
  questions: Question[];
  onExit?: () => void;
  title?: string;
}

export function QuizRunner({ questions, onExit, title }: QuizRunnerProps) {
  const submitAnswer = usePracticeStore((s) => s.submitAnswer);
  const resolveWrong = usePracticeStore((s) => s.resolveWrong);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const total = questions.length;
  const progress = useMemo(
    () => Math.round(((index + (revealed ? 1 : 0)) / total) * 100),
    [index, revealed, total],
  );

  if (total === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          没有可练习的题目。
        </CardContent>
      </Card>
    );
  }

  if (finished || !current) {
    const accuracy = Math.round((sessionCorrect / total) * 100);
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <Mascot pose={accuracy >= 60 ? 'cheer' : 'think'} size={96} decorative />
          <div className="text-4xl font-semibold text-primary">{accuracy}%</div>
          <p className="text-sm text-muted-foreground">
            本次共 {total} 题，答对 {sessionCorrect} 题。
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIndex(0);
                setSelected(null);
                setRevealed(false);
                setSessionCorrect(0);
                setFinished(false);
              }}
            >
              <RotateCcw className="h-4 w-4" /> 再练一次
            </Button>
            {onExit ? <Button onClick={onExit}>返回</Button> : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSelect = (key: string) => {
    if (revealed) return;
    setSelected(key);
    const correct = key === current.answer;
    setRevealed(true);
    if (correct) setSessionCorrect((c) => c + 1);
    submitAnswer({
      questionId: current.id,
      selected: key,
      correct,
      type: current.type,
      snapshot: {
        id: current.id,
        type: current.type,
        stem: current.stem,
        answer: current.answer,
        explanation: current.explanation,
      },
    });
  };

  const handleNext = () => {
    // 若本题答对且原本在错题本，允许移出
    if (selected === current.answer) resolveWrong(current.id);
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const isCorrect = selected === current.answer;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default">{QUESTION_TYPE_LABELS[current.type]}</Badge>
            <Badge variant="secondary">{DIFFICULTY_LABELS[current.difficulty]}</Badge>
            {title ? <span className="text-xs text-muted-foreground">{title}</span> : null}
          </div>
          <span className="text-xs text-muted-foreground">
            第 {index + 1} / {total} 题
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-[15px] font-medium leading-relaxed">{current.stem}</p>

        <div className="space-y-2">
          {current.options.map((opt) => {
            const isAnswer = opt.key === current.answer;
            const isPicked = opt.key === selected;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSelect(opt.key)}
                disabled={revealed}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors',
                  !revealed && 'hover:border-primary/60 hover:bg-secondary',
                  revealed && isAnswer && 'border-success/60 bg-success/10',
                  revealed && isPicked && !isAnswer && 'border-destructive/60 bg-destructive/10',
                  revealed && !isAnswer && !isPicked && 'opacity-60',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    revealed && isAnswer && 'border-success bg-success text-success-foreground',
                    revealed &&
                      isPicked &&
                      !isAnswer &&
                      'border-destructive bg-destructive text-destructive-foreground',
                  )}
                >
                  {opt.key}
                </span>
                <span className="flex-1 pt-0.5">{opt.text}</span>
                {revealed && isAnswer ? <CheckCircle2 className="h-5 w-5 text-success" /> : null}
                {revealed && isPicked && !isAnswer ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : null}
              </button>
            );
          })}
        </div>

        {revealed ? (
          <div
            className={cn(
              'animate-fade-in space-y-2 rounded-lg border p-4 text-sm',
              isCorrect
                ? 'border-success/40 bg-success/5'
                : 'border-destructive/40 bg-destructive/5',
            )}
          >
            <p className="flex items-center gap-2 font-medium">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" /> 回答正确
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-destructive" /> 回答错误，已加入错题本
                </>
              )}
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">解析：</span>
              {current.explanation}
            </p>
            {current.sourceUrl ? (
              <SourceLink url={current.sourceUrl} name={current.sourceName ?? '题目来源'} />
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-1">
          {onExit ? (
            <Button variant="ghost" size="sm" onClick={onExit}>
              退出练习
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleNext} disabled={!revealed}>
            {index + 1 >= total ? '完成' : '下一题'} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
