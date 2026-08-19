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
      <div className="sticky top-0 z-10 -mx-4 mb-8 bg-background/95 backdrop-blur px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between text-xs text-muted mb-1.5">
          <span>{lesson.title}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
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
        <div className="mt-10 rounded-lg border border-accent/40 bg-surface p-6 text-center">
          <div className="text-accent text-sm font-semibold uppercase tracking-wide mb-1">
            Lesson complete
          </div>
          <div className="text-2xl font-bold">
            {score.toFixed(1)} / {maxScore} points
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-4 text-xs text-muted hover:underline"
          >
            Restart lesson
          </button>
        </div>
      )}
    </div>
  );
}
