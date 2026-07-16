import { createContext, useContext, useState, type ReactNode } from "react";

interface AboutOverlayContextValue {
  isOpen: boolean;
  openAbout: () => void;
  closeAbout: () => void;
}

const AboutOverlayContext = createContext<AboutOverlayContextValue | null>(null);

// Mounted once at the root (see __root.tsx) alongside CartProvider, so any
// page's Nav can open the About overlay regardless of which route rendered
// it — not just the homepage. See AboutOverlay.tsx for why this exists
// separately from the homepage's inline Story section.
export function AboutOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <AboutOverlayContext.Provider
      value={{ isOpen, openAbout: () => setIsOpen(true), closeAbout: () => setIsOpen(false) }}
    >
      {children}
    </AboutOverlayContext.Provider>
  );
}

export function useAboutOverlay(): AboutOverlayContextValue {
  const ctx = useContext(AboutOverlayContext);
  if (!ctx) throw new Error("useAboutOverlay must be used within AboutOverlayProvider");
  return ctx;
}
