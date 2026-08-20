import type { ArtifactBlock as ArtifactBlockType } from "@/lib/types";

export function ArtifactBlock({ block }: { block: ArtifactBlockType }) {
  if (block.kind === "image" && block.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={block.imageUrl}
        alt="artifact"
        className="ml-[50px] sm:ml-[56px] rounded-2xl border border-border max-w-[calc(100%-50px)] sm:max-w-[calc(100%-56px)] animate-rise-in"
      />
    );
  }

  const isCode = block.kind === "code";
  return (
    <div className="ml-[50px] sm:ml-[56px] rounded-2xl border border-border bg-surface-elevated p-4 sm:p-5 font-mono text-[13px] sm:text-sm whitespace-pre-wrap text-foreground/90 overflow-x-auto shadow-[var(--shadow-card)] animate-rise-in">
      {isCode && block.lang && (
        <div className="text-[10px] text-muted-2 mb-2 uppercase tracking-wider font-sans font-semibold">
          {block.lang}
        </div>
      )}
      {block.content}
    </div>
  );
}
