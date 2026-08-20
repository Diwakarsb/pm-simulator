import clsx from "clsx";

export function ContinueBlock({
  label,
  onClick,
  isCurrent,
}: {
  label: string;
  onClick: () => void;
  isCurrent: boolean;
}) {
  return (
    <div className="ml-[50px] sm:ml-[56px] animate-rise-in">
      <button
        type="button"
        onClick={isCurrent ? onClick : undefined}
        disabled={!isCurrent}
        className={clsx(
          "min-h-11 rounded-full px-5 py-2.5 text-[15px] font-medium shadow-[var(--shadow-card)] transition-all",
          isCurrent
            ? "bg-surface-2 text-foreground active:scale-95 hover:bg-surface-elevated"
            : "bg-transparent text-muted-2 shadow-none cursor-default flex items-center gap-1.5"
        )}
      >
        {!isCurrent && <span className="text-accent">✓</span>}
        {label}
      </button>
    </div>
  );
}
