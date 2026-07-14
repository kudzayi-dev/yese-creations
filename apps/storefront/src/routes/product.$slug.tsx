import { createFileRoute, notFound } from "@tanstack/react-router";
import { getAllProducts, getProductBySlug } from "~/lib/products";
import { getRelatedStorefrontProducts } from "@yese/product-data";
import { Pdp } from "~/components/Pdp";

// Stage 16 — the real, server-rendered PDP. `/product/<slug>`, no extension
// (the prototype's PDPs were `product/<slug>.html`). Content here MUST render
// in the initial server HTML (load-bearing constraint #1) — verify with
// view-source / curl, not just the browser after hydration.
//
// SEO head (title/meta/canonical/OG/Twitter/JSON-LD) is Stage 18.
// Client interactivity (gallery switching, qty stepper, add-to-basket,
// wishlist) is Stage 19 — this route only renders the correct initial state.
export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: params.slug });
    if (!product) throw notFound();

    // Only 10 products total (Stage 07) — fetching the full list to compute
    // "More from the studio" is cheap. Revisit if the catalog grows large.
    const all = await getAllProducts();
    const related = getRelatedStorefrontProducts(all, product, 4);

    return { product, related };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  return <Pdp product={product} related={related} />;
}
