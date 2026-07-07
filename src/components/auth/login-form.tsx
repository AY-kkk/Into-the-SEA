'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/types/user';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { user?: User; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error ?? '登录失败');
        return;
      }
      setUser(data.user);
      const next = params.get('next') || '/';
      router.push(next);
      router.refresh();
    } catch {
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          邮箱
        </label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            密码
          </label>
          <a href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
            忘记密码？
          </a>
        </div>
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '登录中…' : '登录'}
      </Button>
    </form>
  );
}
