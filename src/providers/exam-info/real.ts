import { dbListExamInfo } from '@/lib/db/repository';
import { env, shouldUseDb } from '@/lib/env';
import type { ExamInfo } from '@/types/exam';
import type { ExamInfoProvider, FetchOptions } from '../types';

/**
 * 真实招录情报 provider：
 *  - 当 DATA_SOURCE=db 且配置 DATABASE_URL 时，从 PostgreSQL 读取（筛选/排序/limit 下推数据库）。
 *  - 未接入数据库时抛出可读错误，服务层/工厂据此降级 mock。
 *
 * 扩展点（TODO）：可在 DB 之上叠加官网/RSS/搜索抓取 + 定时刷新写库（见 scripts/ingest.ts）。
 */
export class RealExamInfoProvider implements ExamInfoProvider {
  readonly name = 'real-exam-info';

  async fetchLatest(options?: FetchOptions): Promise<ExamInfo[]> {
    if (!shouldUseDb()) {
      throw new Error(
        '[RealExamInfoProvider] 需要 DATA_SOURCE=db 且配置 DATABASE_URL；' +
          `当前 DATA_SOURCE=${env.DATA_SOURCE}。请先 pnpm db:seed 初始化数据库。`,
      );
    }
    return dbListExamInfo(options?.filter ?? {}, options?.limit);
  }
}
