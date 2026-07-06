# AGENTS.md — Codex Loop 工程约定

本工程目标见 GOAL.md。**每轮迭代前必读 GOAL.md，结束前更新其「进度日志」与「验收清单」。**

## 铁律

1. 按 GOAL.md 第 11 节「里程碑 M0→M8」顺序推进，一次只做一个可验证增量。
2. 业务逻辑落 services/ 与 providers/，禁止写进 React 组件。
3. 所有外部 Key 走 .env，禁止硬编码；维护 .env.example。
4. 数据模型与页面的 source_url 字段不可省略。
5. 真实数据源不可用 → mock provider 顶替 + 保留真实接入接口 + TODO 标注。
6. TS 严格类型，杜绝 any。

## 每轮结束检查

- pnpm build && pnpm lint && pnpm test 全绿。
- 追加一条进度日志到 GOAL.md 第 12 节。
- 勾选 GOAL.md 第 9 节已达成的验收项。

## 技术栈

Next.js 14 App Router · React 18 · TS 严格 · Tailwind · shadcn/ui · Framer Motion · Zustand · Prisma + PostgreSQL
