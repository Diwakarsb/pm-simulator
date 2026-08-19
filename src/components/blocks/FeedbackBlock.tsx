import clsx from "clsx";
import { Prose } from "@/lib/markdown";
import type { FeedbackBlockNode } from "@/lib/types";

const CROSS_SELL_LABELS: Record<string, string> = {
  "product-planning": "Product Planning",
  "sql-for-pms": "SQL for Product Managers",
  "analytics-for-pms": "Analytics for Product Managers",
};

export function FeedbackBlock({ block }: { block: FeedbackBlockNode }) {
  const isWrong = block.verdict === "wrong";
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
      {block.crossSellModuleId && (
        <a href="#" className="mt-2 inline-block text-xs font-medium text-cross-sell hover:underline">
          Learn more: {CROSS_SELL_LABELS[block.crossSellModuleId] ?? block.crossSellModuleId}
        </a>
      )}
      <button type="button" className="mt-2 block text-xs text-muted hover:text-foreground transition-colors">
        I disagree
      </button>
    </div>
  );
}
