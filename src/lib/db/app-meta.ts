import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { shouldUseDb } from '@/lib/env';

/**
 * 通用元数据读写（DB-optional）。
 * 用于记录数据摄取时间戳（lastIngestAt）等运营元信息。
 */
const DIR = process.env.ITS_RUNTIME_DIR ?? join(process.cwd(), 'data', 'runtime');
const FILE = join(DIR, 'app-meta.json');

function fileGetAll(): Record<string, string> {
  try {
    if (!existsSync(FILE)) return {};
    return JSON.parse(readFileSync(FILE, 'utf-8')) as Record<string, string>;
  } catch {
    return {};
  }
}
function fileSet(key: string, value: string): void {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
  const all = fileGetAll();
  all[key] = value;
  writeFileSync(FILE, JSON.stringify(all, null, 2), 'utf-8');
}

export async function getMeta(key: string): Promise<string | null> {
  if (shouldUseDb()) {
    const { prisma } = await import('@/lib/db/prisma');
    const row = await prisma.appMeta.findUnique({ where: { key } });
    return row?.value ?? null;
  }
  return fileGetAll()[key] ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  if (shouldUseDb()) {
    const { prisma } = await import('@/lib/db/prisma');
    await prisma.appMeta.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    return;
  }
  fileSet(key, value);
}

export const META_KEYS = {
  LAST_INGEST_AT: 'exam.lastIngestAt',
} as const;
