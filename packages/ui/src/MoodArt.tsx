// Mood images for the moodboard: picks a palette + motif by index.
// Ported from design_handoff_yese_shop/placeholders.jsx.

import type { Motif } from "@yese/product-data";
import { PALETTES } from "@yese/product-data";
import { PHGradient } from "./PHGradient";

const MOOD_MOTIFS: Motif[] = [
  "heart",
  "ball",
  "loop",
  "tassel",
  "flower",
  "bunny",
  "cushion",
  "bag",
  "canvas",
  "abstract",
  "portrait",
];

export interface MoodArtProps {
  idx: number;
  caption?: string;
}

export function MoodArt({ idx, caption }: MoodArtProps) {
  const palette = PALETTES[idx % PALETTES.length]!;
  const motif = MOOD_MOTIFS[idx % MOOD_MOTIFS.length]!;
  return <PHGradient palette={palette} caption={caption} motif={motif} />;
}
