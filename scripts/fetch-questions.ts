/**
 * 全网搜索题目/案例真实接入管线（arkcli +chat --tools web_search）。
 * 用法：
 *   pnpm fetch:questions -- --type common-sense --n 20 --out data/generated/q.json
 *   pnpm fetch:questions -- --essays --n 10 --out data/generated/cases.json
 *
 * 定位（GOAL.md 铁律 5/6）：这是「真实数据源接入」。程序化生成器（generate-questions.ts /
 * generate-essays.ts）提供离线可交付的稳定底座，本脚本用联网大模型补充/更新题目与时政案例。
 *
 * 依赖：arkcli 已登录（arkcli auth status）。缺失 arkcli → 提示并退出 0（不阻塞）。
 * 产出经 zod 校验（答案键有效、sourceUrl 红线），非法条目跳过并报告；人工复核后再并入 seed。
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { z } from 'zod';

const optionSchema = z.object({ key: z.string().min(1), text: z.string().min(1) });
const questionSchema = z
  .object({
    type: z.enum(['verbal', 'quantitative', 'judgment', 'data-analysis', 'common-sense']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    stem: z.string().min(4),
    options: z.array(optionSchema).length(4),
    answer: z.string().min(1),
    explanation: z.string().min(2),
    tags: z.array(z.string()),
    sourceUrl: z.string().url(),
    sourceName: z.string().min(1),
  })
  .refine((q) => q.options.some((o) => o.key === q.answer), {
    message: 'answer key not in options',
  });

const caseSchema = z.object({
  title: z.string().min(2),
  topics: z.array(z.string()).min(1),
  applicableTopics: z.array(z.string()).min(1),
  summary: z.string().min(10),
  transferableExpressions: z.array(z.string()).min(1),
  usageScenarios: z.array(z.string()).min(1),
  sourceUrl: z.string().url(),
  sourceName: z.string().min(1),
});

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const hasFlag = (name: string): boolean => process.argv.includes(`--${name}`);

function hasArkCli(): boolean {
  try {
    execFileSync('arkcli', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function callArk(prompt: string, schemaFile: string): unknown {
  const raw = execFileSync(
    'arkcli',
    [
      '+chat',
      '--tools',
      'web_search',
      '--text-format',
      'json_schema',
      '--text-schema',
      schemaFile,
      '--text-schema-name',
      'batch',
      '--max-output-tokens',
      '8000',
      prompt,
    ],
    { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 },
  );
  // arkcli 可能在 JSON 后追加升级提示，取首个完整 JSON 对象。
  const outer = extractJson(raw) as { content?: string };
  const content = (outer.content ?? '').replace(/```json\n?|```/g, '').trim();
  return extractJson(content);
}

/** 从可能含额外文本的字符串中提取首个完整 JSON 对象/数组。 */
function extractJson(text: string): unknown {
  const start = text.search(/[{[]/);
  if (start < 0) throw new Error('no JSON found in output');
  const open = text[start]!;
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i += 1) {
    const c = text[i]!;
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === open) depth += 1;
    else if (c === close) {
      depth -= 1;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1));
    }
  }
  throw new Error('unbalanced JSON in output');
}

/** 归一化联网模型返回的题目字段（question→stem、补全 type、sourceUrl 兜底）。 */
function normalizeQuestion(item: unknown, defaultType: string): unknown {
  if (typeof item !== 'object' || item === null) return item;
  const o = { ...(item as Record<string, unknown>) };
  if (o.stem == null && typeof o.question === 'string') o.stem = o.question;
  if (o.type == null) o.type = defaultType;
  if (typeof o.answer === 'number') o.answer = String(o.answer);
  if (!Array.isArray(o.tags)) o.tags = o.tags ? [String(o.tags)] : [];
  if (o.sourceUrl == null) o.sourceUrl = 'http://www.gov.cn/';
  if (o.sourceName == null) o.sourceName = '联网检索';
  // difficulty 中文 → 枚举
  const diffMap: Record<string, string> = {
    简单: 'easy',
    容易: 'easy',
    中等: 'medium',
    一般: 'medium',
    困难: 'hard',
    较难: 'hard',
    难: 'hard',
  };
  if (typeof o.difficulty === 'string' && diffMap[o.difficulty])
    o.difficulty = diffMap[o.difficulty];
  if (o.difficulty == null) o.difficulty = 'medium';
  // options 对象 {A:'…'} → 数组 [{key,text}]
  if (o.options && !Array.isArray(o.options) && typeof o.options === 'object') {
    o.options = Object.entries(o.options as Record<string, unknown>).map(([key, text]) => ({
      key,
      text: String(text),
    }));
  }
  return o;
}

function main(): void {
  if (!hasArkCli()) {
    // eslint-disable-next-line no-console
    console.warn('[fetch] 未检测到 arkcli；离线可用 pnpm gen:questions / pnpm gen:essays。');
    return;
  }
  const n = Number(arg('n', '10'));
  const out = arg('out', 'data/generated/fetched.json')!;
  const isEssays = hasFlag('essays');
  const type = arg('type', 'common-sense')!;

  // 注意：schema 需为磁盘文件，这里内联写出临时 schema。
  const schemaObj = isEssays
    ? {
        type: 'object',
        properties: { items: { type: 'array', items: zodToRough('case') } },
        required: ['items'],
        additionalProperties: false,
      }
    : {
        type: 'object',
        properties: { items: { type: 'array', items: zodToRough('question') } },
        required: ['items'],
        additionalProperties: false,
      };
  const schemaFile = '/tmp/ark-schema.json';
  writeFileSync(schemaFile, JSON.stringify(schemaObj), 'utf-8');

  const prompt = isEssays
    ? `联网搜索近年真实的中国政务/治理优秀实践案例，生成 ${n} 个申论素材案例。每个含 title、topics、applicableTopics、summary、transferableExpressions（金句）、usageScenarios，并给出真实可访问的 sourceUrl（政府或权威媒体官网）与 sourceName。返回 JSON {items:[...]}。`
    : `联网搜索并生成 ${n} 道「${type}」类型的行测题（真题风格），每题四个选项 A/B/C/D，标注正确 answer、explanation、tags，difficulty，并给出参考 sourceUrl 与 sourceName。返回 JSON {items:[...]}。`;

  // eslint-disable-next-line no-console
  console.log(`[fetch] 调用 arkcli web_search 生成 ${n} 条（${isEssays ? 'essays' : type}）…`);
  const data = callArk(prompt, schemaFile) as { items?: unknown[] };
  const items = data.items ?? [];
  const schema = isEssays ? caseSchema : questionSchema;
  const ok: unknown[] = [];
  let skipped = 0;
  for (const item of items) {
    const normalized = isEssays ? item : normalizeQuestion(item, type);
    const r = schema.safeParse(normalized);
    if (r.success) ok.push(r.data);
    else {
      skipped += 1;
      if (process.env.FETCH_DEBUG) {
        // eslint-disable-next-line no-console
        console.error('[skip]', JSON.stringify(r.error.issues));
      }
    }
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(ok, null, 2) + '\n', 'utf-8');
  // eslint-disable-next-line no-console
  console.log(
    `[fetch] 通过校验 ${ok.length} 条，跳过 ${skipped} 条 → ${out}（人工复核后并入 seed）`,
  );
}

/** 粗略 JSON Schema（arkcli 用），字段与上方 zod 对齐。 */
function zodToRough(kind: 'question' | 'case'): Record<string, unknown> {
  if (kind === 'question') {
    return {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['verbal', 'quantitative', 'judgment', 'data-analysis', 'common-sense'],
        },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        stem: { type: 'string' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: { key: { type: 'string' }, text: { type: 'string' } },
            required: ['key', 'text'],
            additionalProperties: false,
          },
        },
        answer: { type: 'string' },
        explanation: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        sourceUrl: { type: 'string' },
        sourceName: { type: 'string' },
      },
      required: [
        'type',
        'difficulty',
        'stem',
        'options',
        'answer',
        'explanation',
        'tags',
        'sourceUrl',
        'sourceName',
      ],
      additionalProperties: false,
    };
  }
  return {
    type: 'object',
    properties: {
      title: { type: 'string' },
      topics: { type: 'array', items: { type: 'string' } },
      applicableTopics: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
      transferableExpressions: { type: 'array', items: { type: 'string' } },
      usageScenarios: { type: 'array', items: { type: 'string' } },
      sourceUrl: { type: 'string' },
      sourceName: { type: 'string' },
    },
    required: [
      'title',
      'topics',
      'applicableTopics',
      'summary',
      'transferableExpressions',
      'usageScenarios',
      'sourceUrl',
      'sourceName',
    ],
    additionalProperties: false,
  };
}

main();
