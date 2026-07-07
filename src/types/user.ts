import type { QuestionType } from './question';

/** 用户账号（真实鉴权体系）。 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

/** 会话（服务端存储，cookie 仅承载签名后的 sessionId）。 */
export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

/** 用户学习进度（MVP 兼容态；服务端持久化后由 PracticeState 承载）。 */
export interface UserProgress {
  answered: number;
  correct: number;
  wrongCount: number;
  accuracyByType: Partial<Record<QuestionType, number>>;
  streakDays: number;
  updatedAt: string;
}
