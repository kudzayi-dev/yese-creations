import type { IconProps } from "./types";

// Left-pointing variant — used by ProductOverlay's "Back to shop" button
// (po-back in app.jsx has its own inline svg, distinct from I.arrow()).
export function IconArrowLeft({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
