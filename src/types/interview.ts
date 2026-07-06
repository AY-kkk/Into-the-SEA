import type { JobPositionId } from './job';

/** 面试模式。 */
export type InterviewMode = 'structured' | 'behavioral' | 'pressure';

export const INTERVIEW_MODE_LABELS: Record<InterviewMode, string> = {
  structured: '结构化面试',
  behavioral: '行为面试',
  pressure: '压力面试',
};

export interface InterviewConfig {
  positionId: JobPositionId;
  positionName: string;
  mode: InterviewMode;
  /** 计划提问数量。 */
  questionCount: number;
  /** 岗位上下文（来自 job-prep 跳转）。 */
  context?: string;
}

export type InterviewRole = 'interviewer' | 'candidate' | 'system';

export interface InterviewMessage {
  id: string;
  role: InterviewRole;
  content: string;
  createdAt: string;
  /** 若为追问，标注被追问的原问题。 */
  followUpOf?: string;
}

export type InterviewSessionStatus = 'active' | 'completed';

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  status: InterviewSessionStatus;
  messages: InterviewMessage[];
  createdAt: string;
  updatedAt: string;
  report?: InterviewReport;
}

/** 面试报告维度评分。 */
export interface InterviewScore {
  dimension: string;
  /** 0-100 */
  score: number;
  comment: string;
}

export interface InterviewReport {
  sessionId: string;
  /** 综合得分 0-100。 */
  overallScore: number;
  scores: InterviewScore[];
  strengths: string[];
  improvements: string[];
  summary: string;
  createdAt: string;
}
