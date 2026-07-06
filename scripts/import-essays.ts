/**
 * 申论数据导入脚本（M5）。
 * 用法：
 *   pnpm tsx scripts/import-essays.ts --kind=case --file=./data/import/cases.json
 *   pnpm tsx scripts/import-essays.ts --kind=original --file=./data/import/originals.json
 *
 * 作用：从外部 JSON 批量校验并写入数据库（Prisma）。
 * 目标：将申论优秀案例 / 历年原题各扩充至 100 条（见 README「数据扩充说明」）。
 * 校验：sourceUrl 不可省略（红线）；结构不合法的条目会被跳过并报告。
 *
 * 注意：需配置 DATABASE_URL；无数据库时可先用 data/seed 演示。
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const topicEnum = z.enum([
  'grassroots-governance',
  'rural-revitalization',
  'digital-government',
  'public-services',
  'ecological',
  'culture',
  'economy',
]);

const caseSchema = z.object({
  id: z.string(),
  title: z.string(),
  topics: z.array(topicEnum),
  applicableTopics: z.array(z.string()),
  summary: z.string(),
  transferableExpressions: z.array(z.string()),
  usageScenarios: z.array(z.string()),
  sourceUrl: z.string().url(), // 红线
  sourceName: z.string().optional(),
  publishedAt: z.string().optional(),
});

const originalSchema = z.object({
  id: z.string(),
  year: z.number().int(),
  category: z.enum(['national', 'provincial', 'soe', 'institution', 'grassroots']),
  region: z.string(),
  questionType: z.enum(['summary', 'analysis', 'solution', 'application', 'essay']),
  prompt: z.string(),
  materialSummary: z.string(),
  topics: z.array(topicEnum),
  sourceUrl: z.string().url(), // 红线
  sourceName: z.string().optional(),
  publishedAt: z.string().optional(),
});

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.split('=')[1];
}

async function main(): Promise<void> {
  const kind = arg('kind');
  const file = arg('file');
  if (!kind || !file) {
    throw new Error('用法：--kind=case|original --file=<path.json>');
  }
  const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(raw)) throw new Error('导入文件必须是 JSON 数组');

  let ok = 0;
  let skipped = 0;

  for (const entry of raw) {
    if (kind === 'case') {
      const parsed = caseSchema.safeParse(entry);
      if (!parsed.success) {
        skipped += 1;
        // eslint-disable-next-line no-console
        console.warn('[skip case]', parsed.error.issues[0]?.message);
        continue;
      }
      const d = parsed.data;
      await prisma.essayCase.upsert({
        where: { id: d.id },
        update: {},
        create: {
          ...d,
          sourceName: d.sourceName ?? null,
          publishedAt: d.publishedAt ? new Date(d.publishedAt) : null,
        },
      });
      ok += 1;
    } else {
      const parsed = originalSchema.safeParse(entry);
      if (!parsed.success) {
        skipped += 1;
        // eslint-disable-next-line no-console
        console.warn('[skip original]', parsed.error.issues[0]?.message);
        continue;
      }
      const d = parsed.data;
      await prisma.essayOriginal.upsert({
        where: { id: d.id },
        update: {},
        create: {
          ...d,
          sourceName: d.sourceName ?? null,
          publishedAt: d.publishedAt ? new Date(d.publishedAt) : null,
        },
      });
      ok += 1;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`[import] 完成：写入 ${ok} 条，跳过 ${skipped} 条（kind=${kind}）。`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
