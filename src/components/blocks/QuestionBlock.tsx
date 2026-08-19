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
    <div className="ml-[52px]">
      {block.prompt && <Prose text={block.prompt} className="mb-3 text-foreground/90" />}
      <fieldset className="space-y-2" disabled={isAnswered}>
        <legend className="sr-only">{block.prompt ?? "Choose an answer"}</legend>
        {block.options.map((opt) => {
          const isSelected = isAnswered ? answer!.optionId === opt.id : selectedId === opt.id;
          const verdict = isAnswered && isSelected ? gradeOption(opt) : null;
          return (
            <label
              key={opt.id}
              className={clsx(
                "flex items-center gap-3 rounded-md border-l-4 bg-surface px-4 py-3 cursor-pointer transition-colors",
                !isAnswered && "border-border hover:border-l-accent-dim",
                !isAnswered && isSelected && "border-l-accent-dim ring-1 ring-accent-dim",
                isAnswered && !isSelected && "border-border opacity-60 cursor-default",
                verdict === "correct" && "border-l-accent",
                verdict === "partial" && "border-l-accent",
                verdict === "wrong" && "border-l-danger"
              )}
            >
              <input
                type="radio"
                name={block.id}
                value={opt.id}
                checked={isSelected}
                onChange={() => !isAnswered && onSelect(opt.id)}
                className="accent-[var(--accent)]"
              />
              <span className="flex-1 text-sm">{opt.label}</span>
              {verdict === "correct" && (
                <span className="text-xs font-semibold text-accent">✓ Correct</span>
              )}
              {verdict === "partial" && (
                <span className="text-xs font-semibold text-accent">≈ Partial credit</span>
              )}
              {verdict === "wrong" && (
                <span className="text-xs font-semibold text-danger">✕ Not quite</span>
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
            "mt-3 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
            selectedId
              ? "bg-accent text-accent-foreground hover:bg-accent-dim"
              : "bg-surface-2 text-muted cursor-not-allowed"
          )}
        >
          {block.sendLabel}
        </button>
      )}
    </div>
  );
}
