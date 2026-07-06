import { env } from '@/lib/env';
import type { LLMMessage, LLMOptions, LLMProvider, LLMResponse } from '../types';

/**
 * 真实 LLM provider 骨架：OpenAI-compatible / 火山方舟 Ark。
 * 通过 LLM_BASE_URL + LLM_API_KEY + LLM_MODEL（或 OPENAI_* 备用）接入。
 */
export class RealLLMProvider implements LLMProvider {
  readonly name = 'real-llm';

  async generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const baseUrl = env.LLM_BASE_URL ?? env.OPENAI_BASE_URL;
    const apiKey = env.LLM_API_KEY ?? env.OPENAI_API_KEY;
    const model = env.LLM_MODEL ?? env.OPENAI_MODEL;
    if (!baseUrl || !apiKey || !model) {
      throw new Error('[RealLLMProvider] 缺少 LLM_BASE_URL / LLM_API_KEY / LLM_MODEL 配置');
    }

    // TODO(real): 接入 chat completions（OpenAI-compatible）。
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        ...(options?.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!res.ok) {
      throw new Error(`[RealLLMProvider] 请求失败：${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? '';
    return { content, model };
  }
}
