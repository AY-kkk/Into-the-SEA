'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/nav';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/user-menu';
import { MobileMenu } from './mobile-menu';

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const current =
    NAV_ITEMS.find((i) => (i.href === '/' ? pathname === '/' : pathname.startsWith(i.href))) ??
    NAV_ITEMS[0];

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/exam-news?keyword=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <MobileMenu />
        <div>
          <h1 className="text-base font-semibold leading-tight">{current?.label}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{current?.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <form
          onSubmit={submitSearch}
          className="hidden items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm md:flex"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索招录情报…"
            aria-label="搜索招录情报"
            className="w-40 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </form>
        <UserMenu />
        <Button asChild size="sm" variant="accent">
          <Link href="/interview">开始模拟面试</Link>
        </Button>
      </div>
    </header>
  );
}
