import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Answer, Block, Lesson, Option } from "./types";

function isBlocking(block: Block, answered: (id: string) => boolean): boolean {
  if (block.type === "continue") return true;
  if (block.type === "question") return !answered(block.id);
  return false;
}

interface LessonProgress {
  revealedCount: number;
  answers: Answer[];
  completedAt: number | null;
  selectedOption: Record<string, string>; // questionBlockId -> optionId (pending, before submit)
}

const EMPTY_PROGRESS: LessonProgress = {
  revealedCount: 0,
  answers: [],
  completedAt: null,
  selectedOption: {},
};

interface LessonState {
  progressByLesson: Record<string, LessonProgress>;

  initLesson: (lesson: Lesson) => void;
  selectOption: (lessonId: string, questionBlockId: string, optionId: string) => void;
  submitAnswer: (lesson: Lesson, questionBlockId: string, option: Option) => void;
  advance: (lesson: Lesson) => void;
  getProgress: (lessonId: string) => LessonProgress;
  getAnswer: (lessonId: string, questionBlockId: string) => Answer | undefined;
  reset: (lessonId: string) => void;
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
      progressByLesson: {},

      initLesson: (lesson) => {
        const existing = get().progressByLesson[lesson.id];
        if (existing && existing.revealedCount > 0) return; // resume
        const revealedCount = fillForward(lesson, 0, []);
        set((s) => ({
          progressByLesson: {
            ...s.progressByLesson,
            [lesson.id]: { ...EMPTY_PROGRESS, revealedCount },
          },
        }));
      },

      selectOption: (lessonId, questionBlockId, optionId) => {
        set((s) => {
          const p = s.progressByLesson[lessonId] ?? EMPTY_PROGRESS;
          return {
            progressByLesson: {
              ...s.progressByLesson,
              [lessonId]: { ...p, selectedOption: { ...p.selectedOption, [questionBlockId]: optionId } },
            },
          };
        });
      },

      submitAnswer: (lesson, questionBlockId, option) => {
        const p = get().progressByLesson[lesson.id] ?? EMPTY_PROGRESS;
        if (p.answers.some((a) => a.questionBlockId === questionBlockId)) return;
        const answers = [
          ...p.answers,
          { questionBlockId, optionId: option.id, weight: option.weight, ts: Date.now() },
        ];
        const revealedCount = fillForward(lesson, p.revealedCount, answers);
        const isLast = revealedCount >= lesson.blocks.length;
        set((s) => ({
          progressByLesson: {
            ...s.progressByLesson,
            [lesson.id]: {
              ...p,
              answers,
              revealedCount,
              completedAt: isLast ? Date.now() : p.completedAt,
            },
          },
        }));
      },

      advance: (lesson) => {
        const p = get().progressByLesson[lesson.id] ?? EMPTY_PROGRESS;
        const revealedCount = fillForward(lesson, p.revealedCount + 1, p.answers);
        const isLast = revealedCount >= lesson.blocks.length;
        set((s) => ({
          progressByLesson: {
            ...s.progressByLesson,
            [lesson.id]: { ...p, revealedCount, completedAt: isLast ? Date.now() : p.completedAt },
          },
        }));
      },

      getProgress: (lessonId) => get().progressByLesson[lessonId] ?? EMPTY_PROGRESS,
      getAnswer: (lessonId, questionBlockId) =>
        (get().progressByLesson[lessonId] ?? EMPTY_PROGRESS).answers.find(
          (a) => a.questionBlockId === questionBlockId
        ),

      reset: (lessonId) =>
        set((s) => ({
          progressByLesson: { ...s.progressByLesson, [lessonId]: { ...EMPTY_PROGRESS } },
        })),
    }),
    { name: "pm-simulator-lesson-progress-v2" }
  )
);
