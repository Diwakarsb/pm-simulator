"use client";

import { useEffect } from "react";
import type { LessonContent } from "@/lib/types";
import { useLessonStore } from "@/lib/store";
import { computeScore } from "@/lib/grading";
import { MessageBlock } from "@/components/blocks/MessageBlock";
import { ArtifactBlock } from "@/components/blocks/ArtifactBlock";
import { ToolBlock } from "@/components/blocks/ToolBlock";
import { QuestionBlock } from "@/components/blocks/QuestionBlock";
import { FeedbackBlock } from "@/components/blocks/FeedbackBlock";
import { ContinueBlock } from "@/components/blocks/ContinueBlock";

export function LessonPlayer({ content }: { content: LessonContent }) {
  const { lesson, characters } = content;
  const charactersById = Object.fromEntries(characters.map((c) => [c.id, c]));

  const {
    lessonId,
    revealedCount,
    answers,
    selectedOption,
    initLesson,
    selectOption,
    submitAnswer,
    advance,
    getAnswer,
    reset,
  } = useLessonStore();

  useEffect(() => {
    initLesson(lesson);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  if (lessonId !== lesson.id && revealedCount === 0) {
    return <div className="text-muted text-sm">Loading lesson…</div>;
  }

  const visibleBlocks = lesson.blocks.slice(0, revealedCount);
  const percent = Math.round((revealedCount / lesson.blocks.length) * 100);
  const questionAnswers = answers;
  const { score, maxScore } = computeScore(questionAnswers);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 mb-6 sm:mb-8 bg-background/80 backdrop-blur-xl px-4 sm:px-6 pt-[max(0.9rem,env(safe-area-inset-top))] pb-3 border-b border-border">
        <div className="flex items-center justify-between text-[13px] mb-2">
          <span className="font-medium text-foreground/90 truncate pr-3">{lesson.title}</span>
          <span className="text-muted-2 font-medium tabular-nums shrink-0">{percent}%</span>
        </div>
        <div className="h-[5px] rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {visibleBlocks.map((block, i) => {
          const key = `${lesson.id}-${i}`;
          switch (block.type) {
            case "message":
              return (
                <MessageBlock key={key} block={block} character={charactersById[block.character]} />
              );
            case "artifact":
              return <ArtifactBlock key={key} block={block} />;
            case "tool":
              return <ToolBlock key={key} block={block} />;
            case "question":
              return (
                <QuestionBlock
                  key={key}
                  block={block}
                  answer={getAnswer(block.id)}
                  selectedId={selectedOption[block.id]}
                  onSelect={(optionId) => selectOption(block.id, optionId)}
                  onSubmit={() => {
                    const optionId = selectedOption[block.id];
                    const option = block.options.find((o) => o.id === optionId);
                    if (option) submitAnswer(lesson, block.id, option);
                  }}
                />
              );
            case "feedback":
              return <FeedbackBlock key={key} block={block} />;
            case "continue":
              return (
                <ContinueBlock key={key} label={block.label} onClick={() => advance(lesson)} />
              );
            default:
              return null;
          }
        })}
      </div>

      {revealedCount >= lesson.blocks.length && (
        <div className="mt-8 sm:mt-10 rounded-3xl bg-surface p-7 sm:p-8 text-center shadow-[var(--shadow-card)] animate-rise-in">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-2xl">
            🎉
          </div>
          <div className="text-accent text-[13px] font-semibold uppercase tracking-wide mb-1">
            Lesson complete
          </div>
          <div className="text-3xl font-bold tabular-nums">
            {score.toFixed(1)} <span className="text-muted-2 text-xl font-medium">/ {maxScore} points</span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-5 min-h-11 rounded-full bg-surface-2 px-5 py-2 text-sm font-medium text-foreground transition-all active:scale-95 hover:bg-surface-elevated"
          >
            Restart lesson
          </button>
        </div>
      )}
    </div>
  );
}
