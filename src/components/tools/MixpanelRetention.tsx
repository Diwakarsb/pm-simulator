import type { MixpanelRetentionConfig } from "@/lib/types";

function shade(pct: number): string {
  const t = Math.max(0, Math.min(1, pct / 100));
  return `rgba(48, 209, 88, ${0.08 + t * 0.55})`;
}

export function MixpanelRetention({ config }: { config: MixpanelRetentionConfig }) {
  const periods = Math.max(...config.cohorts.map((c) => c.retention.length));

  return (
    <div className="p-3.5 sm:p-4">
      <div className="text-[10px] text-muted-2 uppercase tracking-wider font-semibold mb-3">
        Retention · by {config.unit}
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-[11px] sm:text-[12px] min-w-full">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left font-medium text-muted-2 sticky left-0 bg-surface-elevated">
                Cohort
              </th>
              <th className="px-2 py-1.5 text-right font-medium text-muted-2 whitespace-nowrap">Size</th>
              {Array.from({ length: periods }, (_, i) => (
                <th key={i} className="px-2 py-1.5 text-center font-medium text-muted-2 whitespace-nowrap">
                  {config.unit} {i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.cohorts.map((cohort) => (
              <tr key={cohort.label} className="border-t border-border/60">
                <td className="px-2 py-1.5 font-medium whitespace-nowrap sticky left-0 bg-surface-elevated">
                  {cohort.label}
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-muted whitespace-nowrap">
                  {cohort.size.toLocaleString()}
                </td>
                {Array.from({ length: periods }, (_, i) => {
                  const value = cohort.retention[i];
                  return (
                    <td key={i} className="px-1 py-1">
                      {value != null ? (
                        <div
                          className="rounded-md text-center font-mono py-1"
                          style={{ background: shade(value) }}
                        >
                          {value}%
                        </div>
                      ) : (
                        <div className="text-center text-muted-2">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
