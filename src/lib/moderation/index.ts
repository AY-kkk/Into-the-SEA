/**
 * 生成式 AI 内容审核（Gate1 合规：生成式内容审核机制）。
 * 目标：对用户输入（面试回答、简历文本、检索词）与模型输出进行最低限度审核，
 * 拦截明显违规内容并对个人敏感信息做脱敏，降低合规与滥用风险。
 *
 * 设计：
 *  - 本地规则引擎（关键词 + 正则）即时可用、无外部依赖、可离线；
 *  - 预留远程审核 provider 骨架（如阿里云/网易易盾/火山内容安全），env 配置后接入。
 *  - 结果分级：allow（放行）| mask（脱敏后放行）| block（拦截）。
 */

export type ModerationAction = 'allow' | 'mask' | 'block';

export interface ModerationResult {
  action: ModerationAction;
  /** 处理后的文本（mask 时为脱敏文本，block 时为空串，allow 为原文）。 */
  text: string;
  /** 命中的类别，便于日志与审计。 */
  categories: string[];
  reason?: string;
}

// 违规词库（最小集合，示意；生产应外置词库 + 远程服务）。
// 覆盖：政治敏感/暴恐、辱骂、违法交易等大类的占位样例。
const BLOCK_PATTERNS: { category: string; pattern: RegExp }[] = [
  { category: 'violence', pattern: /(制作|购买|贩卖)\s*(炸弹|枪支|毒品)/ },
  { category: 'illegal', pattern: /(代考|替考|作弊器材|贩卖考题|漏题)/ },
  { category: 'hate', pattern: /(去死|杀了你|傻[逼比屄])/ },
  { category: 'fraud', pattern: /(内部保过|包过|花钱买编制|关系户走后门包录用)/ },
];

// 个人敏感信息（PII）脱敏规则。
const PII_RULES: { category: string; pattern: RegExp; replacer: (m: string) => string }[] = [
  {
    category: 'id_card',
    pattern: /\b\d{17}[\dXx]\b/g,
    replacer: (m) => `${m.slice(0, 4)}**********${m.slice(-2)}`,
  },
  {
    category: 'phone',
    pattern: /\b1[3-9]\d{9}\b/g,
    replacer: (m) => `${m.slice(0, 3)}****${m.slice(-4)}`,
  },
  {
    category: 'bank_card',
    pattern: /\b\d{16,19}\b/g,
    replacer: (m) => `${m.slice(0, 4)}****${m.slice(-4)}`,
  },
  {
    category: 'email',
    pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g,
    replacer: (m) => {
      const [name, domain] = m.split('@');
      const head = (name ?? '').slice(0, 2);
      return `${head}***@${domain}`;
    },
  },
];

/** 本地规则审核（同步）。 */
export function moderateLocal(input: string): ModerationResult {
  const text = input ?? '';
  const categories: string[] = [];

  // 1) 违规拦截
  for (const { category, pattern } of BLOCK_PATTERNS) {
    if (pattern.test(text)) {
      return {
        action: 'block',
        text: '',
        categories: [category],
        reason: `命中违规类别：${category}`,
      };
    }
  }

  // 2) PII 脱敏
  let masked = text;
  for (const { category, pattern, replacer } of PII_RULES) {
    if (pattern.test(masked)) {
      categories.push(category);
      masked = masked.replace(pattern, (m) => replacer(m));
    }
  }

  if (categories.length > 0) {
    return { action: 'mask', text: masked, categories, reason: '已对个人敏感信息脱敏' };
  }
  return { action: 'allow', text, categories: [] };
}

/**
 * 审核入口（异步，便于将来接远程 provider）。
 * TODO(real): 当配置 MODERATION_PROVIDER=real + 凭据时，调用远程内容安全 API；
 * 远程失败时降级到本地规则（fail-open 到 mask/allow，但违规拦截以本地为准，fail-safe）。
 */
export async function moderate(input: string): Promise<ModerationResult> {
  // 目前仅本地引擎；远程 provider 见 TODO。
  return moderateLocal(input);
}
