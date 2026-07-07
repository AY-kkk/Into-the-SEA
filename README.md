# 上岸小助手 · Into the SEA

面向准备秋招、国考、省考、国企招聘、三支一扶方向的备考工作台。一站式覆盖：
**招录情报 · 岗位备考 · 行测刷题 · 申论案例 · 模拟面试**。

> 目标与迭代路线见 [`GOAL.md`](./GOAL.md)，工程约定见 [`AGENTS.md`](./AGENTS.md)。

## 技术栈

- **前端**：Next.js 14 (App Router) · React 18 · TypeScript（严格模式）· Tailwind CSS · shadcn/ui 风格组件 · Framer Motion · Lucide · Zustand
- **后端**：Next.js Route Handlers · PostgreSQL · Prisma ORM · Redis（可选）
- **AI/搜索**：可配置 LLM Provider（OpenAI-compatible / 火山方舟 Ark）· 可替换 Search Provider（Bing / SerpAPI / Tavily / Firecrawl / Exa）

## 快速开始

```bash
pnpm install
cp .env.example .env.local   # 按需填写；MVP 默认走 mock provider
pnpm dev                      # 启动 http://localhost:3000
```

## 常用脚本

| 命令                   | 说明                                               |
| ---------------------- | -------------------------------------------------- |
| `pnpm dev`             | 本地开发                                           |
| `pnpm build`           | 生产构建                                           |
| `pnpm start`           | 启动生产服务                                       |
| `pnpm lint`            | ESLint                                             |
| `pnpm typecheck`       | TypeScript 类型检查                                |
| `pnpm test`            | Vitest 单元测试                                    |
| `pnpm format`          | Prettier 格式化                                    |
| `pnpm prisma:generate` | 生成 Prisma Client                                 |
| `pnpm db:seed`         | 写入 seed 数据                                     |
| `pnpm import:essays`   | 批量导入申论案例/原题                              |
| `pnpm gen:assets`      | seeddream 生成品牌素材（需 ark-cli，缺失自动降级） |

## 目录结构

```
src/
  app/          路由与页面（App Router，五大模块 + Dashboard）
  components/   ui/（基础组件）· layout/（侧栏顶栏）· shared/
  lib/          db/ validators/ utils/ · env.ts · nav.ts · practice-stats.ts
  services/     业务逻辑（不写进组件）
  providers/    search/ llm/ exam-info/ question/（抽象 + mock + 真实骨架）
  types/        exam / question / essay / interview / user
  store/        Zustand 状态
data/seed/      *.json 种子数据（含 source_url）
prisma/         schema.prisma
scripts/        seed 等脚本
docs/           DESIGN.md · skills-plan.md
```

## 配置与扩展

- **Provider 切换**：`.env` 中 `*_PROVIDER=mock|real`。真实实现骨架已在 `providers/` 中以 TODO 标注预留。
- **禁止硬编码密钥**：所有外部 Key 走 `.env`，参见 `.env.example`。
- **来源链接**：所有含外部来源的数据模型与页面均保留 `source_url` 字段。

## 部署（Vercel）

1. 将仓库 [AY-kkk/Into-the-SEA](https://github.com/AY-kkk/Into-the-SEA) 导入 Vercel。
2. Framework 预设选择 **Next.js**；构建命令 `pnpm build`，安装命令 `pnpm install`。
3. 在 Vercel 环境变量中按 `.env.example` 配置：
   - MVP 演示可全部留默认（`*_PROVIDER=mock`），无需任何外部 Key 即可运行。
   - 接入真实数据：设置 `DATABASE_URL`（Supabase / Neon），并将对应 `*_PROVIDER=real` + 填入 Key（缺 Key 会自动降级 mock）。
4. 若使用数据库：部署后在本地或 CI 执行 `pnpm prisma:generate` 与 `pnpm db:seed` 初始化数据。
5. 会话/进度等 MVP 采用浏览器 `localStorage` 持久化；多端同步可切换到服务端存储（`PrismaSessionStore` 骨架已就绪）。

### 本地生产预览

```bash
pnpm build && pnpm start
```

## 架构与扩展点

- **分层**：`app`（页面/路由）→ `services`（业务）→ `providers`（外部能力抽象）→ `lib/db`（数据）。业务逻辑不写进组件。
- **Provider 抽象**：`SearchProvider` / `LLMProvider` / `ExamInfoProvider` / `QuestionSearchProvider` / `InterviewEngine`，每个都有 mock 实现与 real 骨架（`TODO(real)` 标注）。
- **切换真实实现**：`.env` 设置 `*_PROVIDER=real` 并提供凭据；`src/lib/env.ts` 的 `shouldUseReal()` 在缺凭据时自动降级 mock。
- **红线**：任何含外部来源的数据模型与页面都保留并展示 `source_url`。

## 迭代进度

见 `GOAL.md` 第 12 节「进度日志」。当前：**M0 脚手架** 完成。

## 数据扩充说明

- 种子数据位于 `data/seed/*.json`：`exam-infos.json`、`questions.json`、`essay-cases.json`、`essay-originals.json`。
- 所有含外部来源的条目均带 `sourceUrl`（红线字段）。
- **申论案例 / 原题目标各 100 条**：当前提供结构化 mock 样本，扩充方式：
  1. 按现有 JSON 结构补充条目（保持 `sourceUrl` 不省略）。
  2. 运行 `pnpm db:seed` 写入数据库（需 `DATABASE_URL`）。
  3. 或通过导入脚本批量导入（推荐）：
     ```bash
     pnpm import:essays --kind=case --file=./data/import/cases.json
     pnpm import:essays --kind=original --file=./data/import/originals.json
     ```
     脚本使用 zod 校验，`sourceUrl` 缺失或结构非法的条目会被跳过并报告。
- MVP 默认走 mock provider，直接读取 seed JSON，无需数据库即可演示。
