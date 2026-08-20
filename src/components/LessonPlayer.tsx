"use client";

import { useEffect, useRef } from "react";
import type { LessonContent } from "@/lib/types";
import type { DatasetKey } from "@/lib/duckdb";
import { useLessonStore } from "@/lib/store";
import { computeScore } from "@/lib/grading";
import { MessageBlock } from "@/components/blocks/MessageBlock";
import { ArtifactBlock } from "@/components/blocks/ArtifactBlock";
import { ToolBlock } from "@/components/blocks/ToolBlock";
import { QuestionBlock } from "@/components/blocks/QuestionBlock";
import { FeedbackBlock } from "@/components/blocks/FeedbackBlock";
import { ContinueBlock } from "@/components/blocks/ContinueBlock";

function datasetKeyFor(lesson: LessonContent["lesson"]): DatasetKey {
  const hint = `${lesson.dataset ?? ""} ${lesson.toolDefaults?.database ?? ""}`.toLowerCase();
  return hint.includes("calmly") ? "calmly" : "viditation";
}

function blockDomId(lessonId: string, index: number) {
  return `block-${lessonId}-${index}`;
}

export function LessonPlayer({ content }: { content: LessonContent }) {
  const { lesson, characters } = content;
  const charactersById = Object.fromEntries(characters.map((c) => [c.id, c]));
  const datasetKey = datasetKeyFor(lesson);

  const { initLesson, selectOption, submitAnswer, advance, getProgress, getAnswer, reset } =
    useLessonStore();

  useEffect(() => {
    initLesson(lesson);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const progress = getProgress(lesson.id);
  const { revealedCount, answers, selectedOption } = progress;

  // Auto-scroll: without this, answering a question or tapping Continue reveals
  // new content below the fold with zero visible change on screen, which reads
  // as "nothing happened" and is the main source of users feeling stuck.
  const prevRevealedRef = useRef<number | null>(null);
  useEffect(() => {
    if (revealedCount === 0) return;
    if (prevRevealedRef.current === null) {
      // First paint for this lesson: jump (no animation) to where the learner
      // left off, instead of stranding a resumed session at the very top.
      if (revealedCount > 1) {
        document
          .getElementById(blockDomId(lesson.id, revealedCount - 1))
          ?.scrollIntoView({ behavior: "auto", block: "end" });
      }
    } else if (revealedCount > prevRevealedRef.current) {
      document
        .getElementById(blockDomId(lesson.id, prevRevealedRef.current))
        ?.scrollIntoView({ behavior: "auto", block: "start" });
    }
    prevRevealedRef.current = revealedCount;
  }, [lesson.id, revealedCount]);

  if (revealedCount === 0) {
    return <div className="text-muted text-sm">Loading lesson…</div>;
  }

  const visibleBlocks = lesson.blocks.slice(0, revealedCount);
  const percent = Math.round((revealedCount / lesson.blocks.length) * 100);
  const { score, maxScore } = computeScore(answers);

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

      <div className="flex flex-col gap-5 sm:gap-6">
        {visibleBlocks.map((block, i) => {
          const domId = blockDomId(lesson.id, i);
          const scrollMargin = { scrollMarginTop: "5.5rem" } as const;
          switch (block.type) {
            case "message":
              return (
                <div id={domId} key={domId} style={scrollMargin}>
                  <MessageBlock block={block} character={charactersById[block.character]} />
                </div>
              );
            case "artifact":
              return (
                <div id={domId} key={domId} style={scrollMargin}>
                  <ArtifactBlock block={block} />
                </div>
              );
            case "tool":
              return (
                <div id={domId} key={domId} style={scrollMargin}>
                  <ToolBlock block={block} toolDefaults={lesson.toolDefaults} datasetKey={datasetKey} />
                </div>
              );
            case "question":
              return (
                <div id={domId} key={domId} style={scrollMargin}>
                  <QuestionBlock
                    block={block}
                    answer={getAnswer(lesson.id, block.id)}
                    selectedId={selectedOption[block.id]}
                    onSelect={(optionId) => selectOption(lesson.id, block.id, optionId)}
                    onSubmit={() => {
                      const optionId = selectedOption[block.id];
                      const option = block.options.find((o) => o.id === optionId);
                      if (option) submitAnswer(lesson, block.id, option);
                    }}
                  />
                </div>
              );
            case "feedback":
              return (
                <div id={domId} key={domId} style={scrollMargin}>
                  <FeedbackBlock block={block} />
                </div>
              );
            case "continue":
              return (
                <div id={domId} key={domId} style={scrollMargin}>
                  <ContinueBlock
                    label={block.label}
                    isCurrent={i === revealedCount - 1}
                    onClick={() => advance(lesson, i)}
                  />
                </div>
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
            onClick={() => reset(lesson.id)}
            className="mt-5 min-h-11 rounded-full bg-surface-2 px-5 py-2 text-sm font-medium text-foreground transition-all active:scale-95 hover:bg-surface-elevated"
          >
            Restart lesson
          </button>
        </div>
      )}
    </div>
  );
}
