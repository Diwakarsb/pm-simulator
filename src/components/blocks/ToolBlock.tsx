"use client";

import { useState } from "react";
import clsx from "clsx";
import type {
  AbResultConfig,
  EconGridConfig,
  MixpanelFunnelConfig,
  MixpanelInsightsConfig,
  MixpanelRetentionConfig,
  SupersetToolConfig,
  ToolBlock as ToolBlockType,
  ToolDefaults,
} from "@/lib/types";
import type { DatasetKey } from "@/lib/duckdb";
import { SqlConsole } from "@/components/tools/SqlConsole";
import { MixpanelInsights } from "@/components/tools/MixpanelInsights";
import { MixpanelFunnel } from "@/components/tools/MixpanelFunnel";
import { MixpanelRetention } from "@/components/tools/MixpanelRetention";
import { AbResult } from "@/components/tools/AbResult";
import { EconGrid } from "@/components/tools/EconGrid";

const TOOL_ICON: Record<string, string> = {
  superset: "🗄️",
  sql: "🗄️",
  "mixpanel-insights": "📊",
  "mixpanel-funnel": "⏢",
  "mixpanel-retention": "📈",
  "ab-result": "🧪",
  "econ-grid": "🧮",
};

export function ToolBlock({
  block,
  toolDefaults,
  datasetKey = "viditation",
}: {
  block: ToolBlockType;
  toolDefaults?: ToolDefaults;
  datasetKey?: DatasetKey;
}) {
  const [open, setOpen] = useState(false);
  const label = block.collapsedLabel ?? toolDefaults?.collapsedLabel ?? "Open the tool";
  const isSql = block.kind === "superset" || block.kind === "sql";
  const sqlConfig = isSql
    ? {
        database: toolDefaults?.database,
        schema: toolDefaults?.schema,
        ...(block.config as SupersetToolConfig),
      }
    : null;

  return (
    <div className="ml-[50px] sm:ml-[56px] animate-rise-in">
      <div
        className={clsx(
          "rounded-2xl border overflow-hidden shadow-[var(--shadow-card)] transition-colors",
          open ? "border-border bg-surface-elevated" : "border-accent/30 bg-accent-soft"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full min-h-14 items-center gap-3 px-4 py-3 text-left active:opacity-70 transition-opacity"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-base">
            {TOOL_ICON[block.kind] ?? "🛠️"}
          </span>
          <span className="flex-1 min-w-0 text-[14px] sm:text-[15px] font-semibold text-foreground">
            {label}
          </span>
          <span
            className={clsx(
              "shrink-0 text-muted transition-transform duration-200",
              open && "rotate-180"
            )}
          >
            ▾
          </span>
        </button>
        {open && (
          <div className="border-t border-border">
            {isSql && sqlConfig && <SqlConsole config={sqlConfig} datasetKey={datasetKey} />}
            {block.kind === "mixpanel-insights" && (
              <MixpanelInsights config={block.config as MixpanelInsightsConfig} />
            )}
            {block.kind === "mixpanel-funnel" && (
              <MixpanelFunnel config={block.config as MixpanelFunnelConfig} />
            )}
            {block.kind === "mixpanel-retention" && (
              <MixpanelRetention config={block.config as MixpanelRetentionConfig} />
            )}
            {block.kind === "ab-result" && <AbResult config={block.config as AbResultConfig} />}
            {block.kind === "econ-grid" && <EconGrid config={block.config as EconGridConfig} />}
            {!isSql &&
              block.kind !== "mixpanel-insights" &&
              block.kind !== "mixpanel-funnel" &&
              block.kind !== "mixpanel-retention" &&
              block.kind !== "ab-result" &&
              block.kind !== "econ-grid" && (
                <div className="p-4 text-sm text-muted">This tool ({block.kind}) is coming soon.</div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
