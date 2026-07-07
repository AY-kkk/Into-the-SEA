import { z } from 'zod';

export const analyticsEventSchema = z.object({
  event: z.string().min(1).max(64),
  props: z
    .record(z.union([z.string().max(200), z.number(), z.boolean()]))
    .optional()
    .default({}),
  ts: z.string().optional(),
});

export const analyticsBatchSchema = z.object({
  events: z.array(analyticsEventSchema).min(1).max(50),
});

export type AnalyticsBatch = z.infer<typeof analyticsBatchSchema>;
