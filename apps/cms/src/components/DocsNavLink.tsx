/**
 * DocsNavLink — a custom Payload admin component that adds a link to the
 * client handover guide (/admin/docs) at the bottom of the admin nav,
 * below the collection links, so it's actually discoverable rather than
 * being a URL someone has to already know about.
 *
 * Wired in via payload.config.ts's `admin.components.afterNavLinks`. Payload
 * resolves that as a Server Component (rendered inside the admin panel's own
 * nav, which already handles auth/layout) — a plain server-rendered <a> is
 * enough here; there's no interactivity to justify a client component.
 */
export function DocsNavLink() {
  return (
    <div
      style={{
        margin: "calc(var(--base) * 0.5) 0",
        paddingTop: "calc(var(--base) * 0.5)",
        borderTop: "1px solid var(--theme-elevation-100)",
      }}
    >
      <a
        href="/admin/docs"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--theme-text)",
          fontSize: "13px",
          textDecoration: "none",
        }}
      >
        <span aria-hidden="true">📘</span>
        Admin guides
      </a>
    </div>
  );
}
