import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Answer, Block, Lesson, Option } from "./types";

function isBlocking(block: Block, answered: (id: string) => boolean): boolean {
  if (block.type === "continue") return true;
  if (block.type === "question") return !answered(block.id);
  return false;
}

interface LessonState {
  lessonId: string | null;
  revealedCount: number;
  answers: Answer[];
  completedAt: number | null;
  selectedOption: Record<string, string>; // questionBlockId -> optionId (pending, before submit)

  initLesson: (lesson: Lesson) => void;
  selectOption: (questionBlockId: string, optionId: string) => void;
  submitAnswer: (lesson: Lesson, questionBlockId: string, option: Option) => void;
  advance: (lesson: Lesson) => void;
  isAnswered: (questionBlockId: string) => boolean;
  getAnswer: (questionBlockId: string) => Answer | undefined;
  reset: () => void;
}

function fillForward(lesson: Lesson, revealedCount: number, answers: Answer[]): number {
  const answeredIds = new Set(answers.map((a) => a.questionBlockId));
  const answered = (id: string) => answeredIds.has(id);
  let i = revealedCount;
  while (i < lesson.blocks.length) {
    const block = lesson.blocks[i];
    i += 1;
    if (isBlocking(block, answered)) break;
  }
  return i;
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      lessonId: null,
      revealedCount: 0,
      answers: [],
      completedAt: null,
      selectedOption: {},

      initLesson: (lesson) => {
        const state = get();
        if (state.lessonId === lesson.id && state.revealedCount > 0) return; // resume
        const revealedCount = fillForward(lesson, 0, []);
        set({ lessonId: lesson.id, revealedCount, answers: [], completedAt: null, selectedOption: {} });
      },

      selectOption: (questionBlockId, optionId) => {
        set((s) => ({ selectedOption: { ...s.selectedOption, [questionBlockId]: optionId } }));
      },

      submitAnswer: (lesson, questionBlockId, option) => {
        const s = get();
        if (s.answers.some((a) => a.questionBlockId === questionBlockId)) return;
        const answers = [
          ...s.answers,
          { questionBlockId, optionId: option.id, weight: option.weight, ts: Date.now() },
        ];
        const revealedCount = fillForward(lesson, s.revealedCount, answers);
        const isLast = revealedCount >= lesson.blocks.length;
        set({ answers, revealedCount, completedAt: isLast ? Date.now() : s.completedAt });
      },

      advance: (lesson) => {
        const s = get();
        const revealedCount = fillForward(lesson, s.revealedCount + 1, s.answers);
        const isLast = revealedCount >= lesson.blocks.length;
        set({ revealedCount, completedAt: isLast ? Date.now() : s.completedAt });
      },

      isAnswered: (questionBlockId) => get().answers.some((a) => a.questionBlockId === questionBlockId),
      getAnswer: (questionBlockId) => get().answers.find((a) => a.questionBlockId === questionBlockId),

      reset: () => set({ lessonId: null, revealedCount: 0, answers: [], completedAt: null, selectedOption: {} }),
    }),
    { name: "pm-simulator-lesson-progress" }
  )
);
