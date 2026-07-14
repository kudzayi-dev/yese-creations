import type { IconProps } from "./types";

export function IconHeartOutline({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 8.6c-1.6-3.6-6-4-8.2-1L12 8l-.6-.4c-2.2-3-6.6-2.6-8.2 1-1.7 3.8.6 7.8 2.4 9.4C7.7 19.4 12 22 12 22s4.3-2.6 6.4-4c1.8-1.6 4.1-5.6 2.4-9.4z" />
    </svg>
  );
}
