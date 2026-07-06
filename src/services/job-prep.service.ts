import { jobProfileSeed, type JobProfileSeed } from '@/lib/db/seed-data';
import { getQuestionSearchProvider } from '@/providers/question';
import type {
  FollowUpType,
  JobPositionId,
  JobPrepProfile,
  QuestionSearchResult,
  ResumeFollowUp,
} from '@/types/job';

/**
 * 岗位备考业务服务。
 * - 预置岗位 profile（六项输出中的 5 项）来自 seed；
 * - 简历追问由 generateResumeFollowUps 依据用户输入动态生成；
 * - 题库联网检索走 QuestionSearchProvider（可 mock/真实）。
 */

export function listPositions(): Array<{ id: JobPositionId; name: string }> {
  const preset = jobProfileSeed.map((p) => ({ id: p.positionId, name: p.positionName }));
  return [...preset, { id: 'custom', name: '自定义岗位' }];
}

export function getProfile(positionId: JobPositionId): JobProfileSeed | undefined {
  return jobProfileSeed.find((p) => p.positionId === positionId);
}

/**
 * 自定义岗位的兜底 profile：基于通用能力模型生成，保证「支持自定义输入」闭环。
 */
export function buildCustomProfile(positionName: string): JobProfileSeed {
  return {
    positionId: 'custom',
    positionName,
    writtenTopics: ['行测·言语理解', '行测·判断推理', '行测·资料分析', '申论·综合分析', '专业知识'],
    interviewQuestions: [
      `你为什么想应聘「${positionName}」这个岗位？`,
      `你认为「${positionName}」最核心的能力要求是什么？`,
      '请举一个能体现你相关能力的经历。',
      '面对陌生任务你通常如何快速上手？',
    ],
    competencyModel: [
      { name: '专业能力', description: `与「${positionName}」相关的专业素养`, weight: 30 },
      { name: '学习能力', description: '快速学习与适应', weight: 20 },
      { name: '沟通表达', description: '清晰表达与协作', weight: 20 },
      { name: '综合分析', description: '分析与解决问题', weight: 20 },
      { name: '稳定性', description: '长期发展意愿', weight: 10 },
    ],
    studyAdvice: [
      `围绕「${positionName}」职责梳理知识框架`,
      '准备 2-3 个 STAR 结构的经历案例',
      '关注行业动态与岗位真实工作内容',
    ],
    practicePath: ['岗位调研', '行测/专业笔试', '经历梳理', '模拟面试'],
  };
}

/**
 * 根据简历要点生成针对性追问。
 * 规则化生成（无外部依赖也可用）；标注四类：经历深挖 / 动机匹配 / 岗位胜任 / 压力测试。
 * TODO(real): 可切换为 LLMProvider 生成更贴合语义的追问。
 */
export function generateResumeFollowUps(
  resumeText: string,
  positionName: string,
): ResumeFollowUp[] {
  const points = resumeText
    .split(/[\n；;。]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 4);

  const followUps: ResumeFollowUp[] = [];
  const types: FollowUpType[] = ['experience', 'motivation', 'competency', 'stress'];

  points.forEach((point, idx) => {
    const type = types[idx % types.length]!;
    followUps.push(buildFollowUp(type, point, positionName));
  });

  // 若简历为空或过短，给出通用追问，保证闭环
  if (followUps.length === 0) {
    types.forEach((type) => followUps.push(buildFollowUp(type, '你的过往经历', positionName)));
  }
  return followUps;
}

function buildFollowUp(type: FollowUpType, point: string, positionName: string): ResumeFollowUp {
  switch (type) {
    case 'experience':
      return {
        type,
        question: `你提到「${point}」，请具体讲讲你在其中承担的角色、遇到的最大困难以及如何解决的？`,
        intent: '通过 STAR 追问核实经历真实性与贡献度',
      };
    case 'motivation':
      return {
        type,
        question: `「${point}」这段经历与你报考「${positionName}」之间有怎样的联系？`,
        intent: '考察求职动机与岗位的匹配度',
      };
    case 'competency':
      return {
        type,
        question: `从「${point}」中，你认为自己沉淀了哪些可迁移到「${positionName}」的能力？`,
        intent: '评估岗位胜任力与能力迁移',
      };
    case 'stress':
    default:
      return {
        type,
        question: `如果「${point}」的成果被质疑含有团队其他人的功劳，你会如何回应？`,
        intent: '压力测试下的应变与诚信表现',
      };
  }
}

/** 岗位相关题库联网检索（走 provider，结果保留 source_url）。 */
export async function searchPositionQuestions(
  positionName: string,
): Promise<QuestionSearchResult[]> {
  const provider = getQuestionSearchProvider();
  return provider.searchQuestions(positionName, { limit: 4 });
}

/** 组装完整 profile（含动态追问），供页面/接口使用。 */
export function assembleProfile(
  positionId: JobPositionId,
  options: { customName?: string; resumeText?: string } = {},
): JobPrepProfile {
  const base =
    positionId === 'custom'
      ? buildCustomProfile(options.customName ?? '自定义岗位')
      : (getProfile(positionId) ?? buildCustomProfile(options.customName ?? '自定义岗位'));
  const resumeFollowUps = options.resumeText
    ? generateResumeFollowUps(options.resumeText, base.positionName)
    : [];
  return { ...base, resumeFollowUps };
}
