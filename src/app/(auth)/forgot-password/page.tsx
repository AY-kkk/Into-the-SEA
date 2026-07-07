import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { ForgotForm } from '@/components/auth/forgot-form';

export const metadata: Metadata = { title: '找回密码' };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      art="forgot"
      title="重置密码"
      description="输入邮箱与新密码完成重置"
      footer={
        <>
          想起来了？{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            返回登录
          </Link>
        </>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}
