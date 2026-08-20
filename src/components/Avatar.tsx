import type { Character } from "@/lib/types";

const GRADIENTS = [
  ["#ff9f43", "#ff6b6b"],
  ["#0a84ff", "#5e5ce6"],
  ["#30d158", "#0a9c4a"],
  ["#ff375f", "#ff9f0a"],
  ["#5e5ce6", "#bf5af2"],
  ["#64d2ff", "#0a84ff"],
];

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function gradientFor(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const pair = GRADIENTS[hash % GRADIENTS.length];
  return pair as [string, string];
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 sm:h-11 sm:w-11 text-sm",
  lg: "h-14 w-14 text-lg",
} as const;

export function Avatar({
  character,
  size = "md",
  className = "",
}: {
  character?: Character;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const name = character?.name ?? "?";

  if (character?.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={character.avatarUrl}
        alt={name}
        className={`${SIZE_CLASSES[size]} shrink-0 rounded-full object-cover ring-1 ring-border-strong ${className}`}
      />
    );
  }

  const [from, to] = gradientFor(name);
  return (
    <div
      className={`${SIZE_CLASSES[size]} shrink-0 rounded-full flex items-center justify-center font-semibold text-white ring-1 ring-border-strong ${className}`}
      style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
    >
      {initialsFor(name)}
    </div>
  );
}
