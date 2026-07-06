import type { LLMMessage, LLMOptions, LLMProvider, LLMResponse } from '../types';

/**
 * Mock LLM provider：基于规则的确定性回复，用于面试/追问/报告演示。
 * 真实环境切换到 RealLLMProvider（OpenAI-compatible / 火山方舟 Ark）。
 */
export class MockLLMProvider implements LLMProvider {
  readonly name = 'mock-llm';

  async generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const last = messages[messages.length - 1]?.content ?? '';
    const system = messages.find((m) => m.role === 'system')?.content ?? '';

    if (options?.json) {
      return { content: this.buildJson(system, last), model: this.name };
    }
    return { content: this.buildText(system, last), model: this.name };
  }

  private buildText(system: string, last: string): string {
    if (system.includes('面试官') || system.includes('interviewer')) {
      return this.interviewReply(last);
    }
    return `（示例回复）我理解你的问题：「${last.slice(0, 40)}」。以下是结构化建议：\n1. 明确目标与考察点；\n2. 结合岗位能力模型作答；\n3. 用 STAR 法呈现经历。`;
  }

  private interviewReply(last: string): string {
    if (!last) {
      return '请先做个简单的自我介绍，并说明你为什么报考这个岗位？';
    }
    const followUps = [
      '你提到的经历中，最大的挑战是什么？你具体是怎么克服的？',
      '如果这项工作与你原本的预期不符，你会如何调整？',
      '请举一个你在团队中协调分歧的例子，结果如何？',
      '这个岗位需要长期扎根基层，你如何看待其中的枯燥与压力？',
    ];
    const idx = last.length % followUps.length;
    return followUps[idx] ?? followUps[0]!;
  }

  private buildJson(_system: string, _last: string): string {
    // 面试报告结构化 mock。
    const report = {
      overallScore: 82,
      scores: [
        { dimension: '综合分析', score: 84, comment: '能抓住问题核心，论述较有条理。' },
        { dimension: '言语表达', score: 80, comment: '表达清晰，可进一步精炼语言。' },
        { dimension: '岗位匹配', score: 85, comment: '对岗位职责理解到位，动机真诚。' },
        { dimension: '应变抗压', score: 78, comment: '面对追问基本沉稳，细节可再补充。' },
      ],
      strengths: ['逻辑清晰', '举例贴切', '态度真诚'],
      improvements: ['回答可更聚焦重点', '补充量化成果', '加强对政策背景的引用'],
      summary: '整体表现良好，具备岗位胜任潜力，建议加强结构化表达与案例的量化呈现。',
    };
    return JSON.stringify(report);
  }
}
