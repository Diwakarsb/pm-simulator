import type { MixpanelFunnelConfig } from "@/lib/types";

export function MixpanelFunnel({ config }: { config: MixpanelFunnelConfig }) {
  const max = config.steps[0]?.count ?? 1;

  return (
    <div className="p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="text-[10px] text-muted-2 uppercase tracking-wider font-semibold">Funnel</div>
        <div className="text-[13px] font-semibold text-accent">
          {config.overallConversion.toFixed(2)}% overall conversion
        </div>
      </div>

      <div className="flex items-end gap-1.5 sm:gap-2 h-32 sm:h-40">
        {config.steps.map((step) => {
          const heightPct = Math.max(6, (step.count / max) * 100);
          return (
            <div key={step.name} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="text-[10px] sm:text-[11px] font-mono mb-1">{step.count.toLocaleString()}</div>
              <div
                className="w-full rounded-t-md bg-accent/80"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-1.5 sm:gap-2 mt-2">
        {config.steps.map((step) => (
          <div key={step.name} className="flex-1 text-center">
            <div className="text-[10px] sm:text-[11px] text-muted-2 truncate">{step.name}</div>
            <div className="text-[10px] sm:text-[11px] font-mono">
              {step.stepConversionFromPrev != null ? `${step.stepConversionFromPrev.toFixed(2)}%` : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
