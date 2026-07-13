import type { Palette } from "./types";

// Ported verbatim from placeholders.jsx (yesePalettes). Index referenced by
// each Product's `palette` field and by synthesized placeholder gallery views.
export const PALETTES: Palette[] = [
  { from: "#FF6F61", via: "#F2B233", to: "#5B2A4E", stripe: "rgba(255,255,255,0.18)" },
  { from: "#2BB6C4", via: "#0E3B43", to: "#5B2A4E", stripe: "rgba(255,255,255,0.16)" },
  { from: "#F2B233", via: "#FF6F61", to: "#5B2A4E", stripe: "rgba(255,255,255,0.20)" },
  { from: "#5B2A4E", via: "#FF6F61", to: "#F2B233", stripe: "rgba(255,255,255,0.18)" },
  { from: "#0E3B43", via: "#2BB6C4", to: "#4FD8E6", stripe: "rgba(255,255,255,0.20)" },
  { from: "#FF9885", via: "#F2B233", to: "#FFD06B", stripe: "rgba(255,255,255,0.20)" },
  { from: "#082329", via: "#2BB6C4", to: "#F2B233", stripe: "rgba(255,255,255,0.18)" },
  { from: "#5B2A4E", via: "#3A1731", to: "#FF6F61", stripe: "rgba(255,255,255,0.18)" },
];
