// Client-only scroll-reveal hook. Ported from useReveal() in app.jsx.
// Runs only in an effect (never during SSR render), so it's SSR-safe by
// construction — no window/document access happens on the server.
import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.12 },
    );
    const observe = (el: Element) => io.observe(el);
    document.querySelectorAll(".reveal").forEach(observe);

    // Dynamic content (e.g. the product grid re-rendering after a category
    // filter click) mounts brand-new `.reveal` DOM nodes after this effect
    // already ran its one-time querySelectorAll — those nodes would never be
    // observed, so they'd never get `.in` and would stay invisible even
    // though they're already on-screen. Watch the DOM for new `.reveal`
    // nodes as they're added and observe them too.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal")) observe(node);
          node.querySelectorAll?.(".reveal").forEach(observe);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
