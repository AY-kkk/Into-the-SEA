'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? '操作失败');
        return;
      }
      setDone(true);
    } catch {
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          若该邮箱已注册，密码已重置成功，请用新密码登录。
        </p>
        <Button asChild className="w-full">
          <a href="/login">去登录</a>
        </Button>
      </div>
    );
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
        <label htmlFor="password" className="text-sm font-medium">
          新密码
        </label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          placeholder="至少 8 位"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '提交中…' : '重置密码'}
      </Button>
    </form>
  );
}
