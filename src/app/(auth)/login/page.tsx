import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = { title: '登录' };

// TODO(real): 接入真实鉴权（NextAuth / Supabase Auth）。当前为静态 UI + 素材接入演示。
export default function LoginPage() {
  return (
    <AuthCard
      art="login"
      title="欢迎回来"
      description="登录后继续你的备考进度"
      footer={
        <>
          还没有账号？{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            立即注册
          </Link>
        </>
      }
    >
      <form className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            邮箱
          </label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              密码
            </label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
              忘记密码？
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full">
          登录
        </Button>
      </form>
    </AuthCard>
  );
}
