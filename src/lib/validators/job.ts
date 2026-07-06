import { z } from 'zod';

export const positionIdSchema = z.enum([
  'national-admin',
  'provincial-grassroots',
  'soe-management-trainee',
  'soe-product-ops',
  'grassroots-support',
  'custom',
]);

export const followUpsSchema = z.object({
  resumeText: z.string().trim().min(1, '请填写简历要点').max(2000),
  positionName: z.string().trim().min(1).max(60),
});

export const questionSearchSchema = z.object({
  positionName: z.string().trim().min(1).max(60),
});
