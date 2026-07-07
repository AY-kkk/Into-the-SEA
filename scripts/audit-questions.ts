/**
 * 题库答案正确性独立审计（Gate2：抽检正确率 ≥ 99%）。
 * 不依赖生成器：直接从 data/seed/questions.json 的题干正则解析题目参数，
 * 独立重算答案并与标注 answer 对应的选项值比对，输出各题型正确率。
 *
 * 用法：pnpm audit:questions            # 全量审计可计算题型
 *      pnpm audit:questions -- --min 99 # 自定义阈值（低于则退出码非 0，供 CI）
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface Option {
  key: string;
  text: string;
}
interface Q {
  id: string;
  type: string;
  stem: string;
  options: Option[];
  answer: string;
  tags?: string[];
}

const FILE = join(process.cwd(), 'data', 'seed', 'questions.json');
const questions = JSON.parse(readFileSync(FILE, 'utf-8')) as Q[];

const args = process.argv.slice(2);
const minIdx = args.indexOf('--min');
const minAccuracy = minIdx >= 0 ? Number(args[minIdx + 1] ?? '99') : 99;

const num = (s: string): number => parseFloat(s.replace(/[^\d.-]/g, ''));
const answerText = (q: Q): string => q.options.find((o) => o.key === q.answer)?.text ?? '';
const approx = (a: number, b: number, eps = 0.05): boolean => Math.abs(a - b) <= eps;

interface Stat {
  checked: number;
  correct: number;
  fails: string[];
}
const stats: Record<string, Stat> = {};
function record(cat: string, ok: boolean, id: string): void {
  const s = (stats[cat] ??= { checked: 0, correct: 0, fails: [] });
  s.checked += 1;
  if (ok) s.correct += 1;
  else if (s.fails.length < 8) s.fails.push(id);
}

for (const q of questions) {
  const t = answerText(q);
  const av = num(t);

  // ── 数量关系 ──
  if (q.type === 'quantitative') {
    let m: RegExpMatchArray | null;
    if ((m = q.stem.match(/甲单独完成需 (\d+) 天，乙单独完成需 (\d+) 天/))) {
      const a = +m[1]!;
      const b = +m[2]!;
      const together = (a * b) / (a + b);
      record('quant:工程', approx(av, Math.round(together * 100) / 100), q.id);
    } else if ((m = q.stem.match(/相距 (\d+) 千米.*速度分别为 (\d+) 千米\/时和 (\d+) 千米\/时/))) {
      const s = +m[1]!;
      const v1 = +m[2]!;
      const v2 = +m[3]!;
      record('quant:行程', approx(av, Math.round((s / (v1 + v2)) * 100) / 100), q.id);
    } else if ((m = q.stem.match(/进价为 (\d+) 元，按进价提高 (\d+)%/))) {
      const cost = +m[1]!;
      const rate = +m[2]!;
      record('quant:利润', approx(av, Math.round(cost * (1 + rate / 100) * 100) / 100), q.id);
    } else if ((m = q.stem.match(/父亲比儿子大 (\d+) 岁，今年父亲的年龄是儿子的 (\d+) 倍/))) {
      const diff = +m[1]!;
      const times = +m[2]!;
      record('quant:年龄', approx(av, Math.round((diff / (times - 1)) * 100) / 100), q.id);
    } else if ((m = q.stem.match(/(\d+) 克浓度为 (\d+)% 的盐水中加入 (\d+) 克水/))) {
      const mass = +m[1]!;
      const c = +m[2]!;
      const add = +m[3]!;
      record(
        'quant:浓度',
        approx(av, Math.round(((mass * c) / 100 / (mass + add)) * 10000) / 100),
        q.id,
      );
    }
    continue;
  }

  // ── 资料分析 ──
  if (q.type === 'data-analysis') {
    let m: RegExpMatchArray | null;
    if ((m = q.stem.match(/去年某项指标为 (\d+) 万元，今年同比增长 (\d+)%/))) {
      const base = +m[1]!;
      const rate = +m[2]!;
      record('data:增长量', approx(av, Math.round(base * (1 + rate / 100)), 1), q.id);
    } else if ((m = q.stem.match(/由 (\d+) 增长到 (\d+)，其增长率/))) {
      const base = +m[1]!;
      const now = +m[2]!;
      record('data:增长率', approx(av, Math.round(((now - base) / base) * 10000) / 100), q.id);
    } else if ((m = q.stem.match(/某部分数值为 (\d+)，总体为 (\d+)/))) {
      const part = +m[1]!;
      const base = +m[2]!;
      record('data:比重', approx(av, Math.round((part / base) * 10000) / 100), q.id);
    }
    continue;
  }

  // ── 判断推理：数字推理数列 ──
  if (q.type === 'judgment') {
    const m = q.stem.match(/填入括号：([\d、]+)、（ ）/);
    if (m) {
      const seq = m[1]!.split('、').filter(Boolean).map(Number);
      if (seq.length >= 3) {
        const [a, b, c] = seq;
        let expected: number | null = null;
        const d1 = b! - a!;
        const d2 = c! - b!;
        if (d1 === d2) {
          expected = seq[seq.length - 1]! + d1; // 等差
        } else if (a !== 0 && b! / a! === c! / b!) {
          expected = seq[seq.length - 1]! * (b! / a!); // 等比
        } else {
          // 平方数列：seq[i] = (n+i)^2
          const root = Math.sqrt(a!);
          if (Number.isInteger(root)) {
            expected = (root + seq.length) ** 2;
          }
        }
        if (expected !== null) record('judgment:数列', approx(av, expected, 0.5), q.id);
      }
    }
    continue;
  }
}

console.log(`题库总数：${questions.length}\n`);
let totalChecked = 0;
let totalCorrect = 0;
for (const [cat, s] of Object.entries(stats)) {
  const acc = (s.correct / s.checked) * 100;
  totalChecked += s.checked;
  totalCorrect += s.correct;
  const flag = acc >= minAccuracy ? '✓' : '✗';
  console.log(
    `${flag} ${cat.padEnd(16)} 抽检 ${s.checked}，正确 ${s.correct}，正确率 ${acc.toFixed(2)}%${s.fails.length ? `（示例失败 ${s.fails.join(',')}）` : ''}`,
  );
}
const overall = (totalCorrect / totalChecked) * 100;
console.log(
  `\n可计算题型总抽检：${totalChecked}，正确 ${totalCorrect}，总正确率 ${overall.toFixed(3)}%`,
);
console.log(`（言语/常识类为人工校对模板库，不参与自动重算）`);

if (overall < minAccuracy) {
  console.error(`\n❌ 正确率 ${overall.toFixed(3)}% 低于阈值 ${minAccuracy}%`);
  process.exit(1);
}
console.log(`\n✅ 答案正确率达标（≥ ${minAccuracy}%）`);
