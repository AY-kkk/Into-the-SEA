/**
 * 种子数据的类型化访问层。
 * 直接导入 data/seed/*.json，供 mock provider 在无数据库环境下使用。
 * 真实接入数据库后，provider 可切换为从 Prisma 读取（见 providers/ 真实实现骨架）。
 */
import examInfosRaw from '../../../data/seed/exam-infos.json';
import questionsRaw from '../../../data/seed/questions.json';
import essayCasesRaw from '../../../data/seed/essay-cases.json';
import essayOriginalsRaw from '../../../data/seed/essay-originals.json';
import type { ExamInfo } from '@/types/exam';
import type { Question } from '@/types/question';
import type { EssayCase, EssayOriginal } from '@/types/essay';

export const examInfoSeed = examInfosRaw as ExamInfo[];
export const questionSeed = questionsRaw as Question[];
export const essayCaseSeed = essayCasesRaw as EssayCase[];
export const essayOriginalSeed = essayOriginalsRaw as EssayOriginal[];
