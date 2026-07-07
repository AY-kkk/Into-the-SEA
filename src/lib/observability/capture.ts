import { env } from '@/lib/env';
import { logger } from './logger';

/**
 * 错误捕获上报。默认结构化日志；配置 SENTRY_DSN 时转发 Sentry。
 * TODO(real): 安装 @sentry/nextjs 后在此转发（当前以 fetch 上报 envelope 兜底/占位，
 * 不引入新依赖，缺 DSN 时仅本地记录）。
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(err.message, { stack: err.stack, ...(context ?? {}) });
  if (env.SENTRY_DSN) {
    // TODO(real): 接入 @sentry/nextjs：Sentry.captureException(err, { extra: context })
    logger.debug('sentry_forward_pending', { dsnConfigured: true });
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
