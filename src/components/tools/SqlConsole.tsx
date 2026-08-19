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
      <div className="md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-border p-3">
        <div className="text-xs text-muted uppercase tracking-wide mb-2">{config.database}</div>
        <div className="text-xs font-semibold mb-1">{config.table}</div>
        <ul className="space-y-0.5 text-xs text-muted font-mono">
          {SCHEMA_COLUMNS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="flex-1 min-w-0 p-3">
        <CodeMirror
          value={query}
          height="120px"
          theme={oneDark}
          extensions={[sqlLang()]}
          onChange={(v) => setQuery(v)}
          className="rounded border border-border overflow-hidden text-xs"
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={run}
            disabled={!ready || loading}
            className="rounded bg-accent text-accent-foreground px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            {loading ? "Running…" : ready ? "RUN" : "Loading engine…"}
          </button>
          {result && (
            <button
              type="button"
              onClick={() => downloadCsv(result)}
              className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
            >
              Export CSV
            </button>
          )}
        </div>

        {error && <div className="mt-2 text-xs text-danger font-mono">{error}</div>}

        {result && (
          <div className="mt-3 overflow-x-auto border border-border rounded">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-surface-2 text-muted">
                  {result.columns.map((c) => (
                    <th key={c} className="px-2 py-1.5 text-left font-normal whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 100).map((row, i) => (
                  <tr key={i} className="border-t border-border/50">
                    {result.columns.map((c) => (
                      <td key={c} className="px-2 py-1 font-mono whitespace-nowrap">
                        {String(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-2 py-1 text-[11px] text-muted">{result.rows.length} row(s)</div>
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
