'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnswerRecord, QuestionSnapshot, QuestionType, WrongQuestion } from '@/types/question';

/**
 * 行测练习状态：作答记录、错题本、按题型正确率。
 * 未登录：持久化到 localStorage；登录后自动与服务端（/api/practice/state）双向同步。
 */

/** 合并作答记录（按 questionId+answeredAt 去重，服务端优先）。 */
function mergeRecords(server: AnswerRecord[], local: AnswerRecord[]): AnswerRecord[] {
  const seen = new Set(server.map((r) => `${r.questionId}@${r.answeredAt}`));
  const extra = local.filter((r) => !seen.has(`${r.questionId}@${r.answeredAt}`));
  return [...server, ...extra];
}

/** 合并错题本（按 questionId 去重，取更晚的 lastWrongAt / 更大的 wrongCount）。 */
function mergeWrong(server: WrongQuestion[], local: WrongQuestion[]): WrongQuestion[] {
  const map = new Map<string, WrongQuestion>();
  for (const w of [...server, ...local]) {
    const prev = map.get(w.questionId);
    if (!prev) {
      map.set(w.questionId, w);
    } else {
      map.set(w.questionId, {
        ...prev,
        wrongCount: Math.max(prev.wrongCount, w.wrongCount),
        lastWrongAt: prev.lastWrongAt > w.lastWrongAt ? prev.lastWrongAt : w.lastWrongAt,
        mastered: prev.mastered && w.mastered,
        snapshot: prev.snapshot ?? w.snapshot,
      });
    }
  }
  return [...map.values()];
}

/** 登录后置为 true，开启服务端自动同步。 */
let serverSyncEnabled = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleServerPush(push: () => Promise<void>): void {
  if (!serverSyncEnabled) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void push();
  }, 800);
}

interface PracticeState {
  records: AnswerRecord[];
  wrongBook: WrongQuestion[];
  /** 记录一次作答，自动维护错题本。 */
  submitAnswer: (input: {
    questionId: string;
    selected: string;
    correct: boolean;
    type: QuestionType;
    /** 题目快照，用于错题本 / 统计离线渲染。 */
    snapshot?: QuestionSnapshot;
  }) => void;
  /** 标记错题为已掌握。 */
  markMastered: (questionId: string, mastered: boolean) => void;
  /** 移除错题（答对后可选择移出）。 */
  resolveWrong: (questionId: string) => void;
  /** 未掌握错题 id。 */
  getActiveWrongIds: () => string[];
  reset: () => void;
  /** 从服务端拉取并合并进度（登录后调用）。 */
  pullFromServer: () => Promise<void>;
  /** 将当前进度推送到服务端（登录态自动 debounce 调用）。 */
  pushToServer: () => Promise<void>;
}

export const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      records: [],
      wrongBook: [],

      submitAnswer: ({ questionId, selected, correct, type, snapshot }) =>
        set((state) => {
          const record: AnswerRecord = {
            questionId,
            selected,
            correct,
            answeredAt: new Date().toISOString(),
            type,
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
                      snapshot: snapshot ?? w.snapshot,
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
                  snapshot,
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

      pullFromServer: async () => {
        serverSyncEnabled = true;
        try {
          const res = await fetch('/api/practice/state', { cache: 'no-store' });
          if (!res.ok) return;
          const data = (await res.json()) as {
            records: AnswerRecord[];
            wrongBook: WrongQuestion[];
          };
          // 合并策略：以服务端为基准，叠加本地新增（按 id 去重），保证多端不丢数据。
          set((state) => ({
            records: mergeRecords(data.records ?? [], state.records),
            wrongBook: mergeWrong(data.wrongBook ?? [], state.wrongBook),
          }));
          void get().pushToServer();
        } catch {
          /* 离线/未登录：静默降级为本地态 */
        }
      },

      pushToServer: async () => {
        try {
          const { records, wrongBook } = get();
          await fetch('/api/practice/state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records, wrongBook }),
          });
        } catch {
          /* 未登录/离线：忽略，保留本地持久化 */
        }
      },
    }),
    { name: 'its-practice-store' },
  ),
);

// 登录态下，任一 records/wrongBook 变化后 debounce 推送到服务端。
usePracticeStore.subscribe((state, prev) => {
  if (state.records !== prev.records || state.wrongBook !== prev.wrongBook) {
    scheduleServerPush(() => usePracticeStore.getState().pushToServer());
  }
});
