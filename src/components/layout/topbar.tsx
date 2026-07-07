'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/nav';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/user-menu';

export function Topbar() {
  const pathname = usePathname();
  const current =
    NAV_ITEMS.find((i) => (i.href === '/' ? pathname === '/' : pathname.startsWith(i.href))) ??
    NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="打开菜单">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold leading-tight">{current?.label}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{current?.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm text-muted-foreground md:flex">
          <Search className="h-4 w-4" />
          <span>搜索岗位、题目、案例…</span>
        </div>
        <UserMenu />
        <Button asChild size="sm" variant="accent">
          <Link href="/interview">开始模拟面试</Link>
        </Button>
      </div>
    </header>
  );
}
