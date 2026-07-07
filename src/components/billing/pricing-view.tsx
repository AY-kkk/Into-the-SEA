'use client';

import { useEffect, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import type { Plan } from '@/lib/billing/plans';
import type { User } from '@/types/user';

interface PlanWithCost {
  plan: Plan;
  cost: { typicalMonthlyCost: number; worstMonthlyCost: number; maxDailyLlmCalls: number };
}

export function PricingView() {
  const { user, refresh } = useAuthStore();
  const [plans, setPlans] = useState<PlanWithCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/billing', { cache: 'no-store' });
        if (res.ok) {
          const data = (await res.json()) as { plans: PlanWithCost[] };
          setPlans(data.plans);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const current = user?.plan ?? 'free';

  async function subscribe(planId: string) {
    setError(null);
    if (!user) {
      window.location.href = `/login?next=/pricing`;
      return;
    }
    setBusy(planId);
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = (await res.json()) as { user?: User; error?: string };
      if (!res.ok) {
        setError(data.error ?? '操作失败');
        return;
      }
      await refresh();
    } catch {
      setError('网络错误，请稍后再试');
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">加载套餐中…</p>;

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid gap-5 md:grid-cols-2">
        {plans.map(({ plan }) => {
          const isCurrent = plan.id === current;
          const isPro = plan.id === 'pro';
          return (
            <Card key={plan.id} className={isPro ? 'border-primary/50 shadow-sm' : ''}>
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {isPro ? <Crown className="h-5 w-5 text-accent" /> : null}
                    {plan.name}
                  </CardTitle>
                  {isCurrent ? <Badge variant="success">当前套餐</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                <p className="text-3xl font-bold">
                  ¥{plan.priceMonthly}
                  <span className="text-sm font-normal text-muted-foreground"> / 月</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isPro ? 'accent' : 'outline'}
                  disabled={isCurrent || busy !== null}
                  onClick={() => subscribe(plan.id)}
                >
                  {isCurrent
                    ? '已订阅'
                    : busy === plan.id
                      ? '处理中…'
                      : plan.id === 'free'
                        ? '切换到免费版'
                        : '升级到专业版'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        注：当前为演示计费，暂未接入真实支付网关（微信 / 支付宝 /
        Stripe）。切换套餐即时生效，用于体验用量分层。
      </p>
    </div>
  );
}
