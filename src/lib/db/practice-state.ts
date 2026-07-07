import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { shouldUseDb } from '@/lib/env';
import type { AnswerRecord, WrongQuestion } from '@/types/question';

export interface PracticeSnapshot {
  records: AnswerRecord[];
  wrongBook: WrongQuestion[];
  updatedAt: string;
}

const EMPTY: PracticeSnapshot = { records: [], wrongBook: [], updatedAt: '' };

// ── 文件实现（无数据库时的真实服务端持久化，按 userId 分文件）──
const DIR = join(process.cwd(), 'data', 'runtime', 'practice');

function fileFor(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return join(DIR, `${safe}.json`);
}

function fileGet(userId: string): PracticeSnapshot {
  try {
    const f = fileFor(userId);
    if (!existsSync(f)) return { ...EMPTY };
    return JSON.parse(readFileSync(f, 'utf-8')) as PracticeSnapshot;
  } catch {
    return { ...EMPTY };
  }
}

function fileSave(userId: string, snap: PracticeSnapshot): void {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
  writeFileSync(fileFor(userId), JSON.stringify(snap, null, 2), 'utf-8');
}

async function dbGet(userId: string): Promise<PracticeSnapshot> {
  const { prisma } = await import('@/lib/db/prisma');
  const row = await prisma.practiceState.findUnique({ where: { userId } });
  if (!row) return { ...EMPTY };
  return {
    records: row.records as unknown as AnswerRecord[],
    wrongBook: row.wrongBook as unknown as WrongQuestion[],
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function dbSave(userId: string, snap: PracticeSnapshot): Promise<void> {
  const { prisma } = await import('@/lib/db/prisma');
  await prisma.practiceState.upsert({
    where: { userId },
    create: {
      userId,
      records: snap.records as unknown as object,
      wrongBook: snap.wrongBook as unknown as object,
    },
    update: {
      records: snap.records as unknown as object,
      wrongBook: snap.wrongBook as unknown as object,
    },
  });
}

/** 读取用户练习进度（服务端持久化：DB 或文件）。 */
export async function getPracticeState(userId: string): Promise<PracticeSnapshot> {
  return shouldUseDb() ? dbGet(userId) : fileGet(userId);
}

/** 保存用户练习进度。 */
export async function savePracticeState(
  userId: string,
  input: { records: AnswerRecord[]; wrongBook: WrongQuestion[] },
): Promise<PracticeSnapshot> {
  const snap: PracticeSnapshot = {
    records: input.records,
    wrongBook: input.wrongBook,
    updatedAt: new Date().toISOString(),
  };
  if (shouldUseDb()) await dbSave(userId, snap);
  else fileSave(userId, snap);
  return snap;
}
