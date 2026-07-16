/**
 * scrollToSection.ts — smooth-scrolls to an in-page section by id WITHOUT
 * touching the URL (no hash pushed to history/address bar). Used by
 * same-page nav links (Nav, Hero, Footer, Gallery) so clicking "Shop" /
 * "Our Story" / etc. while already on the homepage doesn't rewrite the
 * address bar to "/#shop", "/#story", etc.
 *
 * The `href="#id"` on these links is kept as a real fallback (no-JS,
 * crawlers, copying the link) — this handler only intercepts a plain
 * primary click. Modifier-clicks and middle-clicks are left alone so
 * opening in a new tab still works, same pattern as ProductCard's
 * `intercept()`.
 */
export function scrollToSection(e: React.MouseEvent, id: string): void {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
