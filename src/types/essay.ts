import type { ExamCategory, SourceRef } from './common';

/** 申论主题标签。 */
export type EssayTopic =
  | 'grassroots-governance' // 基层治理
  | 'rural-revitalization' // 乡村振兴
  | 'digital-government' // 数字政府
  | 'public-services' // 民生服务
  | 'ecological' // 生态文明
  | 'culture' // 文化建设
  | 'economy'; // 经济发展

export const ESSAY_TOPIC_LABELS: Record<EssayTopic, string> = {
  'grassroots-governance': '基层治理',
  'rural-revitalization': '乡村振兴',
  'digital-government': '数字政府',
  'public-services': '民生服务',
  ecological: '生态文明',
  culture: '文化建设',
  economy: '经济发展',
};

/** 申论优秀案例（模块四 · 案例库）。 */
export interface EssayCase extends SourceRef {
  id: string;
  title: string;
  topics: EssayTopic[];
  /** 适用话题。 */
  applicableTopics: string[];
  /** 案例正文摘要。 */
  summary: string;
  /** 可迁移表达 / 金句。 */
  transferableExpressions: string[];
  /** 使用场景。 */
  usageScenarios: string[];
}

/** 申论题目类型。 */
export type EssayQuestionType =
  | 'summary' // 概括归纳
  | 'analysis' // 综合分析
  | 'solution' // 提出对策
  | 'application' // 应用文写作
  | 'essay'; // 大作文

export const ESSAY_QUESTION_TYPE_LABELS: Record<EssayQuestionType, string> = {
  summary: '概括归纳',
  analysis: '综合分析',
  solution: '提出对策',
  application: '应用文写作',
  essay: '文章论述',
};

/** 申论历年原题（模块四 · 原题库）。 */
export interface EssayOriginal extends SourceRef {
  id: string;
  year: number;
  category: ExamCategory;
  region: string;
  questionType: EssayQuestionType;
  /** 题干。 */
  prompt: string;
  /** 给定材料摘要。 */
  materialSummary: string;
  topics: EssayTopic[];
}
