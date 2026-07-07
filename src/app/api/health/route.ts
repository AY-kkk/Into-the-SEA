import { NextResponse } from 'next/server';
import { env, shouldUseDb } from '@/lib/env';

/** GET /api/health — 健康检查（探活 + 关键配置状态，不泄露密钥）。 */
export async function GET(): Promise<NextResponse> {
  let db: 'ok' | 'skipped' | 'error' = 'skipped';
  if (shouldUseDb()) {
    try {
      const { prisma } = await import('@/lib/db/prisma');
      await prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch {
      db = 'error';
    }
  }
  return NextResponse.json({
    status: db === 'error' ? 'degraded' : 'ok',
    time: new Date().toISOString(),
    dataSource: env.DATA_SOURCE,
    db,
    providers: {
      llm: env.LLM_PROVIDER,
      search: env.SEARCH_PROVIDER,
      examInfo: env.EXAM_INFO_PROVIDER,
    },
  });
}
