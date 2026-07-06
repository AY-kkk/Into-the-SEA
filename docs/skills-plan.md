# Skills / 能力评估计划

> 依据 GOAL.md §7：开发前评估相关方向 skill；无法真实安装则在此记录推荐列表与原因。
> 当前环境未接入外部 skill / GitHub 安装能力，以下为推荐与选型说明，随里程碑更新。

| 方向 | 推荐来源 | 适用能力 | 是否安装 | 使用方式 |
|------|----------|----------|----------|----------|
| Next.js 全栈 | [nextjs.org/docs](https://nextjs.org/docs) | App Router / Route Handlers / SSR | 否（作为技术栈直接采用） | 项目基座 |
| Tailwind / shadcn | [ui.shadcn.com](https://ui.shadcn.com) | 组件体系 / 设计 token | 部分（手写等价组件） | src/components/ui |
| Web scraping / search | Tavily / SerpAPI / Firecrawl / Exa | 招录情报与题库联网检索 | 否（mock 顶替 + 真实骨架） | providers/search |
| LLM interview agent | 火山方舟 Ark / OpenAI-compatible | 面试官对话 / 追问 / 报告 | 否（mock 顶替 + 真实骨架） | providers/llm |
| Quiz app | 自研 | 行测刷题 / 错题本 | 否（自研） | services/question |
| Prisma schema | [prisma.io/docs](https://www.prisma.io/docs) | 数据建模 / 迁移 | 是（已安装依赖） | prisma/schema.prisma |
| Testing / Playwright | Vitest / Playwright | 单测 / E2E | 部分（Vitest 已装） | vitest.config.ts |
| Vercel 部署 | [vercel.com/docs](https://vercel.com/docs) | 部署 / 环境变量 | 否（文档说明） | README 部署章节 |

## 说明
- 环境网络受限（企业镜像源），外部 skill 安装不可靠，因此对搜索与 LLM 采用 **mock provider + 真实接入骨架 + TODO 标注** 的策略（见 GOAL.md 硬约束）。
- 后续如获得真实 Key/网络，可通过 `.env` 切换 `*_PROVIDER=real` 直接启用真实实现。
