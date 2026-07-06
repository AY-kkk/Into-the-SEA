import { getLLMProvider } from '@/providers/llm';
import { createId } from '@/lib/utils';
import type { LLMMessage } from '@/providers/types';
import type {
  InterviewConfig,
  InterviewMessage,
  InterviewReport,
  InterviewScore,
} from '@/types/interview';

/**
 * 模拟面试核心业务逻辑（无状态）。
 * 生成下一问题 / 总结报告，底层走 LLMProvider（mock 或真实）。
 * 会话状态由调用方（API + 客户端 store / InterviewEngine 的 SessionStore）持有并持久化。
 */

function systemPrompt(config: InterviewConfig): string {
  return [
    `你是一名严谨、专业的${config.mode === 'pressure' ? '压力型' : ''}面试官，`,
    `正在面试「${config.positionName}」岗位的候选人。`,
    config.context ? `岗位上下文：${config.context}。` : '',
    '请基于候选人的回答进行有针对性的追问，一次只问一个问题，问题简洁明确，贴合岗位能力要求。',
  ].join('');
}

function toLLMHistory(config: InterviewConfig, messages: InterviewMessage[]): LLMMessage[] {
  const history: LLMMessage[] = [{ role: 'system', content: systemPrompt(config) }];
  for (const m of messages) {
    if (m.role === 'interviewer') history.push({ role: 'assistant', content: m.content });
    else if (m.role === 'candidate') history.push({ role: 'user', content: m.content });
  }
  return history;
}

/** 生成开场问题。 */
export async function generateOpening(config: InterviewConfig): Promise<InterviewMessage> {
  const llm = getLLMProvider();
  const res = await llm.generate([
    { role: 'system', content: systemPrompt(config) },
    { role: 'user', content: '' },
  ]);
  return {
    id: createId('msg'),
    role: 'interviewer',
    content: res.content,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 依据历史与候选人最新回答生成下一个（追问）问题。
 * followUpOf 指向上一条面试官问题，体现「追问」语义。
 */
export async function generateNext(
  config: InterviewConfig,
  messages: InterviewMessage[],
): Promise<InterviewMessage> {
  const llm = getLLMProvider();
  const history = toLLMHistory(config, messages);
  const res = await llm.generate(history);
  const lastInterviewer = [...messages].reverse().find((m) => m.role === 'interviewer');
  return {
    id: createId('msg'),
    role: 'interviewer',
    content: res.content,
    createdAt: new Date().toISOString(),
    followUpOf: lastInterviewer?.id,
  };
}

/** 已提出的面试官问题数量。 */
export function askedCount(messages: InterviewMessage[]): number {
  return messages.filter((m) => m.role === 'interviewer').length;
}

/** 生成多维度面试报告。 */
export async function generateReport(
  config: InterviewConfig,
  messages: InterviewMessage[],
): Promise<InterviewReport> {
  const llm = getLLMProvider();
  const transcript = messages
    .map((m) => `${m.role === 'interviewer' ? '面试官' : '候选人'}：${m.content}`)
    .join('\n');
  const res = await llm.generate(
    [
      { role: 'system', content: `请基于以下「${config.positionName}」面试记录，生成 JSON 格式的多维度评估报告。` },
      { role: 'user', content: transcript },
    ],
    { json: true },
  );

  const parsed = safeParseReport(res.content);
  return {
    sessionId: config.positionId + '_' + Date.now().toString(36),
    overallScore: parsed.overallScore,
    scores: parsed.scores,
    strengths: parsed.strengths,
    improvements: parsed.improvements,
    summary: parsed.summary,
    createdAt: new Date().toISOString(),
  };
}

interface ParsedReport {
  overallScore: number;
  scores: InterviewScore[];
  strengths: string[];
  improvements: string[];
  summary: string;
}

function safeParseReport(content: string): ParsedReport {
  try {
    const data = JSON.parse(content) as Partial<ParsedReport>;
    return {
      overallScore: typeof data.overallScore === 'number' ? data.overallScore : 75,
      scores: Array.isArray(data.scores) ? data.scores : [],
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      summary: typeof data.summary === 'string' ? data.summary : '面试已完成。',
    };
  } catch {
    return {
      overallScore: 75,
      scores: [],
      strengths: [],
      improvements: [],
      summary: '面试已完成（报告解析失败，返回兜底结果）。',
    };
  }
}
