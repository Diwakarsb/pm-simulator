export function ContinueBlock({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="ml-[52px]">
      <button
        type="button"
        onClick={onClick}
        className="rounded-full border border-accent px-5 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
