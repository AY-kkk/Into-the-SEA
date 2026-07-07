'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookMarked, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/ui/select-native';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { CaseCard } from './case-card';
import { OriginalCard } from './original-card';
import { EXAM_CATEGORY_LABELS } from '@/types/common';
import { ESSAY_TOPIC_LABELS, type EssayCase, type EssayOriginal } from '@/types/essay';
import type { AsyncState } from '@/types/common';

type Kind = 'case' | 'original';

interface EssayViewProps {
  initialCases: EssayCase[];
  initialCasesTotal: number;
  initialOriginals: EssayOriginal[];
  initialOriginalsTotal: number;
  years: number[];
}

const PAGE_SIZE = 24;

const topicOptions = Object.entries(ESSAY_TOPIC_LABELS).map(([value, label]) => ({ value, label }));
const categoryOptions = Object.entries(EXAM_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function EssayView({
  initialCases,
  initialCasesTotal,
  initialOriginals,
  initialOriginalsTotal,
  years,
}: EssayViewProps) {
  const [kind, setKind] = useState<Kind>('case');
  const [cases, setCases] = useState(initialCases);
  const [originals, setOriginals] = useState(initialOriginals);
  const [total, setTotal] = useState(initialCasesTotal);
  const [state, setState] = useState<AsyncState>('ready');
  const [loadingMore, setLoadingMore] = useState(false);
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [keyword, setKeyword] = useState('');
  const initialTotals = { case: initialCasesTotal, original: initialOriginalsTotal };

  const buildParams = useCallback(
    (offset: number) => {
      const params = new URLSearchParams({
        kind,
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      if (topic) params.set('topic', topic);
      if (keyword) params.set('keyword', keyword);
      if (kind === 'original') {
        if (category) params.set('category', category);
        if (year) params.set('year', year);
      }
      return params;
    },
    [kind, topic, category, year, keyword],
  );

  const fetchData = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`/api/essay?${buildParams(0).toString()}`);
      if (!res.ok) throw new Error(`请求失败：${res.status}`);
      const data = (await res.json()) as {
        items: EssayCase[] | EssayOriginal[];
        total: number;
      };
      setTotal(data.total);
      if (kind === 'case') setCases(data.items as EssayCase[]);
      else setOriginals(data.items as EssayOriginal[]);
      setState(data.items.length ? 'ready' : 'empty');
    } catch {
      setState('error');
    }
  }, [kind, buildParams]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const offset = kind === 'case' ? cases.length : originals.length;
      const res = await fetch(`/api/essay?${buildParams(offset).toString()}`);
      if (!res.ok) throw new Error(`请求失败：${res.status}`);
      const data = (await res.json()) as {
        items: EssayCase[] | EssayOriginal[];
        total: number;
      };
      setTotal(data.total);
      if (kind === 'case') setCases((prev) => [...prev, ...(data.items as EssayCase[])]);
      else setOriginals((prev) => [...prev, ...(data.items as EssayOriginal[])]);
    } catch {
      // 忽略加载更多的瞬时错误，保留已加载内容
    } finally {
      setLoadingMore(false);
    }
  }, [kind, cases.length, originals.length, buildParams]);

  useEffect(() => {
    const t = setTimeout(() => void fetchData(), 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const resetFilters = () => {
    setTopic('');
    setCategory('');
    setYear('');
    setKeyword('');
  };

  const list = kind === 'case' ? cases : originals;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b">
        <button
          type="button"
          onClick={() => {
            setKind('case');
            setTotal(initialTotals.case);
            resetFilters();
          }}
          className={tabClass(kind === 'case')}
        >
          <BookMarked className="h-4 w-4" /> 优秀案例库
        </button>
        <button
          type="button"
          onClick={() => {
            setKind('original');
            setTotal(initialTotals.original);
            resetFilters();
          }}
          className={tabClass(kind === 'original')}
        >
          <FileText className="h-4 w-4" /> 历年原题库
        </button>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="关键词搜索"
              className="pl-9"
            />
          </div>
          <SelectNative
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="全部主题"
            options={topicOptions}
          />
          {kind === 'original' ? (
            <>
              <SelectNative
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="全部考试类型"
                options={categoryOptions}
              />
              <SelectNative
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="全部年份"
                options={years.map((y) => ({ value: String(y), label: `${y} 年` }))}
              />
            </>
          ) : null}
        </div>
      </div>

      {state === 'loading' ? <LoadingState /> : null}
      {state === 'error' ? <ErrorState onRetry={() => void fetchData()} /> : null}
      {state === 'empty' ? (
        <EmptyState title="未找到匹配内容" description="换个主题或关键词试试。" />
      ) : null}
      {state === 'ready' ? (
        <>
          <p className="text-xs text-muted-foreground">
            共 {total} 条，已展示 {list.length} 条
          </p>
          <div className="grid animate-fade-in gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kind === 'case'
              ? (list as EssayCase[]).map((c) => <CaseCard key={c.id} item={c} />)
              : (list as EssayOriginal[]).map((o) => <OriginalCard key={o.id} item={o} />)}
          </div>
          {list.length < total ? (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
                {loadingMore ? '加载中…' : '加载更多'}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
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
