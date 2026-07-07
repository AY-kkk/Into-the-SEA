'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usePracticeStore } from '@/store/practice-store';

/**
 * 会话与练习进度同步：应用外壳挂载。
 *  - 拉取当前会话用户；
 *  - 登录后从服务端拉取并合并练习进度（多端同步）。
 */
export function SessionSync() {
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);
  const pull = usePracticeStore((s) => s.pullFromServer);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (user) void pull();
  }, [user, pull]);

  return null;
}
