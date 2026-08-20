"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MixpanelInsightsConfig } from "@/lib/types";

function isToggleConfig(
  config: MixpanelInsightsConfig
): config is Extract<MixpanelInsightsConfig, { weekly: unknown }> {
  return "weekly" in config;
}

export function MixpanelInsights({ config }: { config: MixpanelInsightsConfig }) {
  const toggleShape = isToggleConfig(config);
  const [grouping, setGrouping] = useState<"week" | "month">(toggleShape ? config.grouping : "week");

  const data = toggleShape
    ? grouping === "week"
      ? config.weekly.map((w) => ({ label: w.label, value: w.value }))
      : [{ label: "January", value: config.monthlyUnique }]
    : config.series.map((s) => ({ label: s.label, value: s.value }));

  const periodLabel = toggleShape ? (grouping === "week" ? "Week of" : "Month") : config.grouping;

  return (
    <div className="p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div>
          <div className="text-[10px] text-muted-2 uppercase tracking-wider font-semibold">Insights</div>
          <div className="text-[13px] font-semibold">{config.metric}</div>
        </div>
        {toggleShape && (
          <div className="flex rounded-full bg-surface-2 p-0.5 text-[12px]">
            {(["week", "month"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrouping(g)}
                className={clsx(
                  "min-h-8 rounded-full px-3 py-1 capitalize font-medium transition-colors",
                  grouping === g ? "bg-accent text-accent-foreground" : "text-muted"
                )}
              >
                {g}ly
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-48 sm:h-56 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--muted)" fontSize={12} />
            <YAxis stroke="var(--muted)" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12 }}
            />
            <Bar dataKey="value" fill="var(--accent)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-border">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface-2 text-muted-2">
              <th className="px-2.5 py-2 font-medium capitalize">{periodLabel}</th>
              <th className="px-2.5 py-2 font-medium text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.label} className="border-t border-border/60">
                <td className="px-2.5 py-1.5">{row.label}</td>
                <td className="px-2.5 py-1.5 text-right font-mono">{row.value}</td>
              </tr>
            ))}
            {toggleShape && grouping === "week" && (
              <tr className="border-t border-border/60 text-muted-2">
                <td className="px-2.5 py-1.5">Average</td>
                <td className="px-2.5 py-1.5 text-right font-mono">{config.weeklyAverage}</td>
              </tr>
            )}
            {!toggleShape && config.average != null && (
              <tr className="border-t border-border/60 text-muted-2">
                <td className="px-2.5 py-1.5">Average</td>
                <td className="px-2.5 py-1.5 text-right font-mono">{config.average}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
