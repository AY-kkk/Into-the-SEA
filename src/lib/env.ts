import { z } from 'zod';

/**
 * 环境变量校验（zod）。集中管理，禁止在业务代码里直接读 process.env。
 * MVP 默认全部 provider 为 mock，无需任何外部 Key 即可运行。
 */
const providerMode = z.enum(['mock', 'real']).default('mock');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('上岸小助手'),

  DATABASE_URL: z.string().optional(),

  EXAM_INFO_PROVIDER: providerMode,
  LLM_PROVIDER: providerMode,
  SEARCH_PROVIDER: providerMode,
  QUESTION_SEARCH_PROVIDER: providerMode,

  LLM_BASE_URL: z.string().optional(),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),

  SEARCH_API_KEY: z.string().optional(),
  SEARCH_ENDPOINT: z.string().optional(),

  REDIS_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // 仅告警，不中断：缺失的可选项会退回 mock/默认值。
    // eslint-disable-next-line no-console
    console.warn('[env] 环境变量校验警告：', parsed.error.flatten().fieldErrors);
    return envSchema.parse({});
  }
  return parsed.data;
}

export const env = parseEnv();

/**
 * 判断某 provider 是否应使用真实实现，且具备必要凭据。
 * 缺凭据时自动降级为 mock（符合 GOAL.md：真实源不可用 → mock 顶替）。
 */
export function shouldUseReal(provider: 'exam' | 'llm' | 'search' | 'question'): boolean {
  switch (provider) {
    case 'exam':
      return env.EXAM_INFO_PROVIDER === 'real';
    case 'llm':
      return env.LLM_PROVIDER === 'real' && Boolean(env.LLM_API_KEY || env.OPENAI_API_KEY);
    case 'search':
      return env.SEARCH_PROVIDER === 'real' && Boolean(env.SEARCH_API_KEY);
    case 'question':
      return env.QUESTION_SEARCH_PROVIDER === 'real' && Boolean(env.SEARCH_API_KEY);
    default:
      return false;
  }
}
