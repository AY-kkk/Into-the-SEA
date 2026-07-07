# RUNBOOK · 运维手册（上线/应急/切换）

## 1. 环境与配置

所有配置见 `.env.example`。生产必须设置：

- `AUTH_SECRET`（≥16 位，会话签名）
- `DATABASE_URL` + `DATA_SOURCE=db`（真实持久化）
- 如启用真实 AI：`LLM_PROVIDER=real` + `LLM_BASE_URL`/`LLM_API_KEY`/`LLM_MODEL`

`src/lib/env.ts` 的 `shouldUseReal()`/`shouldUseDb()` 在缺凭据时自动降级 mock/seed，不崩溃。
生产缺 `AUTH_SECRET` 会**直接抛错**（安全红线）。

## 2. 部署（Vercel）

1. 导入仓库，Framework=Next.js，Build=`pnpm build`，Install=`pnpm install`。
2. 配置环境变量（至少 `AUTH_SECRET`；接入库再加 `DATABASE_URL` + `DATA_SOURCE=db`）。
3. 数据库：`pnpm prisma:generate && pnpm prisma db push && pnpm db:seed`。

## 3. 健康检查

- `GET /api/health` → `{ status, dataSource, db, providers }`。
  - `status=degraded` 表示配置了 DB 但连接失败。用于探活与告警。

## 4. 切换真实 Provider

| 能力                  | 开关                            | 必需凭据                           |
| --------------------- | ------------------------------- | ---------------------------------- |
| 数据库读写            | `DATA_SOURCE=db`                | `DATABASE_URL`                     |
| LLM（面试/追问/评分） | `LLM_PROVIDER=real`             | `LLM_API_KEY`(+BASE_URL+MODEL)     |
| 搜索                  | `SEARCH_PROVIDER=real`          | `SEARCH_API_KEY`+`SEARCH_ENDPOINT` |
| 岗位题库检索          | `QUESTION_SEARCH_PROVIDER=real` | `SEARCH_API_KEY`                   |

切换后用 `/api/health` 确认，并跑一次模拟面试冒烟。

## 5. 数据更新

- 招录情报：`pnpm ingest -- --github` / `--web-essays`，人工复核后并入 `data/seed`，再 `pnpm db:seed`。
- 来源校验：`pnpm validate:sources`（离线，CI 阻断项）；`pnpm validate:sources -- --net` 抽检可达性。
- 页面展示「数据更新时间」+ 陈旧提示（见 `getExamInfoFreshness`）。

## 6. 成本与滥用应急

- 调低 `LLM_DAILY_CALL_CAP` / `RATE_LIMIT_MAX` 可即时收紧。
- 429 频发 → 检查是否被刷；LLM 账单异常 → 临时将 `LLM_PROVIDER=mock` 熔断。

## 7. 备份与回滚

- 数据库：启用云厂商自动备份（Supabase/Neon 均支持 PITR）。**TODO：配置每日快照。**
- 回滚：Vercel Deployments → Promote 上一个稳定版本（一键回滚）。
- 无数据库时的文件持久化位于 `data/runtime/`（仅用于开发/演示，不用于生产）。

## 8. 事故预案（简版）

1. 站点 5xx：查 `/api/health` + 结构化日志（`logger`）+ Sentry（配置后）。
2. 登录不可用：确认 `AUTH_SECRET` 未变更（变更会使旧会话失效）。
3. 数据源故障：确认 `DATA_SOURCE`/`DATABASE_URL`；必要时临时回退 `seed`。
