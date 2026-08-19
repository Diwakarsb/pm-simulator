import { Prose } from "@/lib/markdown";
import type { Character, MessageBlock as MessageBlockType } from "@/lib/types";

export function MessageBlock({ block, character }: { block: MessageBlockType; character?: Character }) {
  return (
    <div className="flex gap-3">
      {character?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={character.avatarUrl}
          alt={character.name}
          className="h-10 w-10 shrink-0 rounded-full border border-border object-cover grayscale"
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-full bg-surface-2 border border-border flex items-center justify-center text-sm font-semibold text-muted grayscale">
          {character?.name?.[0] ?? "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-foreground">{character?.name ?? "Unknown"}</span>
          {character?.role && <span className="text-xs text-muted">{character.role}</span>}
        </div>
        <Prose text={block.markdown} className="mt-1 text-foreground/90" />
      </div>
    </div>
  );
}
