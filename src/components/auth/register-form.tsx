'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/types/user';

export function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json()) as { user?: User; error?: string };
      if (!res.ok || !data.user) {
        setError(data.error ?? '注册失败');
        return;
      }
      setUser(data.user);
      router.push('/');
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
        <label htmlFor="name" className="text-sm font-medium">
          昵称
        </label>
        <Input
          id="name"
          type="text"
          required
          placeholder="你的昵称"
          autoComplete="nickname"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
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
          密码
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
        {loading ? '注册中…' : '注册'}
      </Button>
    </form>
  );
}
