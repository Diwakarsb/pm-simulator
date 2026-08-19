"use client";

import clsx from "clsx";
import { Prose } from "@/lib/markdown";
import type { Answer, QuestionBlock as QuestionBlockType } from "@/lib/types";
import { gradeOption } from "@/lib/grading";

export function QuestionBlock({
  block,
  answer,
  selectedId,
  onSelect,
  onSubmit,
}: {
  block: QuestionBlockType;
  answer: Answer | undefined;
  selectedId: string | undefined;
  onSelect: (optionId: string) => void;
  onSubmit: () => void;
}) {
  const isAnswered = !!answer;

  return (
    <div className="ml-[50px] sm:ml-[56px] animate-rise-in">
      {block.prompt && <Prose text={block.prompt} className="mb-3 text-[15px] text-foreground/90" />}
      <fieldset className="space-y-2" disabled={isAnswered}>
        <legend className="sr-only">{block.prompt ?? "Choose an answer"}</legend>
        {block.options.map((opt) => {
          const isSelected = isAnswered ? answer!.optionId === opt.id : selectedId === opt.id;
          const verdict = isAnswered && isSelected ? gradeOption(opt) : null;
          return (
            <label
              key={opt.id}
              className={clsx(
                "flex min-h-[44px] items-center gap-3 rounded-2xl bg-surface px-4 py-3 transition-all",
                !isAnswered && "cursor-pointer hover:bg-surface-2 active:scale-[0.99]",
                !isAnswered && isSelected && "ring-2 ring-accent bg-surface-2",
                isAnswered && !isSelected && "opacity-45",
                verdict === "correct" && "ring-2 ring-accent bg-accent-soft opacity-100",
                verdict === "partial" && "ring-2 ring-accent bg-accent-soft opacity-100",
                verdict === "wrong" && "ring-2 ring-danger bg-danger-soft opacity-100"
              )}
            >
              <span
                className={clsx(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  !isAnswered && !isSelected && "border-border-strong",
                  !isAnswered && isSelected && "border-accent bg-accent",
                  verdict === "correct" && "border-accent bg-accent",
                  verdict === "partial" && "border-accent bg-accent",
                  verdict === "wrong" && "border-danger bg-danger"
                )}
              >
                {(isSelected || verdict) && (
                  <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-white stroke-[2.2]">
                    {verdict === "wrong" ? (
                      <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
                    ) : (
                      <path d="M2.5 6.2l2.3 2.3L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                )}
              </span>
              <input
                type="radio"
                name={block.id}
                value={opt.id}
                checked={isSelected}
                onChange={() => !isAnswered && onSelect(opt.id)}
                className="sr-only"
              />
              <span className="flex-1 text-[14px] sm:text-[15px] leading-snug">{opt.label}</span>
              {verdict === "correct" && (
                <span className="shrink-0 text-[11px] font-semibold text-accent">Correct</span>
              )}
              {verdict === "partial" && (
                <span className="shrink-0 text-[11px] font-semibold text-accent">Partial</span>
              )}
              {verdict === "wrong" && (
                <span className="shrink-0 text-[11px] font-semibold text-danger">Wrong</span>
              )}
            </label>
          );
        })}
      </fieldset>
      {!isAnswered && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!selectedId}
          className={clsx(
            "mt-3 min-h-11 rounded-full px-6 py-2.5 text-[15px] font-semibold transition-all active:scale-95",
            selectedId
              ? "bg-accent text-accent-foreground hover:brightness-110"
              : "bg-surface-2 text-muted-2 cursor-not-allowed"
          )}
        >
          {block.sendLabel}
        </button>
      )}
    </div>
  );
}
