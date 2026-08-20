"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { EconGridCell, EconGridConfig } from "@/lib/types";

// Small heuristic resolver: formulas reference short variable names (spend,
// customers, price, cost%, churn, margin, lifetime, ltv, cac) that map to the
// given cells' labels by keyword. Values ending in "%" are divided by 100.
const SYNONYMS: Record<string, string> = {
  spend: "spend",
  customers: "customers",
  price: "price",
  cost: "cost",
  churn: "churn",
  margin: "margin",
  lifetime: "lifetime",
  ltv: "ltv",
  cac: "cac",
};

function resolveToken(token: string, cells: EconGridCell[]): number | null {
  const key = token.replace("%", "").toLowerCase();
  const synonym = SYNONYMS[key] ?? key;
  const cell = cells.find((c) => c.given && c.label.toLowerCase().includes(synonym));
  if (cell?.value == null) return null;
  // Percent-unit cells (e.g. churn=5 meaning 5%) are stored as their raw
  // number, not a fraction — divide by 100 based on the cell's unit, not the
  // token's spelling, so "churn" and "cost%" both resolve correctly.
  return cell.unit === "%" ? cell.value / 100 : cell.value;
}

function evalFormula(formula: string, cells: EconGridCell[]): number | null {
  const tokens = formula.match(/[a-zA-Z][a-zA-Z0-9]*%?/g) ?? [];
  let expr = formula;
  for (const token of new Set(tokens)) {
    const value = resolveToken(token, cells);
    if (value == null) return null;
    expr = expr.split(token).join(`(${value})`);
  }
  try {
    const result = Function(`"use strict"; return (${expr});`)();
    return typeof result === "number" && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

function formatValue(value: number, unit?: string): string {
  const rounded = Math.round(value * 100) / 100;
  if (unit === "$") return `$${rounded.toLocaleString()}`;
  if (unit === "%") return `${rounded}%`;
  return rounded.toLocaleString();
}

export function EconGrid({ config }: { config: EconGridConfig }) {
  const [inputs, setInputs] = useState<Record<number, string>>({});

  const expected = useMemo(
    () =>
      config.cells.map((cell) =>
        cell.computed && cell.formula ? evalFormula(cell.formula, config.cells) : null
      ),
    [config.cells]
  );

  return (
    <div className="p-3.5 sm:p-4">
      <div className="grid gap-2">
        {config.cells.map((cell, i) => {
          const isComputed = cell.computed;
          const raw = inputs[i] ?? "";
          const guess = raw.trim() === "" ? null : Number(raw);
          const target = expected[i];
          const isCorrect =
            isComputed && guess != null && target != null && Math.abs(guess - target) / Math.max(Math.abs(target), 1e-6) < 0.05;
          const isWrong = isComputed && guess != null && target != null && !isCorrect;

          return (
            <div
              key={cell.label}
              className={clsx(
                "flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5",
                isComputed ? "bg-surface-2 ring-1 ring-border-strong" : "bg-surface"
              )}
            >
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{cell.label}</div>
                {cell.note && <div className="text-[11px] text-muted mt-0.5">{cell.note}</div>}
              </div>
              {isComputed ? (
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={raw}
                    onChange={(e) => setInputs((s) => ({ ...s, [i]: e.target.value }))}
                    placeholder={cell.unit === "$" ? "$" : cell.unit === "%" ? "%" : "?"}
                    className={clsx(
                      "w-24 rounded-lg bg-surface px-2.5 py-1.5 text-right text-[13px] font-mono outline-none ring-1 transition-colors",
                      isCorrect && "ring-accent text-accent",
                      isWrong && "ring-danger text-danger",
                      !isCorrect && !isWrong && "ring-border focus:ring-border-strong"
                    )}
                  />
                  {isCorrect && <span className="text-accent text-sm">✓</span>}
                  {isWrong && <span className="text-danger text-sm">✕</span>}
                </div>
              ) : (
                <div className="text-[14px] font-mono font-semibold shrink-0">
                  {cell.value != null ? formatValue(cell.value, cell.unit) : "—"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
