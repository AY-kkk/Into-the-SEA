'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

/** 顶栏用户区：未登录显示登录入口，已登录显示昵称 + 退出。 */
export function UserMenu() {
  const router = useRouter();
  const { user, loading, refresh, logout } = useAuthStore();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" aria-hidden />;
  }

  if (!user) {
    return (
      <Button asChild size="icon" variant="ghost" aria-label="登录">
        <Link href="/login">
          <UserRound className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline"
        title={user.email}
      >
        {user.name}
      </span>
      <Button
        size="icon"
        variant="ghost"
        aria-label="退出登录"
        onClick={async () => {
          await logout();
          router.push('/login');
          router.refresh();
        }}
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
