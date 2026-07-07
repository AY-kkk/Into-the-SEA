import { z } from 'zod';

/**
 * 环境变量校验（zod）。集中管理，禁止在业务代码里直接读 process.env。
 * MVP 默认全部 provider 为 mock，无需任何外部 Key 即可运行。
 */
const providerMode = z.enum(['mock', 'real']).default('mock');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_NAME: z.string().default('上岸小助手'),
  /** 站点公开 URL（用于 SEO metadataBase / sitemap / OG）。 */
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  DATABASE_URL: z.string().optional(),
  /** 数据读取来源：seed（默认，读 JSON）| db（读 PostgreSQL/Prisma）。 */
  DATA_SOURCE: z.enum(['seed', 'db']).default('seed'),

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

  // ── 鉴权 / 会话 ──
  /** 会话 cookie 的 HMAC 签名密钥；生产必须设置（>=32 位）。缺省用开发降级密钥并告警。 */
  AUTH_SECRET: z.string().optional(),
  /** 会话有效期（天）。 */
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),

  // ── 观测性 ──
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // ── API 安全 / 成本护栏 ──
  /** 单窗口每 IP/用户请求上限（默认 60/分钟）。 */
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  /** LLM 单次请求 max_tokens 上限护栏。 */
  LLM_MAX_TOKENS_CAP: z.coerce.number().int().positive().default(1024),
  /** 单用户每日 LLM 调用次数上限（成本护栏）。 */
  LLM_DAILY_CALL_CAP: z.coerce.number().int().positive().default(80),

  // ── 定时任务 ──
  /** Vercel Cron 调用鉴权密钥（生产建议设置）。 */
  CRON_SECRET: z.string().optional(),

  // ── 内容审核（生成式 AI 合规）──
  /** mock | real（远程内容安全服务）。缺凭据自动降级本地规则引擎。 */
  MODERATION_PROVIDER: z.enum(['local', 'real']).default('local'),
  MODERATION_ENDPOINT: z.string().optional(),
  MODERATION_API_KEY: z.string().optional(),
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

/**
 * 是否从真实数据库读取（需 DATA_SOURCE=db 且配置了 DATABASE_URL）。
 * 未配置时自动回退 seed（符合 GOAL.md：真实源不可用 → mock/seed 顶替）。
 */
export function shouldUseDb(): boolean {
  return env.DATA_SOURCE === 'db' && Boolean(env.DATABASE_URL);
}

/**
 * 解析会话签名密钥。生产环境缺失时抛错（安全红线），开发/测试降级为固定密钥并告警。
 */
export function getAuthSecret(): string {
  if (env.AUTH_SECRET && env.AUTH_SECRET.length >= 16) return env.AUTH_SECRET;
  if (env.NODE_ENV === 'production') {
    throw new Error('[env] 生产环境必须设置 AUTH_SECRET（>=16 位）用于会话签名');
  }
  // eslint-disable-next-line no-console
  console.warn('[env] 未设置 AUTH_SECRET，使用开发降级密钥（切勿用于生产）');
  return 'dev-insecure-secret-change-me-please';
}

/** 是否将用户数据（账号/会话/进度）持久化到数据库。 */
export function shouldUseDbForAuth(): boolean {
  return shouldUseDb();
}
