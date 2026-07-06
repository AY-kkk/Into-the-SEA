import { shouldUseReal } from '@/lib/env';
import type { SearchProvider } from '../types';
import { MockSearchProvider } from './mock';
import { RealSearchProvider } from './real';

/** 工厂：按 env 选择真实/mock，缺凭据自动降级 mock。 */
export function getSearchProvider(): SearchProvider {
  return shouldUseReal('search') ? new RealSearchProvider() : new MockSearchProvider();
}

export { MockSearchProvider, RealSearchProvider };
