import Image from 'next/image';
import Link from 'next/link';
import { brandMark } from '@/assets/generated';

/** 鉴权页外壳：品牌区 + 表单区两栏，无主应用侧栏。 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-secondary/60 p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <Image src={brandMark} alt="Into the SEA" width={36} height={36} className="rounded-lg" />
          <span className="text-sm font-semibold">上岸小助手 · Into the SEA</span>
        </Link>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">备考不孤单，陪你一路上岸</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            招录情报 · 岗位备考 · 行测刷题 · 申论案例 · 模拟面试，一站式工作台。
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© Into the SEA</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
