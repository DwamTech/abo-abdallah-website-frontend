export type ListeningVisual = {
  accent: string;
  icon: "book-check" | "book-marked" | "library" | "scroll" | "graduation";
};

const DEFAULT_VISUAL: ListeningVisual = {
  accent: "#a67a35",
  icon: "book-check",
};

const VISUALS: Record<string, ListeningVisual> = {
  gold: DEFAULT_VISUAL,
  sage: { accent: "#64735d", icon: "book-marked" },
  clay: { accent: "#7b5b4a", icon: "library" },
  bronze: { accent: "#8b6f43", icon: "scroll" },
  slate: { accent: "#596a72", icon: "graduation" },
};

export function getListeningVisual(variant?: string | null): ListeningVisual {
  if (!variant) return DEFAULT_VISUAL;
  return VISUALS[variant.trim().toLowerCase()] ?? DEFAULT_VISUAL;
}
