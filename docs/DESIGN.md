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

**已由火山方舟 seedream 真实生成并接入组件（非占位）。**

- 工具：`arkcli`（`@volcengine/ark-cli`）· 模型：`doubao-seedream-4-0` · 命令：`arkcli +gen --model doubao-seedream-4-0 --size <WxH> --watermark=false "<prompt>"`。
- 后处理：`sips` 缩放 + JPEG 质量 78 压缩为 web 友好 JPG（吉祥物/状态 ≤560px、鉴权 ≤720px、头图 ≤1200px；单张约 28–87KB）。
- 统一出口：`src/assets/generated/index.ts`（`MASCOTS` / `STATE_ART` / `MODULE_HERO` / `AUTH_ART` / `brandMark`）。
- 再生：`pnpm gen:assets`（脚本 `scripts/gen-assets.ts`，含全部 prompt + `STYLE_SUFFIX`），输出到 `raw/` 后按上文后处理落位同名文件。
- 通用风格后缀（`STYLE_SUFFIX`）：`扁平矢量插画风格，主色青绿(#1b5e63)与暖橙(#e07b29)点缀，纯暖纸白(#f7f3ea)背景，圆润12-16px圆角，克制柔和的轻投影，禁止刺眼渐变，禁止emoji和文字，专业可信有陪伴感，教育备考产品插画`。
- `brand-mark.svg` 为矢量 Logo（保留 SVG）。

### 素材登记表（文件 · prompt · 用途 · 引用组件）

> prompt 为核心语义，实际生成自动拼接上方 `STYLE_SUFFIX`。

#### 1. 品牌吉祥物（学士帽小海獭，4 姿态）

| 文件 | prompt（核心） | 用途 | 引用组件 / 路径 |
| ---- | -------------- | ---- | ---------------- |
| `mascot-wave.jpg` | 海獭微笑挥手打招呼 | 欢迎 | 首页 Hero `src/app/(app)/page.tsx`；`src/components/shared/mascot.tsx` |
| `mascot-cheer.jpg` | 海獭双手握拳高举加油 | 加油 | 侧栏页脚 `src/components/layout/sidebar.tsx`；答题结算（合格）`src/components/practice/quiz-runner.tsx` |
| `mascot-success.jpg` | 海獭捧金色星星庆祝 | 成功 | 成功态 `SuccessState`（`src/components/shared/states.tsx`，预留复用） |
| `mascot-think.jpg` | 海獭托腮思考，头顶问号 | 思考 | 答题结算（未达标）`src/components/practice/quiz-runner.tsx` |

#### 2. 状态插画

| 文件 | prompt（核心） | 用途 | 引用组件 / 路径 |
| ---- | -------------- | ---- | ---------------- |
| `empty-state.jpg` | 空文件夹与放大镜 | Empty 态 | `EmptyState`（`src/components/shared/states.tsx`） |
| `loading-state.jpg` | 加载进度环与渐隐圆点 | Loading 态 | `LoadingState`（同上，含 `animate-pulse`） |
| `success-state.jpg` | 金色奖章与上升折线 | Success 态 | `SuccessState`（同上） |
| `error-state.jpg` | 断开插头与感叹号 | Error 态 | `ErrorState`（同上） |

#### 3. 栏目头图（宽幅 Banner，右侧留白）

| 文件 | prompt（核心） | 用途 | 引用组件 / 路径 |
| ---- | -------------- | ---- | ---------------- |
| `hero-exam-news.jpg` | 公告栏与信息卡片 | 招录情报 Hero | `ModuleHero`（`src/components/shared/module-hero.tsx`）→ `PageShell heroKey`（`src/app/(app)/exam-news/page.tsx`） |
| `hero-job-prep.jpg` | 靶心与同心圆能力模型 | 岗位备考 Hero | 同上 → `src/app/(app)/job-prep/page.tsx` |
| `hero-practice.jpg` | 答题卡与勾选 | 行测刷题 Hero | 同上 → `src/app/(app)/practice/page.tsx` |
| `hero-essay.jpg` | 文稿纸与钢笔 | 申论案例 Hero | 同上 → `src/app/(app)/essay/page.tsx` |
| `hero-interview.jpg` | 对话气泡与麦克风 | 模拟面试 Hero | 同上 → `src/app/(app)/interview/page.tsx` |

#### 4. 鉴权品牌插画

| 文件 | prompt（核心） | 用途 | 引用组件 / 路径 |
| ---- | -------------- | ---- | ---------------- |
| `auth-login.jpg` | 海獭在门与钥匙旁 | 登录 | `AuthCard`（`src/components/auth/auth-card.tsx`）→ `src/app/(auth)/login/page.tsx` |
| `auth-register.jpg` | 海獭挥手 + 加号徽章 | 注册 | 同上 → `src/app/(auth)/register/page.tsx` |
| `auth-forgot.jpg` | 海獭思考 + 钥匙与锁 | 找回密码 | 同上 → `src/app/(auth)/forgot-password/page.tsx` |

#### 品牌标记

| 文件 | 用途 | 引用组件 / 路径 |
| ---- | ---- | ---------------- |
| `brand-mark.svg` | Logo（矢量） | 侧栏 `src/components/layout/sidebar.tsx`；鉴权外壳 `src/app/(auth)/layout.tsx` |
