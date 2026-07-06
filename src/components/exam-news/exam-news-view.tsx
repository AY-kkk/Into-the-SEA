'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/ui/select-native';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { ExamCard } from './exam-card';
import {
  EDUCATION_LABELS,
  ENROLL_STATUS_LABELS,
  EXAM_CATEGORY_LABELS,
  type AsyncState,
  type ExamInfo,
} from '@/types';

type Filters = {
  category: string;
  status: string;
  education: string;
  region: string;
  keyword: string;
};

const EMPTY: Filters = { category: '', status: '', education: '', region: '', keyword: '' };

function toOptions(record: Record<string, string>) {
  return Object.entries(record).map(([value, label]) => ({ value, label }));
}

export function ExamNewsView({ initialItems }: { initialItems: ExamInfo[] }) {
  const [items, setItems] = useState<ExamInfo[]>(initialItems);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [state, setState] = useState<AsyncState>(initialItems.length ? 'ready' : 'empty');

  const regionOptions = useMemo(
    () => [...new Set(initialItems.map((i) => i.region))].map((r) => ({ value: r, label: r })),
    [initialItems],
  );

  const fetchData = useCallback(async (f: Filters) => {
    setState('loading');
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    try {
      const res = await fetch(`/api/exam-news?${params.toString()}`);
      if (!res.ok) throw new Error(`请求失败：${res.status}`);
      const data = (await res.json()) as { items: ExamInfo[] };
      setItems(data.items);
      setState(data.items.length ? 'ready' : 'empty');
    } catch {
      setState('error');
    }
  }, []);

  // 筛选变化时（keyword 用防抖）重新拉取
  useEffect(() => {
    const t = setTimeout(() => {
      void fetchData(filters);
    }, 300);
    return () => clearTimeout(t);
  }, [filters, fetchData]);

  const update = (key: keyof Filters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.keyword}
              onChange={(e) => update('keyword')(e.target.value)}
              placeholder="关键词搜索"
              className="pl-9"
            />
          </div>
          <SelectNative
            value={filters.category}
            onChange={(e) => update('category')(e.target.value)}
            placeholder="全部类型"
            options={toOptions(EXAM_CATEGORY_LABELS)}
          />
          <SelectNative
            value={filters.region}
            onChange={(e) => update('region')(e.target.value)}
            placeholder="全部地区"
            options={regionOptions}
          />
          <SelectNative
            value={filters.status}
            onChange={(e) => update('status')(e.target.value)}
            placeholder="全部状态"
            options={toOptions(ENROLL_STATUS_LABELS)}
          />
          <SelectNative
            value={filters.education}
            onChange={(e) => update('education')(e.target.value)}
            placeholder="全部学历"
            options={toOptions(EDUCATION_LABELS)}
          />
        </div>
        {activeCount > 0 ? (
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>已应用 {activeCount} 个筛选条件</span>
            <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY)}>
              清除筛选
            </Button>
          </div>
        ) : null}
      </div>

      {state === 'loading' ? <LoadingState /> : null}
      {state === 'error' ? (
        <ErrorState message="招录情报加载失败。" onRetry={() => void fetchData(filters)} />
      ) : null}
      {state === 'empty' ? (
        <EmptyState title="未找到匹配的招录信息" description="尝试放宽筛选条件或清除关键词。" />
      ) : null}
      {state === 'ready' ? (
        <div className="grid animate-fade-in gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ExamCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
