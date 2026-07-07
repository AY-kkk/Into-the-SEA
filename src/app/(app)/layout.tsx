import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { SessionSync } from '@/components/auth/session-sync';

/** 主应用外壳：侧栏 + 顶栏 + 移动端底部导航。 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SessionSync />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
