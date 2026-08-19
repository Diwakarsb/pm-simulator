"use client";

import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
import type { SupersetToolConfig } from "@/lib/types";
import { ensureSeeded, runQuery, type QueryResult } from "@/lib/duckdb";

const SCHEMA_COLUMNS = [
  "user_id",
  "created_date",
  "acquisition_channel",
  "acquisition_campaign",
  "country_iso",
  "h_lifetime_days",
  "h_session_frequency_days",
  "age",
  "goal",
  "is_premium",
  "acquisition_cost",
  "is_skylark",
  "onboarding_version",
];

export function SqlConsole({ config }: { config: SupersetToolConfig }) {
  const [query, setQuery] = useState(config.defaultQuery);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ensureSeeded()
      .then(() => !cancelled && setReady(true))
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const r = await runQuery(query);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row text-sm">
      <div className="shrink-0 border-b md:border-b-0 md:border-r border-border p-3.5 sm:p-4 md:w-44 overflow-x-auto">
        <div className="text-[10px] text-muted-2 uppercase tracking-wider font-semibold mb-2">{config.database}</div>
        <div className="text-[13px] font-semibold mb-1.5">{config.table}</div>
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5 md:block md:space-y-0.5 text-[11px] text-muted font-mono whitespace-nowrap">
          {SCHEMA_COLUMNS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="flex-1 min-w-0 p-3.5 sm:p-4">
        <CodeMirror
          value={query}
          height="120px"
          theme={oneDark}
          extensions={[sqlLang()]}
          onChange={(v) => setQuery(v)}
          className="rounded-xl overflow-hidden text-[13px] ring-1 ring-border"
        />
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={run}
            disabled={!ready || loading}
            className="min-h-9 rounded-full bg-accent text-accent-foreground px-4 py-1.5 text-[13px] font-semibold disabled:opacity-40 transition-all active:scale-95"
          >
            {loading ? "Running…" : ready ? "Run" : "Loading engine…"}
          </button>
          {result && (
            <button
              type="button"
              onClick={() => downloadCsv(result)}
              className="min-h-9 rounded-full border border-border px-3.5 py-1.5 text-[13px] text-muted hover:text-foreground transition-colors"
            >
              Export CSV
            </button>
          )}
        </div>

        {error && <div className="mt-2 text-xs text-danger font-mono">{error}</div>}

        {result && (
          <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-border">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-surface-2 text-muted-2">
                  {result.columns.map((c) => (
                    <th key={c} className="px-2.5 py-2 text-left font-medium whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 100).map((row, i) => (
                  <tr key={i} className="border-t border-border/60">
                    {result.columns.map((c) => (
                      <td key={c} className="px-2.5 py-1.5 font-mono whitespace-nowrap">
                        {String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-2.5 py-1.5 text-[11px] text-muted-2">{result.rows.length} row(s)</div>
          </div>
        )}
      </div>
    </div>
  );
}

function downloadCsv(result: QueryResult) {
  const header = result.columns.join(",");
  const body = result.rows
    .map((row) => result.columns.map((c) => JSON.stringify(row[c] ?? "")).join(","))
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "query_result.csv";
  a.click();
  URL.revokeObjectURL(url);
}
