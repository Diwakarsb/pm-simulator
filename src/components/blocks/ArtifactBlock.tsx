import type { ArtifactBlock as ArtifactBlockType } from "@/lib/types";

export function ArtifactBlock({ block }: { block: ArtifactBlockType }) {
  if (block.kind === "image" && block.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={block.imageUrl} alt="artifact" className="ml-[52px] rounded-lg border border-border max-w-full" />;
  }

  const isCode = block.kind === "code";
  return (
    <div className="ml-[52px] rounded-lg border border-border bg-surface p-4 font-mono text-sm whitespace-pre-wrap text-foreground/90 overflow-x-auto">
      {isCode && block.lang && (
        <div className="text-xs text-muted mb-2 uppercase tracking-wide">{block.lang}</div>
      )}
      {block.content}
    </div>
  );
}
