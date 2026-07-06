# 项目目标：国企 / 公务员上岸小助手（Web 版 MVP）

> 本文件是 Codex Loop 的**北极星目标**。每一轮迭代开始前必须重读本文件，结束前必须对照「验收清单」自检并更新进度。
> 最终标准：一个**可上线的 MVP**，像真实可持续迭代的教育备考类 SaaS 产品雏形，而非静态 UI 壳子。最终完整代码上传到我的代码仓库[AY-kkk/Into-the-SEA](https://github.com/AY-kkk/Into-the-SEA)当中

---

## 0. 给 Codex Loop 的执行纲领（每轮必读）

1. **禁止一次性堆砌**：按下方「里程碑与迭代顺序」逐步推进，每轮聚焦 1 个可验证的增量。
2. **每轮结束必做**：
   - 运行 `pnpm build` / `pnpm lint` / `pnpm test`（或对应命令）确保不破坏已有能力。
   - 在本文件末尾「进度日志」追加一条：完成了什么、验证方式、下一步。
   - 勾选「验收清单」中已达成项。
3. **禁止硬编码任何外部 API Key**，全部走 `.env` + `.env.example`。
4. **业务逻辑禁止写进 React 组件**，必须落在 `services/` 与 `providers/` 层。
5. **来源链接字段（source_url）在任何数据模型与页面中都不可省略。**
6. 真实数据源不可用时，用 **mock provider** 顶替，但必须保留真实接入接口与 TODO 标注。
7. 若单轮 context 不足，优先保证「架构清晰 + 五大模块闭环 + 核心路径可演示」。

---

## 1. 产品定位

面向准备秋招、国考、省考、国企招聘、三支一扶等方向的学生，帮助其完成：
信息收集 · 岗位备考 · 行测刷题 · 申论学习 · 模拟面试。

**风格关键词**：专业、可信、清爽、有陪伴感。**严禁**廉价 AI 工具感、模板化 UI、蓝紫渐变。

---

## 2. 技术栈（约束）

- **前端**：Next.js 14+ App Router · React 18+ · TypeScript（严格模式）· Tailwind CSS · shadcn/ui · Framer Motion · Lucide React · Zustand
- **后端**：Next.js Route Handlers · PostgreSQL（Supabase / Neon）· Prisma ORM · Redis（可选）
- **AI/搜索**：可配置 LLM Provider 抽象层（OpenAI-compatible / 火山方舟 Ark）· 可替换 Search Provider（Bing / SerpAPI / Tavily / Firecrawl / Exa）
- **所有 Key 走环境变量，禁止硬编码。**

---

## 3. 路由与导航结构

左侧 Sidebar + 顶部状态区 + 主内容区（Dashboard 式布局），五大路由风格统一：

| 路由         | 模块           |
| ------------ | -------------- |
| `/`          | 首页 Dashboard |
| `/exam-news` | 招录情报       |
| `/job-prep`  | 岗位备考       |
| `/practice`  | 行测刷题       |
| `/essay`     | 申论案例       |
| `/interview` | 模拟面试       |

**首页 Dashboard 展示**：今日招录动态 · 推荐岗位 · 练习进度 · 错题数 · 申论推荐 · 最近面试摘要。

---

## 4. 五大模块功能定义

### 模块一：招录情报 `/exam-news`

- 列表字段：标题 · 类型（国考/省考/国企/事业单位/三支一扶）· 地区 · 报名/考试时间 · 招录人数 · 学历/专业要求 · **来源链接（必展示）**
- 筛选：类型 · 地区 · 报名状态（未开始/进行中/已截止）· 学历 · 关键词
- 后端：`ExamInfoProvider` 抽象接口，支持多数据源组合 + 去重 + 手动/定时刷新扩展位
- MVP 可 mock，但必须预留真实接入位置

### 模块二：岗位备考 `/job-prep`

- 岗位选择：国考综合管理岗 · 省考基层岗 · 国企管培生 · 国企产品/运营/市场 · 三支一扶各方向 · 支持自定义输入
- 每岗输出：笔试高频题型 · 常见面试问题 · 岗位能力模型 · 简历追问问题 · 备考建议 · 练习路径
- `QuestionSearchProvider` 抽象接口，联网搜索题库，结果保留 `source_url`
- 简历追问：用户输入简历要点 → 生成针对性追问，标注类型（经历深挖/动机匹配/岗位胜任/压力测试）
- 一键跳转模拟面试，携带岗位上下文

### 模块三：行测刷题 `/practice`

- 题型：言语理解 · 数量关系 · 判断推理 · 资料分析 · 常识判断
- 模式：顺序 · 随机 · 专项 · 模拟套卷 · 错题重练
- 每题：题干 · 选项 · 正确答案 · 解析 · 难度 · 题型 · 来源（可选）
- 答题即时反馈，自动加入错题本
- 错题本：按题型筛选 · 重新练习 · 标记「已掌握」
- 题库必须结构化，支持 JSON seed 或数据库 seed

### 模块四：申论优秀案例 `/essay`

- 优秀案例库（目标 100 条）：标题 · 主题标签 · 适用话题 · 案例正文摘要 · 可迁移表达 · 使用场景 · **来源链接（必展示）**
- 过往原题库（目标 100 条）：年份 · 考试类型 · 地区 · 题目类型 · 题干 · 材料摘要 · **来源链接（必展示）**
- MVP 若无法补齐 200 条真实数据：必须完成数据结构 + 导入脚本 + mock seed，并在 README 说明扩充方式
- 筛选：主题（基层治理/乡村振兴/数字政府/民生服务/生态文明/青年奋斗等）· 考试类型 · 关键词
- 学习辅助：「这个案例怎么用」· 可迁移金句 · 收藏（可选）

### 模块五：模拟面试 `/interview`

- 类型：结构化 · 半结构化 · 国企岗位面试 · 公务员岗位面试（无领导小组讨论预留占位）
- 配置：目标岗位 · 面试类型 · 难度（基础/标准/压力）· 时长 · 是否基于简历追问
- 流程：AI 开场 → 逐题提问 → 用户回答 → AI 追问 → 生成总结反馈
- 报告维度：内容完整度 · 逻辑结构 · 岗位匹配度 · 表达清晰度 · 政策理解/公共服务意识 · 风险点 · 改进建议 · 示范回答
- 面试会话必须持久化；设计 `InterviewEngine` 抽象层；LLM 调用禁止写在页面组件；含基础错误处理（超时/API 失败/空回复）

---

## 5. 前端设计规范

- 参考风格：https://dribbble.com/shots/27243936-Dashboard-for-an-Education-Product-Filko
- 布局：左 Sidebar + 顶部状态区 + 主内容区，五栏保持一致布局语言
- 色彩：米白/暖灰背景 + 深青/墨绿/橙色/靛蓝强调色；**禁止廉价蓝紫渐变**
- 组件规范：卡片 · 标签 · 筛选器 · 题目卡 · 进度条 · 统计卡 · 时间线 · 聊天式面试界面，统一设计语言
- 所有状态完整：loading · empty · error · success
- 响应式：桌面优先，兼容平板与移动端基础浏览
- 动效：轻量增强质感，不过度炫技

---

## 6. 后端架构要求

- 业务逻辑独立成 service，不写进组件
- 所有外部服务走 Provider 抽象
- 所有 API 路由具备输入校验（如 zod）+ 错误处理
- TypeScript 严格类型，杜绝 `any` 泛滥

**目录结构（约定）**
src/
app/ 路由与页面
components/ UI 组件（按模块分组）
lib/ ai/search/ db/validators/ utils/
services/ exam-info・question・essay・interview・wrong-question
providers/ search/・llm/・exam-info/
types/ exam・question・essay・interview・user
data/seed/ exam-infos.json・questions.json・essay-cases.json
prisma/ schema.prisma
plaintext

**四大 Provider 接口（必须实现）**

````ts
interface SearchProvider { search(query: string, options?: SearchOptions): Promise<SearchResult[]> }
interface LLMProvider { generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> }
interface ExamInfoProvider { fetchLatest(options?: FetchOptions): Promise<ExamInfo[]> }
interface InterviewEngine {
  startSession(config: InterviewConfig): Promise<InterviewSession>
  generateNextQuestion(sessionId: string, userAnswer?: string): Promise<InterviewMessage>
  summarizeSession(sessionId: string): Promise<InterviewReport>
}
7. Skills / GitHub 能力补充
开发前评估以下方向的 skill（Next.js 全栈・Tailwind/shadcn・Web scraping/search・LLM interview agent・Quiz app・Prisma schema・Testing/Playwright・Vercel 部署）。
每个候选评估：名称・来源链接・适用能力・是否安装・使用方式。
若无法真实安装 → 在 docs/skills-plan.md 记录推荐列表与原因。
8. 代码质量要求
TS 严格类型・组件职责清晰・service/provider/types/components 分层明确・mock 数据集中管理・.env.example 完整・ESLint/Prettier 配置・基础单元测试或关键逻辑测试・README 说明启动 / 配置 / 扩展 / 部署。
9. 验收清单（Definition of Done — 每轮勾选）
- [x] 五个栏目均可访问且功能闭环
- [x] 首页 Dashboard 正常展示（今日动态 / 推荐岗位 / 进度 / 错题数 / 申论推荐 / 面试摘要）
- [x] 招录信息来源链接页面可见
- [x] 行测刷题含错题本完整流程（答题→反馈→入错题本→重练→标记已掌握）
- [x] 申论案例 / 原题来源链接页面可见
- [x] 模拟面试支持会话问答与总结反馈，且会话持久化
- [x] service/provider 抽象清晰，mock 与真实接入位置有标注
- [x] UI 视觉完成度高，非默认模板样式（自定义暖纸白+青绿+琥珀主题，规避蓝紫渐变/模板感）
- [x] README + .env.example + docs/skills-plan.md 完整
- [x] pnpm build / lint / test 全绿
10. 硬约束（红线）
不做 UI 壳子，必须有可演示的业务逻辑
不把所有功能塞进单文件
不硬编码任何外部 API Key
source_url 字段不可省略
不用模板化 / 廉价 AI 风格 UI
真实数据源不可用 → mock provider 顶替 + 保留真实接入接口
优先级：架构清晰 > 五大模块闭环 > 核心路径可演示
11. 里程碑与迭代顺序（Codex Loop 推进路线）
一次一个里程碑，完成并自检通过后再进入下一个。
M0 脚手架：Next.js 14 App Router + TS 严格 + Tailwind + shadcn/ui + ESLint/Prettier + 目录结构 + .env.example + README 骨架。产出：pnpm dev 可启动空 Dashboard 布局（Sidebar + 顶部 + 五路由占位）。
M1 类型与数据层：types/ 全量定义 + Prisma schema + data/seed/*.json（含 source_url）+ seed 脚本。
M2 Provider 抽象：四大 Provider 接口 + mock 实现 + 真实实现骨架（TODO 标注）+ env 校验。
M3 招录情报：列表 + 筛选 + 来源链接展示 + ExamInfoProvider 接入 + API 路由 + 四态。
M4 行测刷题：题库 seed + 五模式 + 即时反馈 + 错题本闭环。
M5 申论案例：案例 / 原题双库 + 筛选 + 来源链接展示 + 导入脚本 + 学习辅助。
M6 岗位备考：岗位选择 + 六项输出 + 简历追问 + QuestionSearchProvider + 跳转面试带上下文。
M7 模拟面试：InterviewEngine + 会话持久化 + 聊天式 UI + 追问 + 面试报告全维度。
M8 打磨：首页 Dashboard 聚合真实数据・全站四态・动效・响应式・测试・README/skills-plan 完善・Vercel 部署说明。
12. 进度日志（Codex Loop 每轮追加）

### [M0] 脚手架完成 — 2026-07-07
- 完成内容：
  - 初始化 Next.js 14 (App Router) + React 18 + TypeScript 严格模式（含 noUncheckedIndexedAccess）。
  - Tailwind CSS 自定义主题（暖纸白 + 沉稳青绿 primary + 琥珀 accent，规避蓝紫渐变/模板感）+ shadcn/ui 风格基础组件（Button / Card / Badge / Input / Textarea / Skeleton）。
  - ESLint（@typescript-eslint，no-explicit-any=error）+ Prettier + tailwind 插件。
  - 目录结构落地：app / components(ui,layout,shared) / lib(ai,search,db,validators,utils) / services / providers(search,llm,exam-info,question) / types / store / data/seed / prisma / scripts / docs。
  - Dashboard 布局：Sidebar（五模块+首页导航）+ Topbar + 移动端底部导航；首页概览 + 五路由占位页（标注对应里程碑）。
  - .env.example（Provider 开关 + Ark/OpenAI/Search/DB/Redis 占位，零硬编码密钥）、prisma/schema.prisma 占位、seed 脚本占位。
  - README（启动/脚本/结构/配置/部署）、AGENTS.md、docs/skills-plan.md、docs/DESIGN.md。
- 验证方式：`pnpm build`✅ `pnpm lint`✅ `pnpm test`(3 passed)✅ `tsc --noEmit`✅；`next dev` 首页与各路由 HTTP 200。
- 下一步：M1 类型与数据层（types/ 全量定义 + Prisma 全模型 + data/seed/*.json 含 source_url + seed 脚本）。

### [M1] 类型与数据层 — 2026-07-07
- 完成内容：
  - types/ 全量定义：common（枚举/四态/SourceRef 含 sourceUrl 红线）、exam、question、essay、job、interview、user，统一从 types/index.ts 导出。
  - Prisma 全模型：ExamInfo / Question / AnswerRecord / WrongQuestion / EssayCase / EssayOriginal / InterviewSession / InterviewMessage / AppMeta，含来源实体均保留 sourceUrl；prisma generate 通过。
  - data/seed/*.json：招录情报 8 条、行测题 12 条（覆盖五题型）、申论案例 6 条、申论原题 6 条，全部带真实 sourceUrl。
  - src/lib/db/prisma.ts（客户端单例）+ src/lib/db/seed-data.ts（类型化 seed 访问，供 mock provider）。
  - scripts/seed.ts：从 JSON upsert 写入 Prisma。
  - 单测新增 seed 数据完整性校验（sourceUrl 红线 + 答案键有效性）。
  - README 增补「数据扩充说明」（申论 100 条扩充方式）。
- 验证方式：`tsc --noEmit`✅ `pnpm lint`✅ `pnpm test`(7 passed)✅ `pnpm build`✅。
- 下一步：M2 四大 Provider 抽象（Search/LLM/ExamInfo/QuestionSearch）+ mock 实现 + 真实骨架 TODO + env 校验。

### [M2] Provider 抽象 — 2026-07-07
- 完成内容：
  - src/lib/env.ts：zod 环境变量校验 + shouldUseReal() 降级逻辑（缺凭据自动回退 mock）。
  - providers/types.ts：四大接口 SearchProvider / LLMProvider / ExamInfoProvider / QuestionSearchProvider（另含 InterviewEngine 定义，M7 实现）。
  - 每类 provider 提供 mock 实现 + real 骨架（TODO 标注 + 缺配置报错）+ 工厂函数：
    - search：MockSearchProvider / RealSearchProvider（Tavily 等示例）。
    - llm：MockLLMProvider（规则化面试/报告 JSON）/ RealLLMProvider（OpenAI-compatible / Ark）。
    - exam-info：MockExamInfoProvider（读 seed + 筛选 + 去重 + 排序）/ RealExamInfoProvider。
    - question：MockQuestionSearchProvider / RealQuestionSearchProvider（复用 SearchProvider）。
  - providers/index.ts 统一导出工厂。
  - 新增 provider 单测（招录筛选/sourceUrl 红线/LLM mock JSON），共 14 测试全过。
- 验证方式：`tsc --noEmit`✅ `pnpm lint`✅ `pnpm test`(14 passed)✅ `pnpm build`✅。
- 下一步：M3 招录情报页面（列表 + 多维筛选 + 来源链接展示 + API 路由 + 四态）。

### [M3] 招录情报 — 2026-07-07
- 完成内容：
  - lib/validators/exam.ts：zod 校验筛选参数（类型/地区/状态/学历/关键词/limit）。
  - services/exam-info.service.ts：listExamInfo / getLatestExamInfo / getRegionOptions / deriveStatus（业务逻辑集中，不入组件）。
  - API 路由 GET /api/exam-news：zod 校验 + 400/502 错误处理，provider 失败降级可读报错。
  - 共享组件：SelectNative、states(Loading/Empty/Error/Spinner 四态)、SourceLink（source_url 红线）。
  - 页面 /exam-news：SSR 首屏 + 客户端筛选（关键词防抖）+ 四态渲染；ExamCard 展示类型/状态/地区/人数/学历/时间/专业/来源链接。
  - 服务单测（deriveStatus 三态 + limit + 关键词过滤）；累计 19 测试全过。
  - 冒烟：/api/exam-news 类型/关键词筛选正确，非法 limit=400，页面 200。
- 验证方式：`tsc`✅ `pnpm lint`✅ `pnpm test`(19)✅ `pnpm build`✅ + dev 冒烟。
- 下一步：M4 行测刷题（题库 seed 五模式 + 即时反馈 + 错题本闭环）。

### [M4] 行测刷题 — 2026-07-07
- 完成内容：
  - services/question.service.ts：buildPracticeSet 支持五模式（顺序/随机/专项/套卷/错题重练）+ getTypeCounts / getQuestionsByIds。
  - store/practice-store.ts：Zustand + persist(localStorage) 记录作答与错题本（答错自动收录、markMastered、resolveWrong、getActiveWrongIds）。
  - lib/practice-stats.ts：从记录派生正确率/按题型统计/未掌握错题数（供 Dashboard 复用）。
  - 组件：QuizRunner（选项即时反馈 + 解析 + 进度条 + 来源链接 + 结算页）、WrongBook（题型筛选 + 重练/单题重练 + 标记已掌握 + 移除）、PracticeView（Tab 切换 + 五模式选择 + 专项题型下拉）。
  - 页面 /practice：SSR 传入题型计数 + 客户端练习编排。
  - 单测：question.service(6) + practice-stats(2)；累计 27 全过。
  - 闭环验证：答题→即时反馈→答错入错题本→错题本重练→标记已掌握。
- 验证方式：`tsc`✅ `pnpm lint`✅ `pnpm test`(27)✅ `pnpm build`✅ + dev 冒烟(200, 五模式渲染)。
- 下一步：M5 申论案例（案例/原题双库 + 筛选 + 来源链接 + 导入脚本 + 学习辅助）。

### [M5] 申论案例 — 2026-07-07
- 完成内容：
  - services/essay.service.ts：listEssayCases / listEssayOriginals（主题/类型/年份/关键词筛选 + 年份倒序）+ getOriginalYears + getRecommendedCases。
  - lib/validators/essay.ts（zod）；API 路由 GET /api/essay?kind=case|original，400/502 处理。
  - 组件：CaseCard（可迁移表达/适用/场景/来源）、OriginalCard（年份/类型/题型/材料摘要/来源）、EssayView（案例/原题双 Tab + 筛选 + 四态 + 防抖）。
  - 学习辅助：案例卡突出「可迁移表达」金句与「使用场景」，便于素材积累。
  - 导入脚本 scripts/import-essays.ts（pnpm import:essays）：zod 校验，sourceUrl 缺失/非法条目跳过并报告，用于扩充至 100 条；README 更新用法。
  - 单测 essay.service(4)（含 sourceUrl 红线）；累计 31 全过。
- 验证方式：`tsc`✅ `pnpm lint`✅ `pnpm test`(31)✅ `pnpm build`✅ + dev 冒烟(案例6/国考原题3，sourceUrl 全含)。
- 下一步：M6 岗位备考（岗位选择 + 六项输出 + 简历追问 + QuestionSearchProvider + 跳转面试带上下文）。

### [M6] 岗位备考 — 2026-07-07
- 完成内容：
  - data/seed/job-profiles.json：5 个预置岗位（国考综合管理/省考基层/国企管培生/国企产品运营市场/三支一扶）+ 自定义兜底。
  - services/job-prep.service.ts：listPositions / getProfile / buildCustomProfile / generateResumeFollowUps（四类追问：经历深挖/动机匹配/岗位胜任/压力测试）/ searchPositionQuestions（走 QuestionSearchProvider，保留 sourceUrl）/ assembleProfile。
  - API：POST /api/job-prep/follow-ups、GET /api/job-prep/questions（zod 校验 + 400/502）。
  - store/interview-context-store.ts：岗位上下文交接给模拟面试（一键跳转带 context）。
  - 组件：ProfilePanels（六项输出的五项：题型/能力模型带权重条/面试问题/建议/练习路径）、JobPrepView（岗位选择+自定义输入、简历追问生成、题库联网检索、一键模拟面试）。
  - 单测 job-prep.service(7)（含四类追问齐全 + sourceUrl 红线）；累计 38 全过。
- 验证方式：`tsc`✅ `pnpm lint`✅ `pnpm test`(38)✅ `pnpm build`✅ + dev 冒烟(追问/题库检索/页面 200)。
- 下一步：M7 模拟面试（InterviewEngine + 会话持久化 + 聊天式 UI + 追问 + 面试报告全维度）。

### [M7] 模拟面试 — 2026-07-07
- 完成内容：
  - services/interview.service.ts：generateOpening / generateNext（followUpOf 追问语义）/ generateReport（多维度 JSON，安全解析兜底）/ askedCount，底层走 LLMProvider。
  - providers/interview：SessionStore 抽象 + InMemorySessionStore（默认）+ PrismaSessionStore 骨架(TODO)；DefaultInterviewEngine 实现 InterviewEngine 抽象（startSession/generateNextQuestion/summarizeSession）+ getInterviewEngine 工厂（单例存储）。
  - API：/api/interview/start、/next、/report（zod 校验 + 400/502）。
  - store/interview-store.ts：Zustand+persist(localStorage) 会话持久化（创建/追加/报告/历史/删除），满足「会话持久化」。
  - 组件：InterviewSetup（岗位/模式/题量，接收 job-prep 上下文）、ChatRunner（聊天气泡 + 追问标记 + 进度 + 结束生成报告）、ReportView（综合分+分维度+优势+建议）、InterviewView（setup/chat/report 切换 + 历史会话侧栏）。
  - 消费 interview-context-store 实现岗位备考→面试上下文交接。
  - 单测 interview.service(4) + engine 持久化(2)；累计 44 全过。
- 验证方式：`tsc`✅ `pnpm lint`✅ `pnpm test`(44)✅ `pnpm build`✅ + dev 冒烟(start/next 追问/report 多维度)。
- 下一步：M8 打磨（首页 Dashboard 聚合真实数据 + 全站四态 + 动效 + 响应式 + README/skills-plan 完善 + 部署说明 + 素材）。

### [M8] 打磨与收尾 — 2026-07-07
- 完成内容：
  - 首页 Dashboard 聚合六要素：今日招录动态(SSR)、推荐岗位、练习进度/综合正确率/待攻克错题(客户端 store)、申论推荐、最近面试摘要；含来源链接。
  - StatCards / InterviewSummary 客户端聚合持久化数据；全站沿用四态(Loading/Empty/Error) + animate-fade-in 动效 + 响应式栅格 + 移动端底部导航。
  - docs/skills-plan.md 完整候选评估表 + 选型原因；docs/DESIGN.md 记录色板/动效/seeddream prompt 清单；scripts/gen-assets.ts（ark-cli 缺失自动降级）+ 占位 brand-mark.svg 引用进 Sidebar。
  - README 补充部署(Vercel)详解、本地生产预览、架构与扩展点、脚本表(import:essays/gen:assets)。
  - Prettier 全量格式化；SVG 静态导入类型声明。
- 验证方式：`tsc`✅ `pnpm lint`✅ `pnpm test`(44)✅ `pnpm build`✅ + dev 全六路由 200 + Dashboard 六要素渲染。
- 结论：M0–M8 全部完成，验收清单 10 项全部达成。

plaintext
10. seeddream 生图素材（新增）
调用 ark-cli seeddream 生成一组风格统一、可复用的前端素材，落到 frontend/src/assets/generated/：
品牌吉祥物（秋招主题，如一只鼓励求职的角色）多姿态 / 表情。
空状态 / 成功 / 错误 插画各若干。
五个栏目的模块图标 / 头图（风格与参考稿一致）。
登录 / 注册页的品牌插画。
要求：风格与 §6 参考稿统一（配色、圆角、质感一致）；导出 web 友好格式（SVG/PNG，压缩）。
素材实际引用进对应组件（空态、Hero、导航），并在 docs/DESIGN.md 记录 prompt 与用途，便于复用 / 再生。
若 seeddream 在当前环境不可用：降级用占位插画，但保留生成脚本与 prompt，标注 TODO，不阻塞交付。---

上面就是完整的 `GOAL.md` 内容,可直接复制。文件也已经保存在工程里(`gongkao-assistant/GOAL.md`)。

如果你还想要那份精简的 `AGENTS.md`(Codex 会自动读取的约定文件),我也一并贴出来给你复制:

```markdown
# AGENTS.md — Codex Loop 工程约定

本工程目标见 GOAL.md。**每轮迭代前必读 GOAL.md,结束前更新其「进度日志」与「验收清单」。**

## 铁律
1. 按 GOAL.md 第 11 节「里程碑 M0→M8」顺序推进,一次只做一个可验证增量。
2. 业务逻辑落 services/ 与 providers/,禁止写进 React 组件。
3. 所有外部 Key 走 .env,禁止硬编码;维护 .env.example。
4. 数据模型与页面的 source_url 字段不可省略。
5. 真实数据源不可用 → mock provider 顶替 + 保留真实接入接口 + TODO 标注。
6. TS 严格类型,杜绝 any。

## 每轮结束检查
- pnpm build && pnpm lint && pnpm test 全绿。
- 追加一条进度日志到 GOAL.md 第 12 节。
- 勾选 GOAL.md 第 9 节已达成的验收项。

## 技术栈
Next.js 14 App Router · React 18 · TS 严格 · Tailwind · shadcn/ui · Framer Motion · Zustand · Prisma + PostgreS
````
