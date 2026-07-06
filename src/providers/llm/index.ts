import { shouldUseReal } from '@/lib/env';
import type { LLMProvider } from '../types';
import { MockLLMProvider } from './mock';
import { RealLLMProvider } from './real';

/** 工厂：按 env 选择真实/mock，缺凭据自动降级 mock。 */
export function getLLMProvider(): LLMProvider {
  return shouldUseReal('llm') ? new RealLLMProvider() : new MockLLMProvider();
}

export { MockLLMProvider, RealLLMProvider };
