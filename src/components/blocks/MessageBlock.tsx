import { Prose } from "@/lib/markdown";
import { Avatar } from "@/components/Avatar";
import type { Character, MessageBlock as MessageBlockType } from "@/lib/types";

export function MessageBlock({ block, character }: { block: MessageBlockType; character?: Character }) {
  return (
    <div className="flex gap-2.5 sm:gap-3 animate-rise-in">
      <Avatar character={character} />
      <div className="flex-1 min-w-0 rounded-2xl rounded-tl-md bg-surface px-4 py-3 sm:px-5 sm:py-3.5 shadow-[var(--shadow-card)]">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-foreground text-[15px]">{character?.name ?? "Unknown"}</span>
          {character?.role && <span className="text-xs text-muted-2">{character.role}</span>}
        </div>
        <Prose text={block.markdown} className="mt-1 text-[15px] text-foreground/90 leading-relaxed" />
      </div>
    </div>
  );
}
