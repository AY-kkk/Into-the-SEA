/** 共享基础类型 */

/** 招录类型（贯穿招录情报 / 岗位备考 / 申论）。 */
export type ExamCategory =
  | 'national' // 国考
  | 'provincial' // 省考
  | 'soe' // 国企
  | 'institution' // 事业单位
  | 'grassroots'; // 三支一扶

export const EXAM_CATEGORY_LABELS: Record<ExamCategory, string> = {
  national: '国考',
  provincial: '省考',
  soe: '国企',
  institution: '事业单位',
  grassroots: '三支一扶',
};

/** 报名状态 */
export type EnrollStatus = 'upcoming' | 'open' | 'closed';

export const ENROLL_STATUS_LABELS: Record<EnrollStatus, string> = {
  upcoming: '未开始',
  open: '进行中',
  closed: '已截止',
};

/** 学历要求 */
export type EducationLevel = 'college' | 'bachelor' | 'master' | 'doctor';

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  college: '大专',
  bachelor: '本科',
  master: '硕士',
  doctor: '博士',
};

/** 异步资源四态，贯穿前端渲染。 */
export type AsyncState = 'loading' | 'error' | 'empty' | 'ready';

/** 统一分页结果包装。 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 来源信息 —— source_url 在任何含外部来源的模型中不可省略。 */
export interface SourceRef {
  /** 来源链接（红线：不可省略）。 */
  sourceUrl: string;
  /** 来源名称，如「国家公务员局」。 */
  sourceName?: string;
  /** 采集/发布时间（ISO）。 */
  publishedAt?: string;
}
