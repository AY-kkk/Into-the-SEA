# 设计系统 · DESIGN

## 视觉基调

专业、可信、清爽、有陪伴感。**规避**廉价 AI 工具感、模板化 UI、蓝紫渐变。

## 色板（HSL, 见 src/app/globals.css）

| Token       | 亮色                   | 用途                  |
| ----------- | ---------------------- | --------------------- |
| background  | `40 33% 98%` 暖纸白    | 页面底色              |
| foreground  | `200 18% 16%` 深墨蓝灰 | 正文                  |
| primary     | `187 62% 26%` 沉稳青绿 | 主行动 / 强调（可信） |
| accent      | `28 82% 52%` 暖琥珀橙  | 次强调 / 陪伴感       |
| success     | `152 46% 38%`          | 正确 / 已完成         |
| warning     | `38 92% 50%`           | 进行中 / 提醒         |
| destructive | `0 68% 48%`            | 错误 / 删除           |

- 圆角：`--radius: 0.75rem`（柔和但不圆润过度）。
- 暗色模式：同 token 的 `.dark` 变体已定义。

## 纹理与动效

- Hero 区使用细网格 `.bg-grid`（非渐变），传达“情报台 / 工作台”质感。
- `animate-fade-in` 用于列表与结果的入场；进度条、能力模型条使用宽度过渡。

## 组件规范

- 基础组件位于 `src/components/ui`（Button/Card/Badge/Input/Textarea/Skeleton/SelectNative）。
- 四态统一走 `src/components/shared/states.tsx`（Loading/Empty/Error/Spinner）。
- 来源链接统一走 `SourceLink`（source_url 红线）。

## seeddream 生图素材（GOAL.md §10）

> 目标（GOAL.md §10）：品牌吉祥物多姿态、状态插画（空/加载/成功/错误）、五栏目头图、鉴权品牌插画；
> 风格与本设计系统统一（暖纸白 + 青绿/琥珀 + 12–16px 圆角、柔和轻投影），导出 web 友好格式，落到 `src/assets/generated/`。

**当前环境 seeddream（ark-cli）不可用 → 已按 §10 降级为一套「主题自适应手绘 SVG」并实际引用进组件（非空占位）。**

- 所有素材为 SVG，内置 `@media (prefers-color-scheme: dark)` 变体，**自动适配亮/暗双主题**，配色对齐 tailwind token。
- 统一出口：`src/assets/generated/index.ts`（`MASCOTS` / `STATE_ART` / `MODULE_HERO` / `AUTH_ART` / `brandMark`）。
- 生成脚本：`scripts/gen-assets.ts`（`pnpm gen:assets`）。具备 ark-cli 环境时执行，输出同名文件即可覆盖本套 SVG。
- 通用风格后缀（脚本 `STYLE_SUFFIX`）：`扁平矢量插画，青绿#1b5e63 与暖橙#e07b29 双主色，暖纸白#f7f3ea 背景，圆角 12-16px，柔和轻投影，克制质感，无刺眼渐变，无 emoji，支持亮/暗双主题`。

### 素材登记表（文件 · prompt · 用途 · 引用组件）

> prompt 为核心语义，实际生成时自动拼接上方 `STYLE_SUFFIX`。

#### 1. 品牌吉祥物（学士帽小海獭，4 姿态）

| 文件                 | prompt（核心）               | 用途 | 引用组件 / 路径                                                                                         |
| -------------------- | ---------------------------- | ---- | ------------------------------------------------------------------------------------------------------- |
| `mascot-wave.svg`    | 戴学士帽的海獭，微笑招手欢迎 | 欢迎 | 首页 Hero `src/app/(app)/page.tsx`；`src/components/shared/mascot.tsx`                                  |
| `mascot-cheer.svg`   | 海獭双手举拳加油鼓励         | 加油 | 侧栏页脚 `src/components/layout/sidebar.tsx`；答题结算（合格）`src/components/practice/quiz-runner.tsx` |
| `mascot-success.svg` | 海獭捧起金色星星庆祝         | 成功 | 成功态 `SuccessState`（`src/components/shared/states.tsx`，预留复用）                                   |
| `mascot-think.svg`   | 海獭托腮思考，头顶问号       | 思考 | 答题结算（未达标）`src/components/practice/quiz-runner.tsx`                                             |

#### 2. 状态插画

| 文件                | prompt（核心）       | 用途       | 引用组件 / 路径                                    |
| ------------------- | -------------------- | ---------- | -------------------------------------------------- |
| `empty-state.svg`   | 空文件夹与放大镜     | Empty 态   | `EmptyState`（`src/components/shared/states.tsx`） |
| `loading-state.svg` | 旋转加载环与渐隐圆点 | Loading 态 | `LoadingState`（同上，含 `animate-pulse`）         |
| `success-state.svg` | 奖章与上升折线       | Success 态 | `SuccessState`（同上）                             |
| `error-state.svg`   | 断开插头与提示图标   | Error 态   | `ErrorState`（同上）                               |

#### 3. 栏目头图（宽幅 Banner，右侧留白）

| 文件                 | prompt（核心）       | 用途          | 引用组件 / 路径                                                                                                    |
| -------------------- | -------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `hero-exam-news.svg` | 公告栏与信息卡片     | 招录情报 Hero | `ModuleHero`（`src/components/shared/module-hero.tsx`）→ `PageShell heroKey`（`src/app/(app)/exam-news/page.tsx`） |
| `hero-job-prep.svg`  | 靶心与同心圆能力模型 | 岗位备考 Hero | 同上 → `src/app/(app)/job-prep/page.tsx`                                                                           |
| `hero-practice.svg`  | 答题卡与勾选标记     | 行测刷题 Hero | 同上 → `src/app/(app)/practice/page.tsx`                                                                           |
| `hero-essay.svg`     | 文稿纸与笔           | 申论案例 Hero | 同上 → `src/app/(app)/essay/page.tsx`                                                                              |
| `hero-interview.svg` | 对话气泡与问答       | 模拟面试 Hero | 同上 → `src/app/(app)/interview/page.tsx`                                                                          |

#### 4. 鉴权品牌插画

| 文件                | prompt（核心）      | 用途     | 引用组件 / 路径                                                                    |
| ------------------- | ------------------- | -------- | ---------------------------------------------------------------------------------- |
| `auth-login.svg`    | 海獭在门与钥匙旁    | 登录     | `AuthCard`（`src/components/auth/auth-card.tsx`）→ `src/app/(auth)/login/page.tsx` |
| `auth-register.svg` | 海獭挥手 + 加号徽章 | 注册     | 同上 → `src/app/(auth)/register/page.tsx`                                          |
| `auth-forgot.svg`   | 海獭思考 + 钥匙与锁 | 找回密码 | 同上 → `src/app/(auth)/forgot-password/page.tsx`                                   |

#### 品牌标记

| 文件             | 用途 | 引用组件 / 路径                                                                |
| ---------------- | ---- | ------------------------------------------------------------------------------ |
| `brand-mark.svg` | Logo | 侧栏 `src/components/layout/sidebar.tsx`；鉴权外壳 `src/app/(auth)/layout.tsx` |

导出规范：SVG 优先（本套已全部为 SVG）；如以 seeddream 生成位图，导出 2x PNG 并压缩（tinypng/oxipng），文件名保持与 `index.ts` 登记一致。
