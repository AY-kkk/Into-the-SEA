import type { ExamInfo } from '@/types/exam';
import type { ExamInfoProvider, FetchOptions } from '../types';

/**
 * 真实招录情报 provider 骨架：可组合多数据源（官网/RSS/搜索）+ 去重 + 定时刷新。
 * 建议实现步骤：
 *  1) 各源 fetcher（如国家公务员局、地方人社厅、国企招聘平台）；
 *  2) 归一化到 ExamInfo（sourceUrl 不可省略）；
 *  3) 按标题+机构+时间去重；
 *  4) 定时任务（cron / route revalidate）刷新。
 */
export class RealExamInfoProvider implements ExamInfoProvider {
  readonly name = 'real-exam-info';

  async fetchLatest(options?: FetchOptions): Promise<ExamInfo[]> {
    // TODO(real): 接入真实数据源并归一化，保留 sourceUrl。
    void options;
    throw new Error('[RealExamInfoProvider] 尚未实现真实数据源接入（TODO）');
  }
}
