import { shouldUseReal } from '@/lib/env';
import type { QuestionSearchProvider } from '../types';
import { MockQuestionSearchProvider } from './mock';
import { RealQuestionSearchProvider } from './real';

/** 工厂：按 env 选择真实/mock。 */
export function getQuestionSearchProvider(): QuestionSearchProvider {
  return shouldUseReal('question')
    ? new RealQuestionSearchProvider()
    : new MockQuestionSearchProvider();
}

export { MockQuestionSearchProvider, RealQuestionSearchProvider };
