'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/nav';
import { cn } from '@/lib/utils/cn';

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 flex items-stretch justify-around border-t bg-background/95 backdrop-blur lg:hidden">
      {NAV_ITEMS.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
