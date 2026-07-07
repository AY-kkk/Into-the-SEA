'use client';

import type { AnalyticsEvent } from './events';

const ANON_KEY = 'its-anon-id';

function anonId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = `anon_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

// 简单批处理队列，减少请求数。
let queue: AnalyticsEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function flush(): void {
  if (queue.length === 0) return;
  const events = queue;
  queue = [];
  const body = JSON.stringify({ events });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }));
    } else {
      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-anon-id': anonId() },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* 埋点失败不影响主流程 */
  }
}

/** 上报一个漏斗事件（批处理，800ms 内合并）。 */
export function track(event: string, props?: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return;
  queue.push({ event, props, ts: new Date().toISOString() });
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 800);
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
