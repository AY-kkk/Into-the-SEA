import type { ExamInfo, ExamInfoFilter } from '@/types/exam';
import type { QuestionSearchResult } from '@/types/job';
import type {
  InterviewConfig,
  InterviewMessage,
  InterviewReport,
  InterviewSession,
} from '@/types/interview';

/** 通用搜索结果。 */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedAt?: string;
}

export interface SearchOptions {
  limit?: number;
  region?: string;
}

/** 抽象：通用联网搜索。 */
export interface SearchProvider {
  readonly name: string;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}

/** LLM 消息与选项。 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  /** 是否要求 JSON 输出。 */
  json?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
}

/** 抽象：LLM 生成。 */
export interface LLMProvider {
  readonly name: string;
  generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
}

export interface FetchOptions {
  filter?: ExamInfoFilter;
  limit?: number;
}

/** 抽象：招录情报数据源。 */
export interface ExamInfoProvider {
  readonly name: string;
  fetchLatest(options?: FetchOptions): Promise<ExamInfo[]>;
}

/** 抽象：题库联网搜索（岗位备考）。 */
export interface QuestionSearchProvider {
  readonly name: string;
  searchQuestions(query: string, options?: SearchOptions): Promise<QuestionSearchResult[]>;
}

/** 抽象：面试引擎。 */
export interface InterviewEngine {
  readonly name: string;
  startSession(config: InterviewConfig): Promise<InterviewSession>;
  generateNextQuestion(sessionId: string, userAnswer?: string): Promise<InterviewMessage>;
  summarizeSession(sessionId: string): Promise<InterviewReport>;
}
