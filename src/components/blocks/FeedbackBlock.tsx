import clsx from "clsx";
import { Prose } from "@/lib/markdown";
import type { FeedbackBlockNode } from "@/lib/types";

const CROSS_SELL_LABELS: Record<string, string> = {
  "product-planning": "Product Planning",
  "sql-for-pms": "SQL for Product Managers",
  "analytics-for-pms": "Analytics for Product Managers",
};

export function FeedbackBlock({ block }: { block: FeedbackBlockNode }) {
  return (
    <div
      className={clsx(
        "ml-[52px] rounded-md border-l-4 bg-surface px-4 py-3",
        block.verdict === "correct" && "border-l-accent",
        block.verdict === "partial" && "border-l-accent",
        block.verdict === "wrong" && "border-l-danger"
      )}
    >
      <div className="flex items-center gap-2 mb-1 text-xs font-semibold uppercase tracking-wide">
        {block.verdict === "correct" && <span className="text-accent">✓ Correct</span>}
        {block.verdict === "partial" && <span className="text-accent">≈ Partial credit</span>}
        {block.verdict === "wrong" && <span className="text-danger">✕ Wrong</span>}
      </div>
      <Prose text={block.markdown} className="text-sm text-foreground/90" />
      {block.crossSellModuleId && (
        <a href="#" className="mt-2 inline-block text-xs text-cross-sell hover:underline">
          Learn more: {CROSS_SELL_LABELS[block.crossSellModuleId] ?? block.crossSellModuleId}
        </a>
      )}
      <button type="button" className="mt-2 block text-xs text-muted hover:underline">
        I disagree
      </button>
    </div>
  );
}
