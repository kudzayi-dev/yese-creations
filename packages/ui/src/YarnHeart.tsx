// Heart shape SVG (echoes the logo's yarn-heart).
// Ported verbatim from design_handoff_yese_shop/placeholders.jsx.

export interface YarnHeartProps {
  color?: string;
  stroke?: string;
  size?: number | string;
}

export function YarnHeart({
  color = "#FFFAF1",
  stroke = "rgba(0,0,0,0.18)",
  size = "100%",
}: YarnHeartProps) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>
      <defs>
        <pattern id="loops" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.2" fill={stroke} />
        </pattern>
      </defs>
      <path
        d="M50 86 C 14 60, 8 30, 26 18 C 38 10, 48 18, 50 28 C 52 18, 62 10, 74 18 C 92 30, 86 60, 50 86 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1.6"
      />
      <path
        d="M50 86 C 14 60, 8 30, 26 18 C 38 10, 48 18, 50 28 C 52 18, 62 10, 74 18 C 92 30, 86 60, 50 86 Z"
        fill="url(#loops)"
        opacity="0.7"
      />
    </svg>
  );
}
