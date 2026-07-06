import { z } from 'zod';

export const examCategorySchema = z.enum([
  'national',
  'provincial',
  'soe',
  'institution',
  'grassroots',
]);

export const enrollStatusSchema = z.enum(['upcoming', 'open', 'closed']);

export const educationSchema = z.enum(['college', 'bachelor', 'master', 'doctor']);

/** 招录情报筛选参数校验（用于 API route）。 */
export const examInfoFilterSchema = z.object({
  category: examCategorySchema.optional(),
  region: z.string().trim().min(1).optional(),
  status: enrollStatusSchema.optional(),
  education: educationSchema.optional(),
  keyword: z.string().trim().min(1).max(50).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type ExamInfoFilterInput = z.infer<typeof examInfoFilterSchema>;
