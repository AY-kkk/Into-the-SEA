/**
 * 数据库 seed 脚本（M1）。
 * 从 data/seed/*.json 读取种子数据写入 PostgreSQL（通过 Prisma）。
 * 运行：pnpm db:seed（需配置 DATABASE_URL）。
 *
 * 注意：MVP 默认走 mock provider，无需数据库即可演示；
 * 本脚本用于真实库接入后的初始化。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import type { ExamInfo } from '../src/types/exam';
import type { Question } from '../src/types/question';
import type { EssayCase, EssayOriginal } from '../src/types/essay';

const prisma = new PrismaClient();
const SEED_DIR = join(process.cwd(), 'data', 'seed');

function load<T>(file: string): T[] {
  return JSON.parse(readFileSync(join(SEED_DIR, file), 'utf8')) as T[];
}

async function seedExamInfos(): Promise<number> {
  const items = load<ExamInfo>('exam-infos.json');
  for (const it of items) {
    await prisma.examInfo.upsert({
      where: { id: it.id },
      update: {},
      create: {
        id: it.id,
        title: it.title,
        category: it.category,
        region: it.region,
        organization: it.organization,
        enrollStart: new Date(it.enrollStart),
        enrollEnd: new Date(it.enrollEnd),
        examDate: it.examDate ? new Date(it.examDate) : null,
        status: it.status,
        headcount: it.headcount,
        education: it.education,
        majors: it.majors,
        summary: it.summary,
        tags: it.tags,
        sourceUrl: it.sourceUrl,
        sourceName: it.sourceName ?? null,
        publishedAt: it.publishedAt ? new Date(it.publishedAt) : null,
      },
    });
  }
  return items.length;
}

async function seedQuestions(): Promise<number> {
  const items = load<Question>('questions.json');
  // 题库规模化（数千题）：分批 createMany + skipDuplicates，避免逐条 upsert 过慢。
  const CHUNK = 500;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = items.slice(i, i + CHUNK).map((it) => ({
      id: it.id,
      type: it.type,
      difficulty: it.difficulty,
      stem: it.stem,
      options: it.options as unknown as object,
      answer: it.answer,
      explanation: it.explanation,
      tags: it.tags,
      sourceUrl: it.sourceUrl ?? null,
      sourceName: it.sourceName ?? null,
    }));
    await prisma.question.createMany({ data: batch, skipDuplicates: true });
  }
  return items.length;
}

async function seedEssayCases(): Promise<number> {
  const items = load<EssayCase>('essay-cases.json');
  const CHUNK = 500;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = items.slice(i, i + CHUNK).map((it) => ({
      id: it.id,
      title: it.title,
      topics: it.topics,
      applicableTopics: it.applicableTopics,
      summary: it.summary,
      transferableExpressions: it.transferableExpressions,
      usageScenarios: it.usageScenarios,
      sourceUrl: it.sourceUrl,
      sourceName: it.sourceName ?? null,
      publishedAt: it.publishedAt ? new Date(it.publishedAt) : null,
    }));
    await prisma.essayCase.createMany({ data: batch, skipDuplicates: true });
  }
  return items.length;
}

async function seedEssayOriginals(): Promise<number> {
  const items = load<EssayOriginal>('essay-originals.json');
  for (const it of items) {
    await prisma.essayOriginal.upsert({
      where: { id: it.id },
      update: {},
      create: {
        id: it.id,
        year: it.year,
        category: it.category,
        region: it.region,
        questionType: it.questionType,
        prompt: it.prompt,
        materialSummary: it.materialSummary,
        topics: it.topics,
        sourceUrl: it.sourceUrl,
        sourceName: it.sourceName ?? null,
        publishedAt: it.publishedAt ? new Date(it.publishedAt) : null,
      },
    });
  }
  return items.length;
}

async function main(): Promise<void> {
  // --reset：清空可重建的题库/案例表后重新写入（保留用户作答/错题/面试数据）。
  if (process.argv.includes('--reset')) {
    // eslint-disable-next-line no-console
    console.log('[seed] --reset：清空 Question / EssayCase / EssayOriginal / ExamInfo …');
    await prisma.question.deleteMany({});
    await prisma.essayCase.deleteMany({});
    await prisma.essayOriginal.deleteMany({});
    await prisma.examInfo.deleteMany({});
  }
  const exam = await seedExamInfos();
  const questions = await seedQuestions();
  const cases = await seedEssayCases();
  const originals = await seedEssayOriginals();
  // eslint-disable-next-line no-console
  console.log(
    `[seed] 完成：招录情报 ${exam}，行测题 ${questions}，申论案例 ${cases}，申论原题 ${originals}。`,
  );
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
