"use client";

import { useState } from "react";
import clsx from "clsx";
import type {
  MixpanelFunnelConfig,
  MixpanelInsightsConfig,
  SupersetToolConfig,
  ToolBlock as ToolBlockType,
} from "@/lib/types";
import { SqlConsole } from "@/components/tools/SqlConsole";
import { MixpanelInsights } from "@/components/tools/MixpanelInsights";
import { MixpanelFunnel } from "@/components/tools/MixpanelFunnel";

export function ToolBlock({ block }: { block: ToolBlockType }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ml-[50px] sm:ml-[56px] animate-rise-in">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-1.5 text-[14px] sm:text-[15px] font-medium text-cross-sell active:opacity-60 transition-opacity"
      >
        <span
          className={clsx(
            "inline-block text-[10px] transition-transform duration-200",
            open && "rotate-90"
          )}
        >
          ▶
        </span>
        {block.collapsedLabel}
      </button>
      {open && (
        <div className="mt-2 rounded-2xl border border-border bg-surface-elevated overflow-hidden shadow-[var(--shadow-card)]">
          {block.kind === "superset" && <SqlConsole config={block.config as SupersetToolConfig} />}
          {block.kind === "mixpanel-insights" && (
            <MixpanelInsights config={block.config as MixpanelInsightsConfig} />
          )}
          {block.kind === "mixpanel-funnel" && (
            <MixpanelFunnel config={block.config as MixpanelFunnelConfig} />
          )}
          {block.kind !== "superset" &&
            block.kind !== "mixpanel-insights" &&
            block.kind !== "mixpanel-funnel" && (
              <div className="p-4 text-sm text-muted">This tool ({block.kind}) is coming soon.</div>
            )}
        </div>
      )}
    </div>
  );
}
