// Yarn ball SVG.
// Ported verbatim from design_handoff_yese_shop/placeholders.jsx.

export interface YarnBallProps {
  color?: string;
  accent?: string;
  size?: number | string;
}

export function YarnBall({
  color = "#FF6F61",
  accent = "#F2B233",
  size = 80,
}: YarnBallProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="42" fill={color} />
      <g stroke={accent} strokeWidth="1.4" fill="none" opacity="0.7">
        <path d="M16 50 C 30 30, 70 30, 84 50" />
        <path d="M16 50 C 30 70, 70 70, 84 50" />
        <path d="M50 8 C 30 25, 30 75, 50 92" />
        <path d="M50 8 C 70 25, 70 75, 50 92" />
        <ellipse cx="50" cy="50" rx="42" ry="18" />
        <ellipse cx="50" cy="50" rx="18" ry="42" />
      </g>
      <path d="M84 50 C 92 52, 96 58, 92 64" stroke={accent} strokeWidth="2" fill="none" />
    </svg>
  );
}
