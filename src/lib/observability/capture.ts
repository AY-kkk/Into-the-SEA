import { env } from '@/lib/env';
import { logger } from './logger';
import { sendToSentry } from './sentry';

/**
 * 错误捕获上报：始终写结构化日志；配置 SENTRY_DSN 时按 Sentry Envelope 协议转发（无 SDK 依赖）。
 * 上报为 fire-and-forget，失败不影响主流程。
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(err.message, { stack: err.stack, ...(context ?? {}) });
  if (env.SENTRY_DSN) {
    void sendToSentry(err.message, { stack: err.stack, extra: context, level: 'error' }).then(
      (ok) => {
        if (!ok) logger.warn('sentry_forward_failed', { message: err.message });
      },
    );
  }
}

/** 包裹 Route Handler：统一捕获未处理异常并返回 500。 */
export async function withCapture<T>(
  fn: () => Promise<T>,
  onError: (message: string) => T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    captureError(error);
    const msg = error instanceof Error ? error.message : '内部错误';
    return onError(msg);
  }
}
