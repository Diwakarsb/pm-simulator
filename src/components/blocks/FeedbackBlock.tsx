import clsx from "clsx";
import Link from "next/link";
import { Prose } from "@/lib/markdown";
import { MODULES } from "@/lib/modules";
import type { FeedbackBlockNode } from "@/lib/types";

export function FeedbackBlock({ block }: { block: FeedbackBlockNode }) {
  const isWrong = block.verdict === "wrong";
  const crossSellModule = block.crossSellModuleId ? MODULES[block.crossSellModuleId] : undefined;

  return (
    <div
      className={clsx(
        "ml-[50px] sm:ml-[56px] rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 animate-rise-in",
        isWrong ? "bg-danger-soft" : "bg-accent-soft"
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={clsx(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
            isWrong ? "bg-danger text-white" : "bg-accent text-accent-foreground"
          )}
        >
          {isWrong ? "✕" : "✓"}
        </span>
        <span className={clsx("text-[11px] font-semibold uppercase tracking-wide", isWrong ? "text-danger" : "text-accent")}>
          {block.verdict === "correct" && "Correct"}
          {block.verdict === "partial" && "Partial credit"}
          {block.verdict === "wrong" && "Not quite"}
        </span>
      </div>
      <Prose text={block.markdown} className="text-[14px] sm:text-[15px] text-foreground/90 leading-relaxed" />
      {crossSellModule && (
        <Link
          href={`/lesson/${crossSellModule.module.id}`}
          className="mt-2 inline-block text-xs font-medium text-cross-sell hover:underline"
        >
          Learn more: {crossSellModule.module.title} →
        </Link>
      )}
      <button type="button" className="mt-2 block text-xs text-muted hover:text-foreground transition-colors">
        I disagree
      </button>
    </div>
  );
}
