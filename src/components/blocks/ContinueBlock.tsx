export function ContinueBlock({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="ml-[50px] sm:ml-[56px] animate-rise-in">
      <button
        type="button"
        onClick={onClick}
        className="min-h-11 rounded-full bg-surface-2 px-5 py-2.5 text-[15px] font-medium text-foreground shadow-[var(--shadow-card)] transition-all active:scale-95 hover:bg-surface-elevated"
      >
        {label}
      </button>
    </div>
  );
}
