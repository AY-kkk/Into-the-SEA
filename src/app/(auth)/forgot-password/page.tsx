import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = { title: '找回密码' };

// TODO(real): 接入真实找回密码 / 发送重置邮件流程。当前为静态 UI + 素材接入演示。
export default function ForgotPasswordPage() {
  return (
    <AuthCard
      art="forgot"
      title="找回密码"
      description="输入注册邮箱，我们会发送重置链接"
      footer={
        <>
          想起来了？{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            返回登录
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
        <Button type="submit" className="w-full">
          发送重置链接
        </Button>
      </form>
    </AuthCard>
  );
}
