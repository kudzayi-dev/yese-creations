import { createFileRoute, notFound } from "@tanstack/react-router";
import { PHGradient } from "@yese/ui";
import { MOTIFS, PALETTES } from "@yese/product-data";

export const Route = createFileRoute("/dev/ph-demo")({
  loader: () => {
    // Dev-only: this route (and the demo it renders) should never ship to
    // production. Remove this file once Stage 11 fidelity is confirmed.
    if (!import.meta.env.DEV) throw notFound();
  },
  component: PhDemoPage,
});

function PhDemoPage() {
  return (
    <main
      style={{
        fontFamily: "var(--font-body)",
        padding: "3rem 2rem",
        background: "var(--cream)",
        minHeight: "100vh",
      }}
    >
      <h1 className="h-display" style={{ fontSize: "32px", marginBottom: "8px" }}>
        PHGradient motif check
      </h1>
      <p style={{ color: "var(--teal)", marginBottom: "32px" }}>
        Dev-only route — {MOTIFS.length} motifs, cycling through the 8 palettes.
        Diff against <code>design_handoff_yese_shop/product/*.html</code>.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "24px",
        }}
      >
        {MOTIFS.map((motif, i) => (
          <div
            key={motif}
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: "18px",
              overflow: "hidden",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <PHGradient palette={PALETTES[i % PALETTES.length]!} motif={motif} caption={motif} />
          </div>
        ))}
      </div>
    </main>
  );
}
