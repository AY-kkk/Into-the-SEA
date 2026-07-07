/**
 * 生成素材统一出口（GOAL.md §10）。
 * 全部为主题自适应 SVG（亮/暗双主题，对齐 tailwind token：teal primary / amber accent / 暖纸白）。
 * prompt、用途、引用组件见 docs/DESIGN.md。
 * seeddream 真实生成脚本见 scripts/gen-assets.ts（ark-cli 缺失时降级为本套手绘 SVG）。
 */
import type { StaticImageData } from 'next/image';

import brandMark from './brand-mark.svg';
import mascotWave from './mascot-wave.svg';
import mascotCheer from './mascot-cheer.svg';
import mascotSuccess from './mascot-success.svg';
import mascotThink from './mascot-think.svg';
import emptyState from './empty-state.svg';
import loadingState from './loading-state.svg';
import successState from './success-state.svg';
import errorState from './error-state.svg';
import heroExamNews from './hero-exam-news.svg';
import heroJobPrep from './hero-job-prep.svg';
import heroPractice from './hero-practice.svg';
import heroEssay from './hero-essay.svg';
import heroInterview from './hero-interview.svg';
import authLogin from './auth-login.svg';
import authRegister from './auth-register.svg';
import authForgot from './auth-forgot.svg';

/** 品牌吉祥物（学士帽小海獭）四姿态。 */
export const MASCOTS = {
  wave: mascotWave,
  cheer: mascotCheer,
  success: mascotSuccess,
  think: mascotThink,
} satisfies Record<string, StaticImageData>;

export type MascotPose = keyof typeof MASCOTS;

/** 状态插画（七态组件）。 */
export const STATE_ART = {
  empty: emptyState,
  loading: loadingState,
  success: successState,
  error: errorState,
} satisfies Record<string, StaticImageData>;

/** 栏目头图（按路由 key）。 */
export const MODULE_HERO = {
  'exam-news': heroExamNews,
  'job-prep': heroJobPrep,
  practice: heroPractice,
  essay: heroEssay,
  interview: heroInterview,
} satisfies Record<string, StaticImageData>;

export type ModuleHeroKey = keyof typeof MODULE_HERO;

/** 鉴权品牌插画。 */
export const AUTH_ART = {
  login: authLogin,
  register: authRegister,
  forgot: authForgot,
} satisfies Record<string, StaticImageData>;

export { brandMark };
