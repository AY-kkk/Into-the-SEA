import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';

export const metadata: Metadata = {
  title: {
    default: '上岸小助手 · Into the SEA',
    template: '%s · 上岸小助手',
  },
  description:
    '面向国企 / 公务员备考的一站式助手：招录情报、岗位备考、行测刷题、申论案例与模拟面试。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1">{children}</main>
            <MobileNav />
          </div>
        </div>
      </body>
    </html>
  );
}
