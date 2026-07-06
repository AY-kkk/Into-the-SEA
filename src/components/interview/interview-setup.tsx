'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/ui/select-native';
import { INTERVIEW_MODE_LABELS, type InterviewConfig, type InterviewMode } from '@/types/interview';
import type { JobPositionId } from '@/types/job';

interface SetupProps {
  positions: Array<{ id: JobPositionId; name: string }>;
  initial?: { positionId: JobPositionId; positionName: string; context?: string } | null;
  starting: boolean;
  onStart: (config: InterviewConfig) => void;
}

export function InterviewSetup({ positions, initial, starting, onStart }: SetupProps) {
  const [positionId, setPositionId] = useState<JobPositionId>(
    initial?.positionId ?? positions[0]!.id,
  );
  const [customName, setCustomName] = useState(
    initial && initial.positionId === 'custom' ? initial.positionName : '',
  );
  const [mode, setMode] = useState<InterviewMode>('structured');
  const [count, setCount] = useState(5);

  const positionName =
    positionId === 'custom'
      ? customName.trim() || '自定义岗位'
      : positions.find((p) => p.id === positionId)?.name ?? '自定义岗位';

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>配置模拟面试</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {initial?.context ? (
          <div className="rounded-lg border border-accent/40 bg-accent/5 p-3 text-xs text-muted-foreground">
            已携带岗位备考上下文：{initial.context}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-sm font-medium">目标岗位</label>
          <SelectNative
            value={positionId}
            onChange={(e) => setPositionId(e.target.value as JobPositionId)}
            options={positions.map((p) => ({ value: p.id, label: p.name }))}
          />
          {positionId === 'custom' ? (
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="输入自定义岗位名称"
              className="mt-2"
            />
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">面试类型</label>
          <SelectNative
            value={mode}
            onChange={(e) => setMode(e.target.value as InterviewMode)}
            options={Object.entries(INTERVIEW_MODE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">问题数量：{count}</label>
          <input
            type="range"
            min={3}
            max={12}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </div>

        <Button
          className="w-full"
          disabled={starting}
          onClick={() =>
            onStart({
              positionId,
              positionName,
              mode,
              questionCount: count,
              context: initial?.context,
            })
          }
        >
          <Play className="h-4 w-4" /> {starting ? '正在准备…' : '开始面试'}
        </Button>
      </CardContent>
    </Card>
  );
}
