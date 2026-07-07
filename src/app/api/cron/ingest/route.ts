import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { setMeta, META_KEYS } from '@/lib/db/app-meta';
import { getExamInfoFreshness } from '@/services/exam-info.service';
import { captureError } from '@/lib/observability/capture';
import { logger } from '@/lib/observability/logger';

/**
 * GET/POST /api/cron/ingest — 招录情报定时刷新入口（Vercel Cron 调用）。
 * 鉴权：Vercel Cron 会带 `Authorization: Bearer $CRON_SECRET`（或本地手动带同 header）。
 *
 * 当前实现：更新 lastIngestAt 时间戳并回报新鲜度（真实抓取见 scripts/ingest.ts，
 * TODO(real): 在此调用摄取管线写库 + 去重 + sourceUrl 校验后落 seed/db）。
 */
async function handle(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization');
  const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : null;
  // 配置了 CRON_SECRET 时强制校验；未配置（本地/演示）则放行但记录告警。
  if (expected && auth !== expected) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  if (!expected) {
    logger.warn('cron_ingest_no_secret', { note: '未配置 CRON_SECRET，生产环境应设置' });
  }
  try {
    // TODO(real): 触发 scripts/ingest 摄取逻辑；当前记录摄取时间戳。
    const now = new Date().toISOString();
    await setMeta(META_KEYS.LAST_INGEST_AT, now);
    const freshness = await getExamInfoFreshness();
    logger.info('cron_ingest_done', { lastIngestAt: now });
    return NextResponse.json({ ok: true, lastIngestAt: now, freshness });
  } catch (error) {
    captureError(error, { route: 'cron/ingest' });
    return NextResponse.json({ error: '摄取失败' }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}
export async function POST(request: NextRequest): Promise<NextResponse> {
  return handle(request);
}
