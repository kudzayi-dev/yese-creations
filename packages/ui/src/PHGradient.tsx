// Generic gradient placeholder with stripes, motif art & optional caption.
// Ported verbatim from design_handoff_yese_shop/placeholders.jsx.
// `palette` is a Palette object (not an index); `motif` picks the SVG art.

import type { CSSProperties } from "react";
import type { Motif, Palette } from "@yese/product-data";
import { YarnHeart } from "./YarnHeart";
import { YarnBall } from "./YarnBall";

const DROP_SHADOW = "drop-shadow(0 10px 18px rgba(0,0,0,0.25))";

export interface PHGradientProps {
  palette: Palette;
  caption?: string;
  motif?: Motif;
}

export function PHGradient({ palette, caption, motif = "heart" }: PHGradientProps) {
  const bg: CSSProperties = {
    background: `radial-gradient(circle at 30% 25%, ${palette.from}, transparent 55%),
                 radial-gradient(circle at 75% 70%, ${palette.to}, transparent 60%),
                 linear-gradient(135deg, ${palette.via}, ${palette.from})`,
  };
  return (
    <div className="ph ph-stripes" style={bg}>
      <MotifArt motif={motif} palette={palette} />
      {caption && <div className="ph-caption">{caption}</div>}
    </div>
  );
}

function MotifArt({ motif, palette }: { motif: Motif; palette: Palette }) {
  switch (motif) {
    case "heart":
      return (
        <div style={{ width: "58%", opacity: 0.92, filter: DROP_SHADOW }}>
          <YarnHeart color="rgba(255,250,241,0.92)" stroke="rgba(0,0,0,0.18)" />
        </div>
      );
    case "ball":
      return (
        <div style={{ width: "62%", display: "flex", justifyContent: "center", filter: DROP_SHADOW }}>
          <YarnBall color={palette.from} accent="rgba(255,250,241,0.7)" size="80%" />
        </div>
      );
    case "loop":
      return (
        <svg viewBox="0 0 200 200" width="70%" style={{ filter: DROP_SHADOW }}>
          <g stroke="rgba(255,250,241,0.92)" strokeWidth="6" fill="none" strokeLinecap="round">
            <path d="M30 80 Q 60 30, 100 80 T 170 80" />
            <path d="M30 120 Q 60 70, 100 120 T 170 120" />
            <path d="M30 160 Q 60 110, 100 160 T 170 160" />
          </g>
        </svg>
      );
    case "tassel":
      return (
        <svg viewBox="0 0 100 140" width="55%" style={{ filter: DROP_SHADOW }}>
          <circle cx="50" cy="30" r="18" fill={palette.via} stroke="rgba(255,250,241,0.6)" strokeWidth="1.4" />
          <rect x="46" y="44" width="8" height="14" fill="rgba(255,250,241,0.9)" />
          <g stroke="rgba(255,250,241,0.95)" strokeWidth="2.5" strokeLinecap="round">
            {Array.from({ length: 9 }).map((_, i) => {
              const x = 32 + i * 4.5;
              return <line key={i} x1={x} y1="58" x2={x + (i - 4) * 0.6} y2="118" />;
            })}
          </g>
          <ellipse cx="50" cy="58" rx="22" ry="4" fill="rgba(255,250,241,0.8)" />
        </svg>
      );
    case "bunny":
      return (
        <svg viewBox="0 0 100 100" width="58%" style={{ filter: DROP_SHADOW }}>
          <ellipse cx="50" cy="68" rx="28" ry="22" fill="rgba(255,250,241,0.92)" />
          <circle cx="50" cy="42" r="18" fill="rgba(255,250,241,0.92)" />
          <ellipse cx="42" cy="22" rx="5" ry="14" fill="rgba(255,250,241,0.92)" transform="rotate(-12 42 22)" />
          <ellipse cx="58" cy="22" rx="5" ry="14" fill="rgba(255,250,241,0.92)" transform="rotate(12 58 22)" />
          <ellipse cx="42" cy="22" rx="2" ry="9" fill={palette.from} transform="rotate(-12 42 22)" />
          <ellipse cx="58" cy="22" rx="2" ry="9" fill={palette.from} transform="rotate(12 58 22)" />
          <circle cx="44" cy="40" r="2" fill={palette.via} />
          <circle cx="56" cy="40" r="2" fill={palette.via} />
          <path d="M50 46 Q 47 50, 50 52 Q 53 50, 50 46" fill={palette.from} />
          <circle cx="72" cy="76" r="6" fill="rgba(255,250,241,0.85)" />
        </svg>
      );
    case "flower":
      return (
        <svg viewBox="0 0 100 100" width="62%" style={{ filter: DROP_SHADOW }}>
          <g fill="rgba(255,250,241,0.92)">
            <ellipse cx="50" cy="22" rx="11" ry="16" />
            <ellipse cx="78" cy="50" rx="16" ry="11" />
            <ellipse cx="50" cy="78" rx="11" ry="16" />
            <ellipse cx="22" cy="50" rx="16" ry="11" />
            <ellipse cx="68" cy="32" rx="13" ry="10" transform="rotate(45 68 32)" />
            <ellipse cx="68" cy="68" rx="13" ry="10" transform="rotate(-45 68 68)" />
            <ellipse cx="32" cy="68" rx="13" ry="10" transform="rotate(45 32 68)" />
            <ellipse cx="32" cy="32" rx="13" ry="10" transform="rotate(-45 32 32)" />
          </g>
          <circle cx="50" cy="50" r="13" fill={palette.via} />
          <circle cx="50" cy="50" r="6" fill={palette.from} />
        </svg>
      );
    case "bag":
      return (
        <svg viewBox="0 0 100 100" width="60%" style={{ filter: DROP_SHADOW }}>
          <path d="M22 38 L 78 38 L 82 88 L 18 88 Z" fill="rgba(255,250,241,0.92)" />
          <path d="M35 38 C 35 22, 65 22, 65 38" stroke="rgba(255,250,241,0.92)" strokeWidth="4" fill="none" />
          <g stroke={palette.from} strokeWidth="1.4" opacity="0.6">
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={22} y1={48 + i * 5} x2={78} y2={48 + i * 5} />
            ))}
          </g>
          <circle cx="50" cy="64" r="9" fill={palette.via} />
        </svg>
      );
    case "canvas":
      return (
        <svg viewBox="0 0 100 100" width="78%" style={{ filter: DROP_SHADOW }}>
          <rect x="6" y="6" width="88" height="88" fill="rgba(255,250,241,0.96)" rx="2" />
          <g opacity="0.9">
            <path d="M14 78 Q 32 30, 50 50 T 86 32" stroke={palette.from} strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M20 60 Q 38 18, 62 38 T 90 70" stroke={palette.via} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
            <circle cx="68" cy="26" r="9" fill={palette.to} opacity="0.85" />
            <circle cx="32" cy="76" r="6" fill={palette.from} opacity="0.7" />
          </g>
          <rect x="6" y="6" width="88" height="88" fill="none" stroke={palette.to} strokeWidth="2" rx="2" />
        </svg>
      );
    case "abstract":
      return (
        <svg viewBox="0 0 100 100" width="78%" style={{ filter: DROP_SHADOW }}>
          <rect x="6" y="6" width="88" height="88" fill="rgba(255,250,241,0.96)" rx="2" />
          <g>
            <ellipse cx="40" cy="42" rx="22" ry="28" fill={palette.from} opacity="0.85" transform="rotate(-18 40 42)" />
            <ellipse cx="64" cy="60" rx="18" ry="24" fill={palette.via} opacity="0.75" transform="rotate(22 64 60)" />
            <circle cx="72" cy="32" r="9" fill={palette.to} />
            <path d="M14 80 Q 50 70, 86 84" stroke={palette.to} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <rect x="6" y="6" width="88" height="88" fill="none" stroke={palette.via} strokeWidth="2" rx="2" />
        </svg>
      );
    case "portrait":
      return (
        <svg viewBox="0 0 100 120" width="68%" style={{ filter: DROP_SHADOW }}>
          <rect x="6" y="6" width="88" height="108" fill="rgba(255,250,241,0.96)" rx="2" />
          <g>
            <path
              d="M50 24 C 32 24, 26 44, 30 60 C 32 70, 40 78, 50 78 C 60 78, 68 70, 70 60 C 74 44, 68 24, 50 24 Z"
              fill={palette.from}
              opacity="0.85"
            />
            <path d="M22 110 C 22 92, 38 86, 50 86 C 62 86, 78 92, 78 110 Z" fill={palette.via} opacity="0.85" />
            <circle cx="42" cy="50" r="2.4" fill={palette.to} />
            <circle cx="58" cy="50" r="2.4" fill={palette.to} />
            <path d="M44 62 Q 50 66, 56 62" stroke={palette.to} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
          <rect x="6" y="6" width="88" height="108" fill="none" stroke={palette.to} strokeWidth="2" rx="2" />
        </svg>
      );
    case "cushion":
      return (
        <svg viewBox="0 0 100 100" width="64%" style={{ filter: DROP_SHADOW }}>
          <rect x="18" y="22" width="64" height="56" rx="14" fill="rgba(255,250,241,0.92)" />
          <rect x="26" y="30" width="48" height="40" rx="6" fill="none" stroke={palette.from} strokeWidth="1.4" opacity="0.6" />
          <g stroke={palette.from} strokeWidth="1.2" opacity="0.55">
            <line x1="26" y1="50" x2="74" y2="50" />
            <line x1="50" y1="30" x2="50" y2="70" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
