/**
 * 生成素材统一出口（GOAL.md §10）。
 * 由火山方舟 seedream（doubao-seedream-4-0）经 arkcli +gen 真实生成，
 * 配色对齐 tailwind token（青绿 primary / 暖橙 accent / 暖纸白背景），已压缩为 web 友好 JPG。
 * prompt、用途、引用组件见 docs/DESIGN.md；再生脚本见 scripts/gen-assets.ts（pnpm gen:assets）。
 * brand-mark 仍为矢量 SVG（Logo）。
 */
import type { StaticImageData } from 'next/image';

import brandMark from './brand-mark.svg';
import mascotWave from './mascot-wave.jpg';
import mascotCheer from './mascot-cheer.jpg';
import mascotSuccess from './mascot-success.jpg';
import mascotThink from './mascot-think.jpg';
import emptyState from './empty-state.jpg';
import loadingState from './loading-state.jpg';
import successState from './success-state.jpg';
import errorState from './error-state.jpg';
import heroExamNews from './hero-exam-news.jpg';
import heroJobPrep from './hero-job-prep.jpg';
import heroPractice from './hero-practice.jpg';
import heroEssay from './hero-essay.jpg';
import heroInterview from './hero-interview.jpg';
import authLogin from './auth-login.jpg';
import authRegister from './auth-register.jpg';
import authForgot from './auth-forgot.jpg';

/** 品牌吉祥物（学士帽小海獭）四姿态。seedream 生成。 */
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
