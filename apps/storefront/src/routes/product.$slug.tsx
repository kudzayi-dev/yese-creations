import { createFileRoute, notFound } from "@tanstack/react-router";
import { getAllProducts, getProductBySlug } from "~/lib/products";
import { getSiteUrl } from "~/lib/site";
import {
  buildProductJsonLd,
  productMetaDescription,
  productMetaTitle,
  productOgImages,
} from "~/lib/seo";
import { getRelatedStorefrontProducts, detailForStorefront } from "@yese/product-data";
import { Pdp } from "~/components/Pdp";

// The real, server-rendered PDP. `/product/<slug>`, no extension (the
// prototype's PDPs were `product/<slug>.html`). Content here MUST render
// in the initial server HTML (load-bearing constraint #1) — verify with
// view-source / curl, not just the browser after hydration.
//
// SEO head (title/meta/canonical/OG/Twitter/JSON-LD) is built in head()
// below. Client interactivity (gallery switching, qty stepper, add-to-basket,
// wishlist) lives in Pdp.tsx — this route just supplies the initial state.
export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: params.slug });
    if (!product) throw notFound();

    // 186 products post-migration — still cheap enough to fetch the full list
    // to compute "Others also loved". Revisit (paginate / dedicated
    // related-products endpoint) if the catalog grows substantially further.
    const all = await getAllProducts();
    const related = getRelatedStorefrontProducts(all, product, 4);

    // SITE_URL is server-only (no VITE_ prefix, see lib/site.ts) — fetched via
    // createServerFn here so head() below can read it off loaderData instead
    // of touching process.env directly in code that also runs client-side.
    const siteUrl = await getSiteUrl();

    return { product, related, siteUrl };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { product, siteUrl } = loaderData;

    const detail = detailForStorefront(product);
    const title = productMetaTitle(product);
    const description = productMetaDescription(product, detail);
    const images = productOgImages(product, siteUrl);
    const canonicalUrl = `${siteUrl}/product/${product.slug}`;
    const jsonLd = buildProductJsonLd({ product, description, images, canonicalUrl });

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:site_name", content: "Yese Creations" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: images[0]! },
        { property: "og:url", content: canonicalUrl },
        { property: "product:price:amount", content: product.price.toFixed(2) },
        { property: "product:price:currency", content: "GBP" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: images[0]! },
        { "script:ld+json": jsonLd },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  return <Pdp product={product} related={related} />;
}
