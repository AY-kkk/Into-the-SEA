'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Anchor } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/nav';
import { cn } from '@/lib/utils/cn';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card/60 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Anchor className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">上岸小助手</p>
          <p className="text-xs text-muted-foreground">Into the SEA</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', active && 'text-primary')} />
              <span className="flex flex-col">
                <span className="font-medium leading-tight">{item.label}</span>
                <span className="text-xs opacity-70">{item.description}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">备考不孤单</p>
        <p className="mt-1">陪你从信息搜集到最终上岸。</p>
      </div>
    </aside>
  );
}
