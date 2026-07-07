import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = { title: '注册' };

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
      <RegisterForm />
    </AuthCard>
  );
}
