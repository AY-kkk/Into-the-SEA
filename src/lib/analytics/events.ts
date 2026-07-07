/** 关键业务漏斗事件名（集中管理，避免拼写漂移）。 */
export const FUNNEL_EVENTS = {
  // 鉴权漏斗
  REGISTER_SUBMIT: 'auth.register.submit',
  REGISTER_SUCCESS: 'auth.register.success',
  LOGIN_SUBMIT: 'auth.login.submit',
  LOGIN_SUCCESS: 'auth.login.success',
  // 刷题漏斗
  PRACTICE_START: 'practice.session.start',
  PRACTICE_ANSWER: 'practice.answer.submit',
  WRONG_ADDED: 'practice.wrong.added',
  WRONG_MASTERED: 'practice.wrong.mastered',
  // 面试漏斗
  INTERVIEW_START: 'interview.session.start',
  INTERVIEW_ANSWER: 'interview.answer.submit',
  INTERVIEW_REPORT: 'interview.report.generated',
  // 招录情报
  EXAM_SOURCE_CLICK: 'exam.source.click',
} as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[keyof typeof FUNNEL_EVENTS];

export interface AnalyticsEvent {
  event: string;
  props?: Record<string, string | number | boolean>;
  ts?: string;
}
