/**
 * sourceUrl 红线自动化校验（GOAL.md 铁律 4）。
 * 用法：
 *   pnpm validate:sources            # 结构校验：所有必需条目含合法 sourceUrl（离线，默认）
 *   pnpm validate:sources -- --net   # 附加联网可达性抽检（HEAD/GET，可能较慢）
 *   pnpm validate:sources -- --net --sample 30
 *
 * 退出码非 0 表示存在违规，可用于 CI 阻断。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Row {
  id?: string;
  sourceUrl?: string;
  [k: string]: unknown;
}

const SEED = join(process.cwd(), 'data', 'seed');
// 含外部来源、sourceUrl 不可省略的数据集（question 的 sourceUrl 可选）。
const REQUIRED_SOURCE = ['exam-infos.json', 'essay-cases.json', 'essay-originals.json'];

const args = process.argv.slice(2);
const doNet = args.includes('--net');
const sampleIdx = args.indexOf('--sample');
const sampleN = sampleIdx >= 0 ? Number(args[sampleIdx + 1] ?? '20') : 20;

function isValidHttpUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function load(file: string): Row[] {
  const raw = readFileSync(join(SEED, file), 'utf-8');
  const data = JSON.parse(raw) as Row[];
  return Array.isArray(data) ? data : [];
}

async function checkReachable(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    let res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow' });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', signal: ctrl.signal, redirect: 'follow' });
    }
    clearTimeout(t);
    return res.status < 400;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  let violations = 0;
  const allUrls = new Set<string>();

  for (const file of REQUIRED_SOURCE) {
    const rows = load(file);
    let missing = 0;
    let invalid = 0;
    for (const r of rows) {
      if (!r.sourceUrl || String(r.sourceUrl).trim() === '') {
        missing += 1;
        violations += 1;
        if (missing <= 5) console.error(`  ✗ [${file}] ${r.id ?? '(no id)'} 缺少 sourceUrl`);
      } else if (!isValidHttpUrl(String(r.sourceUrl))) {
        invalid += 1;
        violations += 1;
        if (invalid <= 5)
          console.error(`  ✗ [${file}] ${r.id ?? '(no id)'} sourceUrl 非法: ${r.sourceUrl}`);
      } else {
        allUrls.add(String(r.sourceUrl));
      }
    }
    const status = missing + invalid === 0 ? '✓' : '✗';
    console.log(`${status} ${file}: ${rows.length} 条，缺失 ${missing}，非法 ${invalid}`);
  }

  if (doNet) {
    const urls = [...allUrls];
    // 抽样以控制耗时
    const step = Math.max(1, Math.floor(urls.length / sampleN));
    const sample = urls.filter((_, i) => i % step === 0).slice(0, sampleN);
    console.log(`\n联网抽检 ${sample.length}/${urls.length} 个唯一 sourceUrl …`);
    let unreachable = 0;
    for (const u of sample) {
      const ok = await checkReachable(u);
      if (!ok) {
        unreachable += 1;
        console.error(`  ✗ 不可达: ${u}`);
      }
    }
    console.log(`联网抽检完成：不可达 ${unreachable}/${sample.length}`);
    // 联网不可达不直接判失败（网络/反爬因素），仅告警。
  }

  console.log(`\n唯一 sourceUrl 总数：${allUrls.size}`);
  if (violations > 0) {
    console.error(`\n❌ sourceUrl 校验未通过：${violations} 处违规`);
    process.exit(1);
  }
  console.log('\n✅ sourceUrl 红线校验通过');
}

void main();
