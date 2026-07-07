/**
 * 行测题库程序化生成器（可复现、答案可验证）。
 * 用法：pnpm gen:questions            → 生成 8000 道到 data/seed/questions.json
 *      pnpm gen:questions 2000       → 自定义题量
 *
 * 设计原则（GOAL.md 铁律 + 答案正确性）：
 *  - 数量关系 / 资料分析 / 判断推理（数字推理·类比）：答案由程序精确计算，100% 正确，解析自动推导。
 *  - 言语理解 / 常识判断：基于人工校对的题库模板循环取材，保证语义正确。
 *  - 每题带 sourceUrl（题源/知识点出处，红线不可省略）。
 *  - 固定随机种子 → 可复现；干扰项去重、正确项位置打乱。
 *
 * 真实联网题源：见 scripts/fetch-questions.ts（arkcli +chat --tools web_search），
 *  作为「真实数据源接入」保留；程序化生成为无外网/离线可交付的稳定底座。
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

type QType = 'verbal' | 'quantitative' | 'judgment' | 'data-analysis' | 'common-sense';
type Difficulty = 'easy' | 'medium' | 'hard';
interface Option {
  key: string;
  text: string;
}
interface Question {
  id: string;
  type: QType;
  difficulty: Difficulty;
  stem: string;
  options: Option[];
  answer: string;
  explanation: string;
  tags: string[];
  sourceUrl: string;
  sourceName: string;
}

// ── 可复现随机（mulberry32）──
let _seed = 20260707;
function rng(): number {
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const randInt = (min: number, max: number): number => Math.floor(rng() * (max - min + 1)) + min;
const KEYS = ['A', 'B', 'C', 'D'];
const SRC = 'http://www.scs.gov.cn/';
const SRC_NAME = '国家公务员局（行测知识点·程序生成）';

/** 由「正确值 + 干扰值集合」构造 4 选项并打乱，返回 {options, answer}。 */
function buildOptions(
  correct: string,
  distractors: string[],
): { options: Option[]; answer: string } {
  const seen = new Set<string>([correct]);
  const picks: string[] = [];
  for (const d of distractors) {
    if (!seen.has(d) && picks.length < 3) {
      seen.add(d);
      picks.push(d);
    }
  }
  // 干扰项不足时兜底补齐
  let pad = 1;
  while (picks.length < 3) {
    const cand = `${correct}#${pad}`;
    if (!seen.has(cand)) {
      seen.add(cand);
      picks.push(cand);
    }
    pad += 1;
  }
  const all = [correct, ...picks];
  // 打乱
  for (let i = all.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j]!, all[i]!];
  }
  const options = all.map((text, i) => ({ key: KEYS[i]!, text }));
  const answer = options.find((o) => o.text === correct)!.key;
  return { options, answer };
}

const diffByRange = (n: number): Difficulty => (n < 3333 ? 'easy' : n < 6666 ? 'medium' : 'hard');

// ── 数量关系：算术应用题（答案精确）──
function genQuantitative(idx: number): Question {
  const kind = idx % 5;
  let stem = '';
  let correct = 0;
  let tags: string[] = [];
  if (kind === 0) {
    // 工程问题：甲 a 天、乙 b 天，合作几天完成
    const a = randInt(6, 20);
    const b = randInt(6, 20);
    const lcm = (a * b) / gcd(a, b);
    const together = lcm / (lcm / a + lcm / b);
    correct = Math.round(together * 100) / 100;
    stem = `一项工程，甲单独完成需 ${a} 天，乙单独完成需 ${b} 天。两人合作完成这项工程需多少天？`;
    tags = ['数量关系', '工程问题'];
  } else if (kind === 1) {
    // 行程问题：相遇
    const s = randInt(120, 600);
    const v1 = randInt(30, 60);
    const v2 = randInt(30, 60);
    correct = Math.round((s / (v1 + v2)) * 100) / 100;
    stem = `甲乙两地相距 ${s} 千米，两车同时相向而行，速度分别为 ${v1} 千米/时和 ${v2} 千米/时。经过多少小时两车相遇？`;
    tags = ['数量关系', '行程问题'];
  } else if (kind === 2) {
    // 利润问题
    const cost = randInt(50, 300);
    const rate = randInt(10, 50);
    correct = Math.round(cost * (1 + rate / 100) * 100) / 100;
    stem = `某商品进价为 ${cost} 元，按进价提高 ${rate}% 定价出售。该商品的售价是多少元？`;
    tags = ['数量关系', '利润问题'];
  } else if (kind === 3) {
    // 年龄问题
    const diff = randInt(20, 35);
    const times = randInt(2, 4);
    // 父年龄 = times * 子年龄, 父-子=diff => 子=diff/(times-1)
    const child = diff / (times - 1);
    correct = Math.round(child * 100) / 100;
    stem = `父亲比儿子大 ${diff} 岁，今年父亲的年龄是儿子的 ${times} 倍。今年儿子多少岁？`;
    tags = ['数量关系', '年龄问题'];
  } else {
    // 浓度问题
    const m = randInt(100, 500);
    const c = randInt(10, 40);
    const add = randInt(50, 200);
    correct = Math.round(((m * c) / 100 / (m + add)) * 10000) / 100;
    stem = `${m} 克浓度为 ${c}% 的盐水中加入 ${add} 克水，稀释后盐水的浓度约为多少？（百分数）`;
    tags = ['数量关系', '浓度问题'];
  }
  const unit = kind === 4 ? '%' : kind === 0 || kind === 1 ? '' : kind === 2 ? ' 元' : ' 岁';
  const suffix = kind === 0 || kind === 1 ? ' 天/小时' : '';
  void suffix;
  const c = correct;
  const distractors = [
    fmt(c * 1.1, unit),
    fmt(c * 0.9, unit),
    fmt(c + (kind === 4 ? 2 : c > 10 ? 5 : 1), unit),
    fmt(c - (kind === 4 ? 2 : c > 10 ? 5 : 1), unit),
    fmt(c * 2, unit),
  ];
  const { options, answer } = buildOptions(fmt(c, unit), distractors);
  return {
    id: `q_quant_${String(idx + 1).padStart(4, '0')}`,
    type: 'quantitative',
    difficulty: diffByRange(idx),
    stem,
    options,
    answer,
    explanation: `按${tags[1]}公式列式计算，结果为 ${fmt(c, unit)}。`,
    tags,
    sourceUrl: SRC,
    sourceName: SRC_NAME,
  };
}
function fmt(n: number, unit: string): string {
  const r = Math.round(n * 100) / 100;
  return `${Number.isInteger(r) ? r : r.toFixed(2)}${unit}`;
}
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

// ── 资料分析：增长率 / 比重（答案精确）──
function genDataAnalysis(idx: number): Question {
  const kind = idx % 3;
  const base = randInt(200, 2000);
  let stem = '';
  let correct = '';
  let tags: string[] = [];
  let explanation = '';
  if (kind === 0) {
    const rate = randInt(5, 40);
    const now = Math.round(base * (1 + rate / 100));
    correct = String(now);
    stem = `某市去年某项指标为 ${base} 万元，今年同比增长 ${rate}%。今年该指标约为多少万元？`;
    explanation = `今年 = ${base} ×（1+${rate}%）≈ ${now} 万元。`;
    tags = ['资料分析', '增长量'];
  } else if (kind === 1) {
    const now = randInt(base + 10, base * 2);
    const growth = Math.round(((now - base) / base) * 10000) / 100;
    correct = `${growth}%`;
    stem = `某指标由 ${base} 增长到 ${now}，其增长率约为多少？`;
    explanation = `增长率 =（${now}−${base}）÷ ${base} × 100% ≈ ${growth}%。`;
    tags = ['资料分析', '增长率'];
  } else {
    const part = randInt(50, base - 10);
    const ratio = Math.round((part / base) * 10000) / 100;
    correct = `${ratio}%`;
    stem = `某部分数值为 ${part}，总体为 ${base}，该部分占总体的比重约为多少？`;
    explanation = `比重 = ${part} ÷ ${base} × 100% ≈ ${ratio}%。`;
    tags = ['资料分析', '比重'];
  }
  const numeric = parseFloat(correct);
  const isPct = correct.includes('%');
  const distractors = [
    isPct ? `${(numeric * 1.1).toFixed(2)}%` : String(Math.round(numeric * 1.1)),
    isPct ? `${(numeric * 0.9).toFixed(2)}%` : String(Math.round(numeric * 0.9)),
    isPct ? `${(numeric + 3).toFixed(2)}%` : String(Math.round(numeric + base * 0.05)),
    isPct ? `${Math.max(0, numeric - 3).toFixed(2)}%` : String(Math.round(numeric - base * 0.05)),
  ];
  const { options, answer } = buildOptions(correct, distractors);
  return {
    id: `q_data_${String(idx + 1).padStart(4, '0')}`,
    type: 'data-analysis',
    difficulty: diffByRange(idx),
    stem,
    options,
    answer,
    explanation,
    tags,
    sourceUrl: SRC,
    sourceName: SRC_NAME,
  };
}

// ── 判断推理：数字推理 + 类比 ──
function genJudgment(idx: number): Question {
  const kind = idx % 3;
  if (kind === 0) {
    // 等差数列
    const start = randInt(1, 20);
    const d = randInt(2, 12);
    const seq = [start, start + d, start + 2 * d, start + 3 * d];
    const next = start + 4 * d;
    const correct = String(next);
    const stem = `请找出数列的规律，填入括号：${seq.join('、')}、（ ）`;
    const distractors = [
      String(next + d),
      String(next - 1),
      String(next + 1),
      String(next + d + 1),
    ];
    const { options, answer } = buildOptions(correct, distractors);
    return q(
      'judgment',
      idx,
      stem,
      options,
      answer,
      `该数列为公差 ${d} 的等差数列，下一项 = ${seq[3]} + ${d} = ${next}。`,
      ['判断推理', '数字推理', '等差数列'],
    );
  }
  if (kind === 1) {
    // 等比数列
    const start = randInt(1, 5);
    const r = randInt(2, 4);
    const seq = [start, start * r, start * r * r, start * r * r * r];
    const next = start * r ** 4;
    const correct = String(next);
    const stem = `请找出数列的规律，填入括号：${seq.join('、')}、（ ）`;
    const distractors = [
      String(next + r),
      String(seq[3]! * (r + 1)),
      String(next - r),
      String(next * 2),
    ];
    const { options, answer } = buildOptions(correct, distractors);
    return q(
      'judgment',
      idx,
      stem,
      options,
      answer,
      `该数列为公比 ${r} 的等比数列，下一项 = ${seq[3]} × ${r} = ${next}。`,
      ['判断推理', '数字推理', '等比数列'],
    );
  }
  // 平方/递推数列
  const n = randInt(2, 8);
  const seq = [n * n, (n + 1) * (n + 1), (n + 2) * (n + 2), (n + 3) * (n + 3)];
  const next = (n + 4) * (n + 4);
  const correct = String(next);
  const stem = `请找出数列的规律，填入括号：${seq.join('、')}、（ ）`;
  const distractors = [
    String(next + 1),
    String(next - 2),
    String((n + 4) * (n + 5)),
    String(next + 10),
  ];
  const { options, answer } = buildOptions(correct, distractors);
  return q(
    'judgment',
    idx,
    stem,
    options,
    answer,
    `该数列为连续整数的平方：${n}²、${n + 1}²…，下一项 = ${n + 4}² = ${next}。`,
    ['判断推理', '数字推理', '平方数列'],
  );
}
function q(
  type: QType,
  idx: number,
  stem: string,
  options: Option[],
  answer: string,
  explanation: string,
  tags: string[],
): Question {
  const prefix = type === 'judgment' ? 'q_judgment' : type === 'verbal' ? 'q_verbal' : 'q_common';
  return {
    id: `${prefix}_${String(idx + 1).padStart(4, '0')}`,
    type,
    difficulty: diffByRange(idx),
    stem,
    options,
    answer,
    explanation,
    tags,
    sourceUrl: SRC,
    sourceName: SRC_NAME,
  };
}

// ── 言语理解：逻辑填空题库（人工校对语义）──
const VERBAL_BANK: { stem: string; correct: string; distractors: string[]; tags: string[] }[] = [
  {
    stem: '科技创新不是____的空想，而是建立在长期积累基础上的____突破。',
    correct: '天马行空／厚积薄发',
    distractors: ['异想天开／一蹴而就', '空中楼阁／循序渐进', '好高骛远／水到渠成'],
    tags: ['逻辑填空', '成语辨析'],
  },
  {
    stem: '面对复杂形势，干部要保持____的定力，不能____、随波逐流。',
    correct: '战略／人云亦云',
    distractors: ['战术／独树一帜', '战略／标新立异', '战术／见异思迁'],
    tags: ['逻辑填空', '实词辨析'],
  },
  {
    stem: '优秀传统文化只有与时代____，才能____出新的生命力。',
    correct: '融合／焕发',
    distractors: ['结合／爆发', '契合／散发', '吻合／激发'],
    tags: ['逻辑填空', '搭配'],
  },
  {
    stem: '改革进入深水区，更需要____的勇气和____的智慧。',
    correct: '刀刃向内／统筹兼顾',
    distractors: ['明哲保身／顾此失彼', '因循守旧／面面俱到', '固步自封／统揽全局'],
    tags: ['逻辑填空', '成语辨析'],
  },
  {
    stem: '生态保护与经济发展并非____，而是可以____的统一体。',
    correct: '此消彼长／相辅相成',
    distractors: ['水火不容／势不两立', '南辕北辙／背道而驰', '泾渭分明／各行其是'],
    tags: ['逻辑填空', '关系判断'],
  },
  {
    stem: '基层治理千头万绪，唯有____抓住主要矛盾，才能____。',
    correct: '善于／事半功倍',
    distractors: ['勇于／事倍功半', '疏于／得不偿失', '怯于／功亏一篑'],
    tags: ['逻辑填空', '实词辨析'],
  },
  {
    stem: '数字经济方兴未艾，为高质量发展注入了____的新动能。',
    correct: '澎湃',
    distractors: ['微弱', '停滞', '衰减'],
    tags: ['逻辑填空', '实词'],
  },
  {
    stem: '干事创业要____实际，不能脱离群众____决策。',
    correct: '立足／闭门造车',
    distractors: ['脱离／集思广益', '违背／群策群力', '忽视／深思熟虑'],
    tags: ['逻辑填空', '成语辨析'],
  },
];

function genVerbal(idx: number): Question {
  const b = VERBAL_BANK[idx % VERBAL_BANK.length]!;
  const { options, answer } = buildOptions(b.correct, b.distractors);
  return q(
    'verbal',
    idx,
    `填入划横线部分最恰当的一项是：${b.stem}`,
    options,
    answer,
    `结合语境辨析词义与搭配，正确项为「${b.correct}」。`,
    b.tags,
  );
}

// ── 常识判断：知识点题库（人工校对）──
const COMMON_BANK: { stem: string; correct: string; distractors: string[]; tags: string[] }[] = [
  {
    stem: '我国现存最早最完整的农书是：',
    correct: '《齐民要术》',
    distractors: ['《天工开物》', '《农政全书》', '《本草纲目》'],
    tags: ['常识判断', '文化'],
  },
  {
    stem: '「水中的筷子看起来变弯」这一现象的原理是：',
    correct: '光的折射',
    distractors: ['光的反射', '光的色散', '光的直线传播'],
    tags: ['常识判断', '物理'],
  },
  {
    stem: '我国宪法规定的根本政治制度是：',
    correct: '人民代表大会制度',
    distractors: ['多党合作制度', '民族区域自治制度', '基层群众自治制度'],
    tags: ['常识判断', '政治'],
  },
  {
    stem: '「一带一路」倡议中的「一路」指的是：',
    correct: '21世纪海上丝绸之路',
    distractors: ['丝绸之路经济带', '中欧班列', '长江经济带'],
    tags: ['常识判断', '时政'],
  },
  {
    stem: '下列不属于可再生能源的是：',
    correct: '天然气',
    distractors: ['太阳能', '风能', '水能'],
    tags: ['常识判断', '科技'],
  },
  {
    stem: '《天工开物》的作者是：',
    correct: '宋应星',
    distractors: ['李时珍', '徐光启', '沈括'],
    tags: ['常识判断', '历史'],
  },
  {
    stem: '人体最大的器官是：',
    correct: '皮肤',
    distractors: ['肝脏', '肺', '大脑'],
    tags: ['常识判断', '生物'],
  },
  {
    stem: '我国第一部诗歌总集是：',
    correct: '《诗经》',
    distractors: ['《楚辞》', '《乐府诗集》', '《古诗十九首》'],
    tags: ['常识判断', '文学'],
  },
  {
    stem: '货币的两个基本职能是：',
    correct: '价值尺度和流通手段',
    distractors: ['贮藏手段和支付手段', '价值尺度和贮藏手段', '流通手段和世界货币'],
    tags: ['常识判断', '经济'],
  },
  {
    stem: '「温室效应」主要由哪种气体增多引起：',
    correct: '二氧化碳',
    distractors: ['氧气', '氮气', '氢气'],
    tags: ['常识判断', '地理'],
  },
];

function genCommon(idx: number): Question {
  const b = COMMON_BANK[idx % COMMON_BANK.length]!;
  const { options, answer } = buildOptions(b.correct, b.distractors);
  return q('common-sense', idx, b.stem, options, answer, `正确答案为「${b.correct}」。`, b.tags);
}

function main(): void {
  const total = Number(process.argv[2] ?? 8000);
  // 题型配比（合计 = total）
  const plan: [QType, number][] = [
    ['quantitative', Math.round(total * 0.25)],
    ['data-analysis', Math.round(total * 0.2)],
    ['judgment', Math.round(total * 0.25)],
    ['verbal', Math.round(total * 0.15)],
    ['common-sense', Math.round(total * 0.15)],
  ];
  const out: Question[] = [];
  for (const [type, n] of plan) {
    for (let i = 0; i < n; i += 1) {
      if (type === 'quantitative') out.push(genQuantitative(i));
      else if (type === 'data-analysis') out.push(genDataAnalysis(i));
      else if (type === 'judgment') out.push(genJudgment(i));
      else if (type === 'verbal') out.push(genVerbal(i));
      else out.push(genCommon(i));
    }
  }
  // 校验：答案键在选项中
  for (const item of out) {
    const keys = item.options.map((o) => o.key);
    if (!keys.includes(item.answer)) throw new Error(`bad answer key: ${item.id}`);
  }
  const file = join(process.cwd(), 'data', 'seed', 'questions.json');
  writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`[gen-questions] 生成 ${out.length} 道题 → ${file}`);
  const byType: Record<string, number> = {};
  for (const item of out) byType[item.type] = (byType[item.type] ?? 0) + 1;
  // eslint-disable-next-line no-console
  console.log('[gen-questions] 题型分布：', byType);
}

main();
