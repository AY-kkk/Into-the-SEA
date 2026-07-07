import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = { title: '注册' };

// TODO(real): 接入真实鉴权注册流程。当前为静态 UI + 素材接入演示。
export default function RegisterPage() {
  return (
    <AuthCard
      art="register"
      title="加入上岸计划"
      description="创建账号，开启你的备考工作台"
      footer={
        <>
          已有账号？{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            去登录
          </Link>
        </>
      }
    >
      <form className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            昵称
          </label>
          <Input id="name" type="text" placeholder="你的昵称" autoComplete="nickname" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            邮箱
          </label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            密码
          </label>
          <Input
            id="password"
            type="password"
            placeholder="至少 8 位"
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full">
          注册
        </Button>
      </form>
    </AuthCard>
  );
}
