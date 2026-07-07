import { z } from 'zod';

export const practiceModeSchema = z.enum(['sequential', 'random', 'topic', 'mock', 'wrong']);
export const questionTypeSchema = z.enum([
  'verbal',
  'quantitative',
  'judgment',
  'data-analysis',
  'common-sense',
]);

/** 练习集构建参数校验（API route）。 */
export const practiceSetSchema = z.object({
  mode: practiceModeSchema,
  type: questionTypeSchema.optional(),
  count: z.coerce.number().int().positive().max(200).optional(),
  /** 错题重练题 id 列表。 */
  wrongIds: z.array(z.string().min(1)).max(500).optional(),
});

export type PracticeSetInput = z.infer<typeof practiceSetSchema>;
