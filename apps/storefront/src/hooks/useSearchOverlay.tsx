import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchOverlayContextValue {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextValue | null>(null);

// Mounted once at the root (see __root.tsx) alongside CartProvider and
// AboutOverlayProvider, so the Nav's search icon can open it regardless of
// which route rendered the Nav — not just the homepage. Same reasoning as
// useAboutOverlay.tsx: only open/closed state needs to be global here, the
// query/results/product-cache state is local to SearchOverlay itself since
// nothing else in the app needs to read it.
export function SearchOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SearchOverlayContext.Provider
      value={{ isOpen, openSearch: () => setIsOpen(true), closeSearch: () => setIsOpen(false) }}
    >
      {children}
    </SearchOverlayContext.Provider>
  );
}

export function useSearchOverlay(): SearchOverlayContextValue {
  const ctx = useContext(SearchOverlayContext);
  if (!ctx) throw new Error("useSearchOverlay must be used within SearchOverlayProvider");
  return ctx;
}
