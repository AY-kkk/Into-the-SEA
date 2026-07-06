import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client 单例。
 * 开发环境下避免 HMR 重复实例化连接。
 * 注意：MVP 默认使用 mock provider，无需数据库即可运行；
 * 接入真实 PostgreSQL 时配置 DATABASE_URL 即可启用。
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
