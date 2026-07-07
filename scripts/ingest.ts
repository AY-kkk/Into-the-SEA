/**
 * 真实数据摄取管线（GOAL.md 铁律 5/6：真实源 + sourceUrl 不可省略）。
 * 用法：
 *   pnpm ingest -- --github          从 GitHub 公开题库解析行测题（quizsim）
 *   pnpm ingest -- --web-essays --n 20   经 arkcli web_search 抓取申论/时政素材（小红书/考公平台等公开来源）
 *   追加 --merge 将结果并入 data/seed/*.json（按内容去重）；否则仅写 data/import/*.json 供人工复核。
 *
 * 说明：
 *  - GitHub 源为公开仓库，逐条保留 sourceUrl 溯源；无明确开源许可的仓库仅作「引用/改编」并标注来源，
 *    正式商用前需二次确认授权（见 docs/DATA-SOURCES.md）。
 *  - 小红书 / 考公平台（华图/中公/公考通等）无开放 API，采用 arkcli +chat --tools web_search 联网检索，
 *    产出经 zod 校验（答案键有效、sourceUrl 红线）后人工复核并入库。
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type QType = 'verbal' | 'quantitative' | 'judgment' | 'data-analysis' | 'common-sense';
type Difficulty = 'easy' | 'medium' | 'hard';
interface Option {
  key: string;
  text: string;
}
interface Question {
  id: string;
  type: QType;
  difficulty: Difficulty;
  stem: string;
  options: Option[];
  answer: string;
  explanation: string;
  tags: string[];
  sourceUrl: string;
  sourceName: string;
}

const IMPORT_DIR = join(process.cwd(), 'data', 'import');
const SEED_DIR = join(process.cwd(), 'data', 'seed');
const hasFlag = (n: string): boolean => process.argv.includes(`--${n}`);
const argOf = (n: string, d?: string): string | undefined => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const sid = (s: string): string => createHash('sha1').update(s).digest('hex').slice(0, 10);

// ── GitHub 源：quizsim（言语理解 / 资料分析为纯文本；图形推理依赖图片，跳过）──
const QUIZSIM_RAW = 'https://raw.githubusercontent.com/lawson2019/quizsim/main/test.md';
const QUIZSIM_REPO = 'https://github.com/lawson2019/quizsim';
const SECTION_TYPE: Record<string, QType | null> = {
  言语理解: 'verbal',
  资料分析: 'data-analysis',
  图形推理: null, // 依赖图片，跳过
  常识判断: 'common-sense',
  判断推理: 'judgment',
  数量关系: 'quantitative',
};

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`下载失败 ${res.status}: ${url}`);
  return res.text();
}

function parseQuizsim(md: string): Question[] {
  const lines = md.split(/\r?\n/);
  const out: Question[] = [];
  let curType: QType | null = null;
  // 以「# xxx #」切换题型，以「# N」开始一题
  const blocks: string[][] = [];
  let cur: string[] | null = null;
  for (const line of lines) {
    const sec = line.match(/^#\s*(.+?)\s*#\s*$/);
    if (sec) {
      const name = sec[1]!.trim();
      curType = SECTION_TYPE[name] ?? null;
      if (cur) {
        blocks.push(cur);
        cur = null;
      }
      // 用哨兵记录题型切换
      blocks.push([`@@TYPE:${curType ?? ''}`]);
      continue;
    }
    if (/^#\s*\d+\s*$/.test(line)) {
      if (cur) blocks.push(cur);
      cur = [];
      continue;
    }
    if (cur) cur.push(line);
  }
  if (cur) blocks.push(cur);

  let activeType: QType | null = null;
  for (const b of blocks) {
    if (b[0]?.startsWith('@@TYPE:')) {
      const t = b[0].slice('@@TYPE:'.length);
      activeType = (t || null) as QType | null;
      continue;
    }
    if (!activeType) continue; // 跳过图形推理等
    const text = b.join('\n');
    if (text.includes('![')) continue; // 含图片，跳过
    const q = parseBlock(text, activeType);
    if (q) out.push(q);
  }
  return out;
}

function parseBlock(text: string, type: QType): Question | null {
  const optRe = /^([A-E])[:：]\s*(.+)$/;
  const lines = text.split('\n');
  const stemLines: string[] = [];
  const options: Option[] = [];
  let answer = '';
  const explLines: string[] = [];
  let mode: 'stem' | 'opt' | 'expl' = 'stem';
  for (const raw of lines) {
    const line = raw.trim();
    const am = line.match(/^答案[:：]\s*([A-E])/);
    const em = line.match(/^解析[:：]\s*(.*)$/);
    const om = line.match(optRe);
    if (am) {
      answer = am[1]!;
      mode = 'expl';
      continue;
    }
    if (em) {
      if (em[1]) explLines.push(em[1]);
      mode = 'expl';
      continue;
    }
    if (om && mode !== 'expl') {
      options.push({ key: om[1]!, text: om[2]!.trim() });
      mode = 'opt';
      continue;
    }
    if (mode === 'stem' && line) stemLines.push(line);
    else if (mode === 'expl' && line) explLines.push(line);
  }
  const stem = stemLines.join(' ').trim();
  if (!stem || options.length < 2 || !answer) return null;
  if (!options.some((o) => o.key === answer)) return null;
  return {
    id: `q_gh_${sid(stem)}`,
    type,
    difficulty: 'medium',
    stem,
    options,
    answer,
    explanation: explLines.join(' ').trim() || '（来源题库未附解析）',
    tags: ['GitHub 题库', type === 'verbal' ? '言语理解' : '资料分析'],
    sourceUrl: QUIZSIM_REPO,
    sourceName: 'GitHub · lawson2019/quizsim（真题整理）',
  };
}

// ── 小红书 / 考公平台：web_search 联网检索（复用 arkcli）──
function hasArkCli(): boolean {
  try {
    execFileSync('arkcli', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

interface EssayCase {
  id: string;
  title: string;
  topics: string[];
  applicableTopics: string[];
  summary: string;
  transferableExpressions: string[];
  usageScenarios: string[];
  sourceUrl: string;
  sourceName: string;
  publishedAt?: string;
}

function extractJson(text: string): unknown {
  const start = text.search(/[{[]/);
  if (start < 0) throw new Error('no JSON');
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
    else if (c === close && --depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  throw new Error('unbalanced JSON');
}

function fetchWebEssays(n: number): EssayCase[] {
  const schema = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
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
          required: ['title', 'summary', 'sourceUrl', 'sourceName'],
          additionalProperties: false,
        },
      },
    },
    required: ['items'],
    additionalProperties: false,
  };
  const schemaFile = '/tmp/ingest-essay-schema.json';
  writeFileSync(schemaFile, JSON.stringify(schema), 'utf-8');
  const prompt =
    `联网搜索中国政务/治理优秀实践与申论热点素材（可参考小红书公考博主整理、华图/中公/公考通等考公平台公开文章），` +
    `生成 ${n} 个申论案例。每个含 title、topics、applicableTopics、summary、transferableExpressions（金句）、usageScenarios，` +
    `并给出真实可访问的 sourceUrl 与 sourceName。返回 JSON {items:[...]}。`;
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
  const outer = extractJson(raw) as { content?: string };
  const content = (outer.content ?? '').replace(/```json\n?|```/g, '').trim();
  const data = extractJson(content) as { items?: EssayCase[] };
  const items = (data.items ?? []).filter((c) => c.title && /^https?:\/\//.test(c.sourceUrl));
  return items.map((c) => ({
    ...c,
    id: `case_web_${sid(c.title)}`,
    topics: c.topics?.length ? c.topics : ['public-services'],
    applicableTopics: c.applicableTopics?.length ? c.applicableTopics : ['民生服务'],
    transferableExpressions: c.transferableExpressions ?? [],
    usageScenarios: c.usageScenarios ?? ['申论素材'],
  }));
}

function mergeSeed<T extends { id: string }>(
  file: string,
  incoming: T[],
  dedupeKey: (x: T) => string,
): void {
  const path = join(SEED_DIR, file);
  const existing = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf-8')) as T[]) : [];
  const seen = new Set(existing.map(dedupeKey));
  let added = 0;
  for (const it of incoming) {
    if (seen.has(dedupeKey(it))) continue;
    seen.add(dedupeKey(it));
    existing.push(it);
    added += 1;
  }
  writeFileSync(path, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`[ingest] 并入 ${file}：新增 ${added} 条，合计 ${existing.length} 条`);
}

async function main(): Promise<void> {
  if (!existsSync(IMPORT_DIR)) mkdirSync(IMPORT_DIR, { recursive: true });
  const merge = hasFlag('merge');

  if (hasFlag('github')) {
    // eslint-disable-next-line no-console
    console.log('[ingest] 下载 GitHub 题库 quizsim …');
    const md = await fetchText(QUIZSIM_RAW).catch(() =>
      fetchText(QUIZSIM_RAW.replace('/main/', '/master/')),
    );
    const qs = parseQuizsim(md);
    writeFileSync(
      join(IMPORT_DIR, 'github-questions.json'),
      JSON.stringify(qs, null, 2) + '\n',
      'utf-8',
    );
    // eslint-disable-next-line no-console
    console.log(
      `[ingest] 解析出 ${qs.length} 道纯文本题（含 sourceUrl）→ data/import/github-questions.json`,
    );
    if (merge) mergeSeed('questions.json', qs, (q) => (q as unknown as Question).stem);
  }

  if (hasFlag('web-essays')) {
    if (!hasArkCli()) {
      // eslint-disable-next-line no-console
      console.warn('[ingest] 未检测到 arkcli，跳过 web-essays。');
    } else {
      const n = Number(argOf('n', '20'));
      // eslint-disable-next-line no-console
      console.log(`[ingest] arkcli web_search 抓取 ${n} 个申论素材（小红书/考公平台公开来源）…`);
      const cases = fetchWebEssays(n);
      writeFileSync(
        join(IMPORT_DIR, 'web-essays.json'),
        JSON.stringify(cases, null, 2) + '\n',
        'utf-8',
      );
      // eslint-disable-next-line no-console
      console.log(`[ingest] 通过校验 ${cases.length} 个案例 → data/import/web-essays.json`);
      if (merge) mergeSeed('essay-cases.json', cases, (c) => (c as unknown as EssayCase).title);
    }
  }

  if (!hasFlag('github') && !hasFlag('web-essays')) {
    // eslint-disable-next-line no-console
    console.log('用法：pnpm ingest -- --github [--merge] | --web-essays --n 20 [--merge]');
  }
}

void main();
