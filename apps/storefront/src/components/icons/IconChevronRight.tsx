import type { IconProps } from "./types";

// Checkout step indicator's separator chevron (co-steps in checkout.html).
export function IconChevronRight({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}
