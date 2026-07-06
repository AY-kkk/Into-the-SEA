/**
 * 数据库 seed 脚本（M0 骨架）。
 * M1 起将从 data/seed/*.json 读取招录情报、题库、申论案例等真实/mock 数据写入库。
 * 运行：pnpm db:seed
 */
async function main(): Promise<void> {
  // TODO(M1): 读取 data/seed/*.json 并通过 Prisma 写入。
  // eslint-disable-next-line no-console
  console.log('[seed] M0 占位：数据层将在 M1 落地。');
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
