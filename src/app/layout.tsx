import type { Metadata } from 'next';
import './globals.css';

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
      <body className="font-sans">{children}</body>
    </html>
  );
}
