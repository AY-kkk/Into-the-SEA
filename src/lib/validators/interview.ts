import { z } from 'zod';
import { positionIdSchema } from './job';

export const interviewConfigSchema = z.object({
  positionId: positionIdSchema,
  positionName: z.string().trim().min(1).max(60),
  mode: z.enum(['structured', 'behavioral', 'pressure']),
  questionCount: z.number().int().min(3).max(12),
  context: z.string().max(500).optional(),
});

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(['interviewer', 'candidate', 'system']),
  content: z.string(),
  createdAt: z.string(),
  followUpOf: z.string().optional(),
});

export const nextQuestionSchema = z.object({
  config: interviewConfigSchema,
  messages: z.array(messageSchema),
  userAnswer: z.string().optional(),
});

export const reportSchema = z.object({
  config: interviewConfigSchema,
  messages: z.array(messageSchema),
});
