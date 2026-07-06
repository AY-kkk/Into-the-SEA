import { z } from 'zod';
import { examCategorySchema } from './exam';

export const essayTopicSchema = z.enum([
  'grassroots-governance',
  'rural-revitalization',
  'digital-government',
  'public-services',
  'ecological',
  'culture',
  'economy',
]);

export const caseFilterSchema = z.object({
  topic: essayTopicSchema.optional(),
  keyword: z.string().trim().min(1).max(50).optional(),
});

export const originalFilterSchema = z.object({
  topic: essayTopicSchema.optional(),
  category: examCategorySchema.optional(),
  year: z.coerce.number().int().optional(),
  keyword: z.string().trim().min(1).max(50).optional(),
});
