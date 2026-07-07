import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: '登录' };

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
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
