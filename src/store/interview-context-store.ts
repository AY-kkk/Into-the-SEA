'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JobPositionId } from '@/types/job';

/**
 * 岗位备考 → 模拟面试 的上下文交接。
 * 「一键跳转模拟面试，携带岗位上下文」（GOAL.md 模块二）。
 */
export interface InterviewHandoff {
  positionId: JobPositionId;
  positionName: string;
  context?: string;
}

interface InterviewContextState {
  pending: InterviewHandoff | null;
  setPending: (handoff: InterviewHandoff) => void;
  consume: () => InterviewHandoff | null;
  clear: () => void;
}

export const useInterviewContextStore = create<InterviewContextState>()(
  persist(
    (set, get) => ({
      pending: null,
      setPending: (handoff) => set({ pending: handoff }),
      consume: () => {
        const current = get().pending;
        return current;
      },
      clear: () => set({ pending: null }),
    }),
    { name: 'its-interview-context' },
  ),
);
