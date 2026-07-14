import type { IconProps } from "./types";

export function IconHeart({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-7.5-4.6-9.6-9.2C.7 8 3 4 6.8 4c2 0 3.6 1.2 4.6 2.6h1.2C13.6 5.2 15.2 4 17.2 4 21 4 23.3 8 21.6 11.8 19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
