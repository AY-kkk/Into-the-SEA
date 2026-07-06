'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InterviewConfig,
  InterviewMessage,
  InterviewReport,
  InterviewSession,
} from '@/types/interview';
import { createId } from '@/lib/utils';

/**
 * 模拟面试会话持久化（localStorage）。
 * 满足「会话持久化」：刷新后可恢复进行中的会话与历史报告。
 * 真实多端持久化可切换到服务端（Prisma 表已就绪，见 PrismaSessionStore）。
 */
interface InterviewState {
  sessions: InterviewSession[];
  activeId: string | null;

  createSession: (config: InterviewConfig, opening: InterviewMessage) => string;
  appendMessage: (sessionId: string, message: InterviewMessage) => void;
  appendCandidate: (sessionId: string, content: string) => void;
  setReport: (sessionId: string, report: InterviewReport) => void;
  setActive: (sessionId: string | null) => void;
  getSession: (sessionId: string) => InterviewSession | undefined;
  deleteSession: (sessionId: string) => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeId: null,

      createSession: (config, opening) => {
        const now = new Date().toISOString();
        const session: InterviewSession = {
          id: createId('sess'),
          config,
          status: 'active',
          messages: [opening],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeId: session.id,
        }));
        return session.id;
      },

      appendMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, message], updatedAt: new Date().toISOString() }
              : s,
          ),
        })),

      appendCandidate: (sessionId, content) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    {
                      id: createId('msg'),
                      role: 'candidate',
                      content,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : s,
          ),
        })),

      setReport: (sessionId, report) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, report, status: 'completed', updatedAt: new Date().toISOString() }
              : s,
          ),
        })),

      setActive: (sessionId) => set({ activeId: sessionId }),

      getSession: (sessionId) => get().sessions.find((s) => s.id === sessionId),

      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeId: state.activeId === sessionId ? null : state.activeId,
        })),
    }),
    { name: 'its-interview-store' },
  ),
);
