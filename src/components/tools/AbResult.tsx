import clsx from "clsx";
import type { AbResultConfig } from "@/lib/types";

function isSignificant(pValue: number | undefined, ci: string | undefined): boolean {
  if (pValue != null) return pValue < 0.05;
  if (ci) return !ci.includes("-") || ci.trim().startsWith("+");
  return false;
}

export function AbResult({ config }: { config: AbResultConfig }) {
  const significant = isSignificant(config.pValue, config.confidenceInterval);

  return (
    <div className="p-3.5 sm:p-4">
      <div className="text-[10px] text-muted-2 uppercase tracking-wider font-semibold mb-1">
        Primary metric
      </div>
      <div className="text-[14px] font-semibold mb-3">{config.primaryMetric}</div>
      {config.guardrailMetric && (
        <div className="text-[11px] text-muted mb-3">
          Guardrail: <span className="text-foreground/80">{config.guardrailMetric}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl ring-1 ring-border">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-surface-2 text-muted-2">
              <th className="px-2.5 py-2 text-left font-medium">Variant</th>
              <th className="px-2.5 py-2 text-right font-medium">Users</th>
              <th className="px-2.5 py-2 text-right font-medium">Metric</th>
            </tr>
          </thead>
          <tbody>
            {config.variants.map((v) => (
              <tr key={v.name} className="border-t border-border/60">
                <td className="px-2.5 py-1.5 font-medium">{v.name}</td>
                <td className="px-2.5 py-1.5 text-right font-mono text-muted">
                  {v.users.toLocaleString()}
                </td>
                <td className="px-2.5 py-1.5 text-right font-mono">{v.metric}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Uplift" value={config.relativeUplift} highlight={significant} />
        {config.pValue != null && (
          <Stat label="p-value" value={config.pValue.toString()} highlight={significant} />
        )}
        {config.confidenceInterval && (
          <Stat label="95% CI" value={config.confidenceInterval} highlight={significant} />
        )}
        {config.powered != null && (
          <Stat label="Powered" value={config.powered ? "Yes" : "No"} highlight={config.powered} />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div
      className={clsx(
        "rounded-xl px-2.5 py-2 text-center",
        highlight ? "bg-accent-soft" : "bg-surface-2"
      )}
    >
      <div className="text-[9px] uppercase tracking-wide text-muted-2">{label}</div>
      <div className={clsx("text-[13px] font-semibold font-mono", highlight ? "text-accent" : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}
