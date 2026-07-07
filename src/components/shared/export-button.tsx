'use client';

import { useState } from 'react';
import { Download, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { getPlan } from '@/lib/billing/plans';
import { downloadTextFile } from '@/lib/export';

interface ExportButtonProps {
  filename: string;
  /** 惰性生成内容（点击时才计算）。 */
  getContent: () => string;
  label?: string;
}

/**
 * 导出按钮：受套餐 `canExport` 门控（专业版）。
 * 免费用户点击引导至 /pricing。未登录引导登录。
 */
export function ExportButton({ filename, getContent, label = '导出 Markdown' }: ExportButtonProps) {
  const user = useAuthStore((s) => s.user);
  const [done, setDone] = useState(false);
  const canExport = user ? getPlan(user.plan).limits.canExport : false;

  if (!canExport) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href="/pricing" title="导出为专业版功能">
          <Lock className="h-4 w-4" /> 导出（专业版）
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        downloadTextFile(filename, getContent());
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
    >
      <Download className="h-4 w-4" /> {done ? '已导出' : label}
    </Button>
  );
}
