import { z } from 'zod';

const answerRecord = z.object({
  questionId: z.string(),
  selected: z.string(),
  correct: z.boolean(),
  answeredAt: z.string(),
  type: z.string().optional(),
});

const snapshot = z.object({
  id: z.string(),
  type: z.string(),
  stem: z.string(),
  answer: z.string(),
  explanation: z.string(),
});

const wrongQuestion = z.object({
  questionId: z.string(),
  wrongCount: z.number().int().nonnegative(),
  lastWrongAt: z.string(),
  mastered: z.boolean(),
  snapshot: snapshot.optional(),
});

export const practiceStateSchema = z.object({
  records: z.array(answerRecord).max(20000),
  wrongBook: z.array(wrongQuestion).max(5000),
});

export type PracticeStateInput = z.infer<typeof practiceStateSchema>;
