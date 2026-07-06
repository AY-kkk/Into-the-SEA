'use client';

import { useState } from 'react';
import {
  BookOpenCheck,
  ListOrdered,
  Shuffle,
  Target,
  FileText,
  NotebookPen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SelectNative } from '@/components/ui/select-native';
import { QuizRunner } from './quiz-runner';
import { WrongBook } from './wrong-book';
import { usePracticeStore } from '@/store/practice-store';
import { buildPracticeSet } from '@/services/question.service';
import {
  PRACTICE_MODE_LABELS,
  QUESTION_TYPE_LABELS,
  type PracticeMode,
  type Question,
  type QuestionType,
} from '@/types/question';

type Tab = 'practice' | 'wrong';

const MODE_META: Record<PracticeMode, { icon: typeof ListOrdered; desc: string }> = {
  sequential: { icon: ListOrdered, desc: '按题库顺序稳步推进' },
  random: { icon: Shuffle, desc: '打乱顺序随机练习' },
  topic: { icon: Target, desc: '针对单一题型专项突破' },
  mock: { icon: FileText, desc: '限时套卷模拟实战' },
  wrong: { icon: NotebookPen, desc: '只练未掌握的错题' },
};

export function PracticeView({ typeCounts }: { typeCounts: Record<QuestionType, number> }) {
  const [tab, setTab] = useState<Tab>('practice');
  const [running, setRunning] = useState<Question[] | null>(null);
  const [runningTitle, setRunningTitle] = useState<string>('');
  const [topicType, setTopicType] = useState<QuestionType>('verbal');
  const getActiveWrongIds = usePracticeStore((s) => s.getActiveWrongIds);
  const wrongCount = usePracticeStore((s) => s.wrongBook.filter((w) => !w.mastered).length);

  const start = (mode: PracticeMode) => {
    const set = buildPracticeSet({
      mode,
      type: topicType,
      count: 10,
      wrongIds: getActiveWrongIds(),
    });
    if (set.length === 0) return;
    setRunningTitle(
      mode === 'topic' ? `专项 · ${QUESTION_TYPE_LABELS[topicType]}` : PRACTICE_MODE_LABELS[mode],
    );
    setRunning(set);
  };

  const startWrong = (ids: string[]) => {
    const set = buildPracticeSet({ mode: 'wrong', wrongIds: ids });
    if (set.length === 0) return;
    setRunningTitle('错题重练');
    setRunning(set);
    setTab('practice');
  };

  if (running) {
    return (
      <QuizRunner
        questions={running}
        title={runningTitle}
        onExit={() => setRunning(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b">
        <button
          type="button"
          onClick={() => setTab('practice')}
          className={tabClass(tab === 'practice')}
        >
          <BookOpenCheck className="h-4 w-4" /> 开始练习
        </button>
        <button
          type="button"
          onClick={() => setTab('wrong')}
          className={tabClass(tab === 'wrong')}
        >
          <NotebookPen className="h-4 w-4" /> 错题本
          {wrongCount > 0 ? (
            <Badge variant="destructive" className="ml-1">
              {wrongCount}
            </Badge>
          ) : null}
        </button>
      </div>

      {tab === 'practice' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(PRACTICE_MODE_LABELS) as PracticeMode[]).map((mode) => {
            const meta = MODE_META[mode];
            const Icon = meta.icon;
            const disabled = mode === 'wrong' && wrongCount === 0;
            return (
              <Card key={mode} className="flex flex-col">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-base">{PRACTICE_MODE_LABELS[mode]}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <p className="text-sm text-muted-foreground">{meta.desc}</p>
                  {mode === 'topic' ? (
                    <SelectNative
                      value={topicType}
                      onChange={(e) => setTopicType(e.target.value as QuestionType)}
                      options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({
                        value,
                        label: `${label}（${typeCounts[value as QuestionType]}）`,
                      }))}
                    />
                  ) : null}
                  <Button
                    className="mt-auto"
                    variant={mode === 'wrong' ? 'accent' : 'default'}
                    disabled={disabled}
                    onClick={() => start(mode)}
                  >
                    {disabled ? '暂无错题' : '开始'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <WrongBook onPractice={startWrong} />
      )}
    </div>
  );
}

function tabClass(active: boolean): string {
  return [
    'flex items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors',
    active
      ? 'border-primary text-primary'
      : 'border-transparent text-muted-foreground hover:text-foreground',
  ].join(' ');
}
