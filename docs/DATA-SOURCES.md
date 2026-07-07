# 数据来源与摄取（DATA-SOURCES）

本项目题库 / 案例的三类来源，均**保留 `sourceUrl` 溯源（GOAL.md 红线）**。

## 1. 程序化生成（离线底座，答案可验证）

| 脚本                     | 产出                         | 说明                                          |
| ------------------------ | ---------------------------- | --------------------------------------------- |
| `pnpm gen:questions [n]` | `data/seed/questions.json`   | 8000 题；数量/资料/数字推理答案由程序精确计算 |
| `pnpm gen:essays [n]`    | `data/seed/essay-cases.json` | 500 案例；来源取自真实政府/媒体官网域名       |

## 2. GitHub 公开题库（真实真题整理）

```bash
pnpm ingest -- --github          # 解析写入 data/import/github-questions.json
pnpm ingest -- --github --merge  # 去重并入 data/seed/questions.json
```

- 源：[`lawson2019/quizsim`](https://github.com/lawson2019/quizsim)（言语理解 / 资料分析纯文本题，含解析）。
  图形推理依赖图片，自动跳过。解析出约 160+ 道纯文本题，逐条写入 `sourceUrl`。
- **许可提示**：该仓库未声明开源许可（NOASSERTION）。当前仅作「引用 / 学习改编」并完整标注来源；
  **正式商用前需与原作者确认授权**，或替换为明确授权的题库。

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
