import Link from "next/link";
import { MODULE_LIST } from "@/lib/modules";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[880px] px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All simulators</h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Story-driven practice for real PM skills — pick a simulator to start.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {MODULE_LIST.map(({ module: m }) => (
          <Link
            key={m.id}
            href={`/lesson/${m.id}`}
            className="group flex flex-col rounded-3xl bg-surface p-5 sm:p-6 shadow-[var(--shadow-card)] transition-all active:scale-[0.99] hover:bg-surface-elevated"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[17px] font-semibold leading-snug">{m.title}</h2>
              <span
                className={
                  m.isFree
                    ? "shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent"
                    : "shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-muted"
                }
              >
                {m.isFree ? "Free" : m.priceEUR != null ? `€${m.priceEUR}` : "Paid"}
              </span>
            </div>
            {m.subtitle && (
              <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-2">
                {m.subtitle}
              </div>
            )}
            {m.description && (
              <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{m.description}</p>
            )}
            <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-cross-sell">
              Start
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
