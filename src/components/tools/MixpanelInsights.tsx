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

export function MixpanelInsights({ config }: { config: MixpanelInsightsConfig }) {
  const [grouping, setGrouping] = useState<"week" | "month">(config.grouping ?? "week");

  const weeklyData = config.weekly.map((w) => ({ label: w.label, value: w.value }));
  const monthlyData = [{ label: "January", value: config.monthlyUnique }];
  const data = grouping === "week" ? weeklyData : monthlyData;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-muted uppercase tracking-wide">Insights</div>
          <div className="text-sm font-semibold">{config.metric}</div>
        </div>
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          {(["week", "month"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrouping(g)}
              className={clsx(
                "px-3 py-1.5 capitalize",
                grouping === g ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted"
              )}
            >
              {g}ly
            </button>
          ))}
        </div>
      </div>

      <div className="h-56">
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

      <table className="mt-3 w-full text-xs text-left border-collapse">
        <thead>
          <tr className="text-muted border-b border-border">
            <th className="py-1.5 font-normal">{grouping === "week" ? "Week of" : "Month"}</th>
            <th className="py-1.5 font-normal text-right">Uniques</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.label} className="border-b border-border/50">
              <td className="py-1.5">{row.label}</td>
              <td className="py-1.5 text-right font-mono">{row.value}</td>
            </tr>
          ))}
          {grouping === "week" && (
            <tr className="text-muted">
              <td className="py-1.5">Average</td>
              <td className="py-1.5 text-right font-mono">{config.weeklyAverage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
