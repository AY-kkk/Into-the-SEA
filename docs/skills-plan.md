# Skills / 能力评估计划

> 依据 GOAL.md §7：开发前评估相关方向 skill；无法真实安装则在此记录推荐列表与原因。
> 当前环境未接入外部 skill / GitHub 一键安装能力，采用「自研 + mock provider + 真实接入骨架」策略。

## 候选评估表

| 方向                     | 来源链接                                                                                                       | 适用能力                          | 是否安装                                | 使用方式                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------- | ----------------------------------------------------------------- |
| Next.js 全栈             | https://nextjs.org/docs                                                                                        | App Router / Route Handlers / SSR | ✅ 已采用（核心栈）                     | `src/app` 路由与 `src/app/api`                                    |
| Tailwind + shadcn/ui     | https://ui.shadcn.com                                                                                          | 设计 token / 无障碍组件           | ✅ 部分（手写等价组件 + 自定义主题）    | `src/components/ui`                                               |
| Web scraping / search    | Tavily https://tavily.com · SerpAPI https://serpapi.com · Firecrawl https://firecrawl.dev · Exa https://exa.ai | 招录情报 / 题库联网检索           | ⛔ 未安装（mock 顶替 + real 骨架）      | `src/providers/search`、`src/providers/question`                  |
| LLM interview agent      | 火山方舟 Ark https://www.volcengine.com/product/ark · OpenAI https://platform.openai.com                       | 面试官对话 / 追问 / 报告          | ⛔ 未安装（mock 顶替 + real 骨架）      | `src/providers/llm`、`src/services/interview.service.ts`          |
| Quiz app                 | 自研                                                                                                           | 行测刷题 / 错题本                 | ✅ 自研                                 | `src/services/question.service.ts`、`src/store/practice-store.ts` |
| Prisma schema            | https://www.prisma.io/docs                                                                                     | 数据建模 / 迁移                   | ✅ 已安装                               | `prisma/schema.prisma`、`scripts/seed.ts`                         |
| Testing (Vitest)         | https://vitest.dev                                                                                             | 单元 / 逻辑测试                   | ✅ 已安装（44 测试）                    | `vitest.config.ts`、`*.test.ts`                                   |
| E2E (Playwright)         | https://playwright.dev                                                                                         | 端到端测试                        | ⛔ 未安装（推荐后续补充）               | 计划 `e2e/`                                                       |
| Vercel 部署              | https://vercel.com/docs                                                                                        | 部署 / 环境变量                   | ⛔ 未安装（文档说明）                   | README「部署」章节                                                |
| seeddream 生图 (ark-cli) | 火山方舟                                                                                                       | 品牌吉祥物 / 空态 / 头图素材      | ⛔ 当前环境不可用（占位 + prompt 记录） | `docs/DESIGN.md`、`src/assets/generated`                          |

## 选型说明与原因

1. **搜索 / LLM 采用 mock + 真实骨架**：企业镜像网络受限、无外部 API Key，直接联网不稳定。遵循 GOAL.md 硬约束「真实数据源不可用 → mock provider 顶替 + 保留真实接入接口 + TODO」。切换方式：`.env` 中将 `*_PROVIDER` 置为 `real` 并填入 Key（缺 Key 会自动降级 mock，见 `src/lib/env.ts` 的 `shouldUseReal`）。
2. **shadcn/ui 手写等价组件**：避免 CLI 拉取的网络与体积开销，同时完全掌控自定义主题（见 `docs/DESIGN.md`），规避模板化 / 蓝紫渐变。
3. **Playwright 推荐后续补充**：当前以 Vitest 覆盖 service/provider/engine 核心逻辑；E2E 可在部署后补充关键路径（刷题闭环、面试流程）。
4. **seeddream 素材**：环境不可用，已在 `docs/DESIGN.md` 记录 prompt 与用途，代码中使用矢量图标 + `.bg-grid` 纹理占位，保留再生位（TODO(M8+)）。
