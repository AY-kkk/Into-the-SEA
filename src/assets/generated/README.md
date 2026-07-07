# generated assets

品牌与插画素材（GOAL.md §10）。当前环境 seeddream（ark-cli）不可用，已按 §10 降级为
**一套主题自适应手绘 SVG** 并实际引用进组件（非空占位）。

- 全部为 SVG，内置 `@media (prefers-color-scheme: dark)`，自动适配亮/暗双主题，配色对齐 tailwind token。
- 统一从 `index.ts` 引用：`MASCOTS` / `STATE_ART` / `MODULE_HERO` / `AUTH_ART` / `brandMark`。
- 清单（文件名 · prompt · 用途 · 引用组件）见 `docs/DESIGN.md`「素材登记表」。
- 再生：`pnpm gen:assets`（脚本 `scripts/gen-assets.ts`）；具备 ark-cli 时输出同名文件覆盖即可。

## 文件

- 吉祥物：`mascot-wave` `mascot-cheer` `mascot-success` `mascot-think`
- 状态：`empty-state` `loading-state` `success-state` `error-state`
- 栏目头图：`hero-exam-news` `hero-job-prep` `hero-practice` `hero-essay` `hero-interview`
- 鉴权：`auth-login` `auth-register` `auth-forgot`
- 品牌：`brand-mark`
