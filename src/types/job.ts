import type { SourceRef } from './common';

/** 预置岗位方向（支持自定义）。 */
export type JobPositionId =
  | 'national-admin' // 国考综合管理岗
  | 'provincial-grassroots' // 省考基层岗
  | 'soe-management-trainee' // 国企管培生
  | 'soe-product-ops' // 国企产品/运营/市场
  | 'grassroots-support' // 三支一扶
  | 'custom';

/** 岗位备考输出（模块二 六项输出）。 */
export interface JobPrepProfile {
  positionId: JobPositionId;
  positionName: string;
  /** 笔试高频题型。 */
  writtenTopics: string[];
  /** 常见面试问题。 */
  interviewQuestions: string[];
  /** 岗位能力模型。 */
  competencyModel: CompetencyDimension[];
  /** 简历追问问题。 */
  resumeFollowUps: ResumeFollowUp[];
  /** 备考建议。 */
  studyAdvice: string[];
  /** 练习路径。 */
  practicePath: string[];
}

export interface CompetencyDimension {
  name: string;
  description: string;
  /** 权重 0-100。 */
  weight: number;
}

/** 简历追问类型。 */
export type FollowUpType =
  | 'experience' // 经历深挖
  | 'motivation' // 动机匹配
  | 'competency' // 岗位胜任
  | 'stress'; // 压力测试

export const FOLLOW_UP_TYPE_LABELS: Record<FollowUpType, string> = {
  experience: '经历深挖',
  motivation: '动机匹配',
  competency: '岗位胜任',
  stress: '压力测试',
};

export interface ResumeFollowUp {
  type: FollowUpType;
  question: string;
  /** 追问意图 / 考察点。 */
  intent: string;
}

/** 题库联网搜索结果（QuestionSearchProvider）。 */
export interface QuestionSearchResult extends SourceRef {
  id: string;
  title: string;
  snippet: string;
}
