'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnswerRecord, QuestionType, WrongQuestion } from '@/types/question';

/**
 * 行测练习状态：作答记录、错题本、按题型正确率。
 * MVP 单用户，持久化到 localStorage；后续可替换为服务端持久化（AnswerRecord/WrongQuestion 表已就绪）。
 */
interface PracticeState {
  records: AnswerRecord[];
  wrongBook: WrongQuestion[];
  /** 记录一次作答，自动维护错题本。 */
  submitAnswer: (input: {
    questionId: string;
    selected: string;
    correct: boolean;
    type: QuestionType;
  }) => void;
  /** 标记错题为已掌握。 */
  markMastered: (questionId: string, mastered: boolean) => void;
  /** 移除错题（答对后可选择移出）。 */
  resolveWrong: (questionId: string) => void;
  /** 未掌握错题 id。 */
  getActiveWrongIds: () => string[];
  reset: () => void;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      records: [],
      wrongBook: [],

      submitAnswer: ({ questionId, selected, correct }) =>
        set((state) => {
          const record: AnswerRecord = {
            questionId,
            selected,
            correct,
            answeredAt: new Date().toISOString(),
          };
          let wrongBook = state.wrongBook;
          if (!correct) {
            const existing = wrongBook.find((w) => w.questionId === questionId);
            if (existing) {
              wrongBook = wrongBook.map((w) =>
                w.questionId === questionId
                  ? {
                      ...w,
                      wrongCount: w.wrongCount + 1,
                      lastWrongAt: record.answeredAt,
                      mastered: false,
                    }
                  : w,
              );
            } else {
              wrongBook = [
                ...wrongBook,
                {
                  questionId,
                  wrongCount: 1,
                  lastWrongAt: record.answeredAt,
                  mastered: false,
                },
              ];
            }
          }
          return { records: [...state.records, record], wrongBook };
        }),

      markMastered: (questionId, mastered) =>
        set((state) => ({
          wrongBook: state.wrongBook.map((w) =>
            w.questionId === questionId ? { ...w, mastered } : w,
          ),
        })),

      resolveWrong: (questionId) =>
        set((state) => ({
          wrongBook: state.wrongBook.filter((w) => w.questionId !== questionId),
        })),

      getActiveWrongIds: () =>
        get()
          .wrongBook.filter((w) => !w.mastered)
          .map((w) => w.questionId),

      reset: () => set({ records: [], wrongBook: [] }),
    }),
    { name: 'its-practice-store' },
  ),
);
