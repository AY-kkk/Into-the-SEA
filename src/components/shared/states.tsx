import Image from 'next/image';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { STATE_ART } from '@/assets/generated';

/** 加载态：插画 + 骨架屏网格。素材见 docs/DESIGN.md（loading-state）。 */
export function LoadingState({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="flex justify-center">
        <Image
          src={STATE_ART.loading}
          alt=""
          aria-hidden
          width={200}
          height={145}
          className="h-24 w-auto animate-pulse opacity-90"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title = '暂无数据',
  description = '换个筛选条件试试，或稍后再来看看。',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {/* 空状态插画（seeddream 素材，见 docs/DESIGN.md：empty-state） */}
        <Image
          src={STATE_ART.empty}
          alt=""
          aria-hidden
          width={220}
          height={160}
          className="h-28 w-auto"
        />
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  message = '加载失败，请稍后重试。',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        {/* 错误状态插画（seeddream 素材，见 docs/DESIGN.md：error-state） */}
        <Image
          src={STATE_ART.error}
          alt=""
          aria-hidden
          width={220}
          height={160}
          className="h-28 w-auto"
        />
        <p className="text-sm font-medium text-destructive">出错了</p>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw className="h-4 w-4" /> 重试
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** 成功态：庆祝插画 + 文案，用于结算 / 完成场景。素材见 docs/DESIGN.md（success-state）。 */
export function SuccessState({
  title = '完成啦！',
  description,
  children,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex animate-fade-in flex-col items-center gap-3 text-center">
      <Image
        src={STATE_ART.success}
        alt=""
        aria-hidden
        width={220}
        height={160}
        className="h-28 w-auto"
      />
      <p className="text-lg font-semibold">{title}</p>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {children}
    </div>
  );
}

export function InlineSpinner({ label = '加载中…' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label}
    </span>
  );
}
