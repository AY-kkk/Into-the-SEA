# generated assets

品牌与插画素材（GOAL.md §10），由火山方舟 **seedream**（`doubao-seedream-4-0`）经 `arkcli +gen` **真实生成**，
`sips` 压缩为 web 友好 JPG，并已实际引用进组件（非空占位）。

- 统一从 `index.ts` 引用：`MASCOTS` / `STATE_ART` / `MODULE_HERO` / `AUTH_ART` / `brandMark`。
- 清单（文件名 · prompt · 用途 · 引用组件）见 `docs/DESIGN.md`「素材登记表」。
- 再生：`pnpm gen:assets`（脚本 `scripts/gen-assets.ts`，含全部 prompt + STYLE_SUFFIX），
  输出到 `raw/` 后经 sips 后处理落位同名文件。

## 文件

- 吉祥物：`mascot-wave` `mascot-cheer` `mascot-success` `mascot-think`（.jpg）
- 状态：`empty-state` `loading-state` `success-state` `error-state`（.jpg）
- 栏目头图：`hero-exam-news` `hero-job-prep` `hero-practice` `hero-essay` `hero-interview`（.jpg）
- 鉴权：`auth-login` `auth-register` `auth-forgot`（.jpg）
- 品牌：`brand-mark`（.svg 矢量 Logo）
