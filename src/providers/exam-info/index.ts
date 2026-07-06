import { shouldUseReal } from '@/lib/env';
import type { ExamInfoProvider } from '../types';
import { MockExamInfoProvider } from './mock';
import { RealExamInfoProvider } from './real';

/** 工厂：按 env 选择真实/mock。 */
export function getExamInfoProvider(): ExamInfoProvider {
  return shouldUseReal('exam') ? new RealExamInfoProvider() : new MockExamInfoProvider();
}

export { MockExamInfoProvider, RealExamInfoProvider };
