# 数据来源与摄取（DATA-SOURCES）

本项目题库 / 案例的三类来源，均**保留 `sourceUrl` 溯源（GOAL.md 红线）**。

## 1. 程序化生成（离线底座，答案可验证）

| 脚本                     | 产出                         | 说明                                          |
| ------------------------ | ---------------------------- | --------------------------------------------- |
| `pnpm gen:questions [n]` | `data/seed/questions.json`   | 8000 题；数量/资料/数字推理答案由程序精确计算 |
| `pnpm gen:essays [n]`    | `data/seed/essay-cases.json` | 500 案例；来源取自真实政府/媒体官网域名       |

## 2. GitHub 公开题库（真实来源，优先 MIT 许可 · 2020 年后）

```bash
pnpm ingest -- --gongkaowx --merge   # ★ MIT 许可，360 题（推荐）
pnpm ingest -- --github --merge      # quizsim，161 题（无明确许可，谨慎）
```

| 源                                                              | 许可    | 更新 | 数量 | 说明                                                                                                                             |
| --------------------------------------------------------------- | ------- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`ACCS-0521/GongKaoWX`](https://github.com/ACCS-0521/GongKaoWX) | **MIT** | 2026 | 360  | 6 分类（言语/数量/判断/资料/常识/政治）各 60 题，含解析·知识点·`sourceRefs`；政治并入常识判断。原创/依公开资料编写，非官方真题。 |
| [`lawson2019/quizsim`](https://github.com/lawson2019/quizsim)   | 无声明  | 2025 | 161  | 言语/资料纯文本题（图形推理依赖图片，跳过）。                                                                                    |

- **许可边界**：GongKaoWX 的 MIT 仅覆盖其代码与原创内容；其 `sourceRefs` 引用的公开资料权利归原权利人。
  quizsim 未声明许可（NOASSERTION），当前仅作「引用/学习改编」并完整标注来源，**商用前需确认授权**。
- 所有并入题目逐条保留 `sourceUrl`：优先题目自带来源，缺失时回退仓库地址；`sourceName` 注明 via 来源与许可。
- 去重按题干；答案键无效 / 缺题干的条目自动跳过。

## 3. 小红书 / 考公平台（全网搜索，arkcli web_search）

```bash
pnpm ingest -- --web-essays --n 20          # 写 data/import/web-essays.json
pnpm ingest -- --web-essays --n 20 --merge  # 校验后并入 data/seed/essay-cases.json
pnpm fetch:questions -- --type common-sense --n 20 --out data/generated/q.json
```

- 底层：火山方舟 `arkcli +chat --tools web_search` 联网检索（可参考小红书公考博主整理、
  华图 / 中公 / 公考通等平台公开文章），产出经 zod 校验（答案键有效 / `sourceUrl` 红线），非法条目跳过。
- **合规提示**：小红书、各考公平台内容受版权与平台协议约束，无开放批量 API。
  本管线用于**检索公开信息并归纳带来源的素材**，不做原文抓取转载；入库前需人工复核来源与版权。
- 缺少 arkcli 时脚本提示并退出，不阻塞离线交付。

## 接入真实数据库（PostgreSQL）

1. 起库（任选其一）：
   - 本地：`docker compose up -d`（见 `docker-compose.yml`）。
   - 云：Supabase / Neon，复制连接串。
2. 配置 `.env`：`DATA_SOURCE=db` 与 `DATABASE_URL=...`。
3. 建表 + 写数据：
   ```bash
   pnpm prisma:generate
   pnpm prisma db push          # 依 schema 建表
   pnpm db:seed                 # 分批 createMany 写入（8000+ 题、500+ 案例）
   # 重建：pnpm db:seed --reset
   ```
4. 运行：`DATA_SOURCE=db` 时，`/api/practice`、`/api/essay`、招录情报均从数据库读取
   （筛选 / 分页 / 随机抽样下推到 SQL）；未配置则自动回退 seed JSON（不阻塞演示）。

> 数据流详见 README「规模化后的数据流」。DB 读取仓储层：`src/lib/db/repository.ts`（含单元测试 `repository.test.ts`）。
