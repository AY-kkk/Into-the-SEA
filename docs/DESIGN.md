# 设计系统 · DESIGN

## 视觉基调
专业、可信、清爽、有陪伴感。**规避**廉价 AI 工具感、模板化 UI、蓝紫渐变。

## 色板（HSL, 见 globals.css）
- 背景：暖纸白 `40 33% 98%`
- 文本：深墨蓝灰 `200 18% 16%`
- 主色 primary：沉稳青绿 `187 62% 26%`（可信）
- 强调 accent：暖琥珀橙 `28 82% 52%`（行动/陪伴感）
- 语义：success 青绿、warning 琥珀、destructive 朱红
- 圆角：`--radius: 0.75rem`

## 纹理
Hero 区使用细网格 `.bg-grid`（非渐变），传达“工作台/情报台”质感。

## 生成素材（seeddream）
> GOAL.md §10：若 seeddream 可用则生成品牌吉祥物 / 空态 / 模块头图并落到
> `src/assets/generated/`，此处记录 prompt 与用途。当前环境未接入 seeddream，
> 采用占位方案，保留再生位。TODO(M8)。
