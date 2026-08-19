import React from "react";

// Minimal **bold** -> green highlight span renderer (no external markdown dep needed for this content).
export function Prose({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\n\n+/);
  return (
    <div className={className}>
      {parts.map((para, i) => (
        <p key={i} className={i > 0 ? "mt-3" : undefined}>
          {renderInline(para)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <strong key={i} className="text-accent font-semibold">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
}
