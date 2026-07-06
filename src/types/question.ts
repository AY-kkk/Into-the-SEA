import type { SourceRef } from './common';

/** 行测五大题型。 */
export type QuestionType =
  | 'verbal' // 言语理解
  | 'quantitative' // 数量关系
  | 'judgment' // 判断推理
  | 'data-analysis' // 资料分析
  | 'common-sense'; // 常识判断

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  verbal: '言语理解',
  quantitative: '数量关系',
  judgment: '判断推理',
  'data-analysis': '资料分析',
  'common-sense': '常识判断',
};

/** 练习模式。 */
export type PracticeMode = 'sequential' | 'random' | 'topic' | 'mock' | 'wrong';

export const PRACTICE_MODE_LABELS: Record<PracticeMode, string> = {
  sequential: '顺序练习',
  random: '随机练习',
  topic: '专项练习',
  mock: '模拟套卷',
  wrong: '错题重练',
};

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export interface QuestionOption {
  /** 选项键，如 'A' | 'B'。 */
  key: string;
  text: string;
}

/** 行测题目（模块三）。source 可选。 */
export interface Question extends Partial<SourceRef> {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  stem: string;
  options: QuestionOption[];
  /** 正确选项键。 */
  answer: string;
  /** 解析。 */
  explanation: string;
  tags: string[];
}

/** 一次作答记录。 */
export interface AnswerRecord {
  questionId: string;
  selected: string;
  correct: boolean;
  answeredAt: string;
}

/** 错题本条目。 */
export interface WrongQuestion {
  questionId: string;
  wrongCount: number;
  lastWrongAt: string;
  mastered: boolean;
}
