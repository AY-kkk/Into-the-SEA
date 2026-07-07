# 上岸小助手 · Into the SEA

面向准备秋招、国考、省考、国企招聘、三支一扶方向的备考工作台。一站式覆盖：
**招录情报 · 岗位备考 · 行测刷题 · 申论案例 · 模拟面试**。

> 目标与迭代路线见 [`GOAL.md`](./GOAL.md)，工程约定见 [`AGENTS.md`](./AGENTS.md)。

## 界面预览

> 截图为本地生成，不纳入仓库以避免占用体积；请在本地运行 `pnpm dev` 后自行截图存放于 `screenshots/`（该目录已在 `.gitignore` 中忽略）。下列引用为相对路径，本地存在对应文件即可显示。

| 模块 | 预览 |
| --- | --- |
| 招录情报 | ![招录情报](./screenshots/exam-news.png) |
| 岗位备考 | ![岗位备考](./screenshots/job-prep.png) |
| 行测刷题 | ![行测刷题](./screenshots/practice.png) |
| 申论案例 | ![申论案例](./screenshots/essay.png) |
| 模拟面试 | ![模拟面试](./screenshots/interview.png) |
| 工作台 | ![工作台](./screenshots/dashboard.png) |
| 登录 | ![登录](./screenshots/login.png) |

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

| 命令                   | 说明                                                |
| ---------------------- | --------------------------------------------------- |
| `pnpm dev`             | 本地开发                                            |
| `pnpm build`           | 生产构建                                            |
| `pnpm start`           | 启动生产服务                                        |
| `pnpm lint`            | ESLint                                              |
| `pnpm typecheck`       | TypeScript 类型检查                                 |
| `pnpm test`            | Vitest 单元测试                                     |
| `pnpm format`          | Prettier 格式化                                     |
| `pnpm prisma:generate` | 生成 Prisma Client                                  |
| `pnpm db:seed`         | 写入 seed 数据                                      |
| `pnpm import:essays`   | 批量导入申论案例/原题                               |
| `pnpm gen:assets`      | seedream 生成品牌素材（需 arkcli，缺失自动降级）    |
| `pnpm gen:questions`   | 程序化生成行测题库（默认 8000 题，答案可验证）      |
| `pnpm gen:essays`      | 程序化生成申论案例库（默认 500 个，含来源）         |
| `pnpm fetch:questions` | 全网搜索真实接入（arkcli +chat --tools web_search） |

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

- 种子数据位于 `data/seed/*.json`：`exam-infos.json`、`questions.json`（8000 题）、`essay-cases.json`（500 个）、`essay-originals.json`。
- 所有含外部来源的条目均带 `sourceUrl`（红线字段）。

### 规模化生成（可复现）

- **行测题库 8000 题**：`pnpm gen:questions [数量]` → 覆盖言语 / 数量 / 判断 / 资料 / 常识五题型。
  - 数量关系 / 资料分析 / 数字推理类**答案由程序精确计算**，100% 正确、解析自动推导；言语 / 常识类基于人工校对模板库。固定随机种子，结果可复现。
- **申论案例 500 个**：`pnpm gen:essays [数量]` → 省市 × 主题 × 政策实践模板组合，`sourceUrl` 取自真实政府 / 权威媒体官网。

### 全网搜索真实接入（web_search）

- `pnpm fetch:questions -- --type common-sense --n 20 --out data/generated/q.json`
- `pnpm fetch:questions -- --essays --n 10 --out data/generated/cases.json`
- 底层调用火山方舟 `arkcli +chat --tools web_search`（联网），产出经 zod 校验（答案键有效、`sourceUrl` 红线），非法条目跳过并报告；人工复核后并入 `data/seed`。
- 缺少 arkcli 时提示并退出，不阻塞离线交付。样本见 `data/generated/sample-questions.json`。

### 接入真实数据库（PostgreSQL）

```bash
docker compose up -d                 # 本地起库（或用 Supabase / Neon 连接串）
# .env: DATA_SOURCE=db, DATABASE_URL=postgresql://into_the_sea:into_the_sea@localhost:5432/into_the_sea?schema=public
pnpm prisma:generate && pnpm prisma db push
pnpm db:seed                          # 分批写入 8000+ 题、500+ 案例（pnpm db:seed --reset 重建）
```

`DATA_SOURCE=db` 时，练习 / 申论 / 招录情报改从数据库读取（筛选·分页·随机抽样下推 SQL）；
未配置时自动回退 seed JSON。真实数据来源与摄取（GitHub / 小红书 / 考公平台）见 [`docs/DATA-SOURCES.md`](./docs/DATA-SOURCES.md)。

### 规模化后的数据流（重要）

- 题库达数千题，**题目不再进入客户端 bundle**：练习集由 `POST /api/practice` 在服务端筛选 / 抽样后下发（单次默认 20 题、上限 50、套卷 25）。
- 申论 500 案例分页加载：`GET /api/essay?kind=case&limit=24&offset=N`，页面「加载更多」按需拉取。
- 错题本：答错自动收录（含题目快照，离线可渲染），重练时按 id 从 `/api/practice` 取回完整题目 → 反馈 → 标记已掌握，闭环完整。

### 写入数据库（可选）

- `pnpm db:seed` 将 seed JSON 写入 PostgreSQL（需 `DATABASE_URL`）；题库分批 `createMany + skipDuplicates`。
- 申论也可用导入脚本：`pnpm import:essays --kind=case --file=./data/import/cases.json`（zod 校验，缺 `sourceUrl` 跳过）。
- MVP 默认走 mock provider，直接读取 seed JSON，无需数据库即可演示。
