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
    <div className="ml-[52px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-accent hover:underline"
      >
        <span className={clsx("inline-block transition-transform", open && "rotate-90")}>▶</span>
        {block.collapsedLabel}
      </button>
      {open && (
        <div className="mt-3 rounded-lg border border-border bg-surface overflow-hidden">
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
