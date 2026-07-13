// Client-only scroll-reveal hook. Ported from useReveal() in app.jsx.
// Runs only in an effect (never during SSR render), so it's SSR-safe by
// construction — no window/document access happens on the server.
import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
