import type { EducationLevel, EnrollStatus, ExamCategory, SourceRef } from './common';

/** 招录情报条目（模块一）。 */
export interface ExamInfo extends SourceRef {
  id: string;
  title: string;
  category: ExamCategory;
  /** 地区，如「全国」「浙江省」「北京市」。 */
  region: string;
  /** 招录单位 / 组织。 */
  organization: string;
  /** 报名开始（ISO date）。 */
  enrollStart: string;
  /** 报名结束（ISO date）。 */
  enrollEnd: string;
  /** 笔试时间（ISO date，可空）。 */
  examDate?: string;
  /** 报名状态（可由时间推导，存储态便于筛选）。 */
  status: EnrollStatus;
  /** 招录人数。 */
  headcount: number;
  /** 最低学历要求。 */
  education: EducationLevel;
  /** 专业要求描述。 */
  majors: string[];
  /** 摘要 / 亮点。 */
  summary: string;
  /** 标签（如「应届」「不限户籍」）。 */
  tags: string[];
}

export interface ExamInfoFilter {
  category?: ExamCategory;
  region?: string;
  status?: EnrollStatus;
  education?: EducationLevel;
  keyword?: string;
}
