import type { Metadata } from 'next';
import './globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? '上岸小助手';
const description =
  '面向国企 / 公务员备考的一站式助手：招录情报、岗位备考、行测刷题、申论案例与模拟面试。';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} · Into the SEA`,
    template: `%s · ${appName}`,
  },
  description,
  keywords: ['国考', '省考', '公务员', '国企招聘', '行测', '申论', '模拟面试', '三支一扶', '秋招'],
  applicationName: appName,
  authors: [{ name: 'Into the SEA' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: appUrl,
    siteName: `${appName} · Into the SEA`,
    title: `${appName} · Into the SEA`,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appName} · Into the SEA`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  );
}
