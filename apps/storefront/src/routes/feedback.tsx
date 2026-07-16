import { createFileRoute } from "@tanstack/react-router";
import { getAllFeedback } from "~/lib/products";
import { getSiteUrl } from "~/lib/site";
import { FeedbackPage } from "~/components/FeedbackPage";

// Real, standalone, server-rendered route — deliberately NOT the overlay
// pattern used for products/About. Theresa has dozens of real eBay reviews;
// cramming that volume into a homepage scroll section or a modal overlay is
// bad UX (see design discussion), so /feedback is a genuine page of its own
// with real SEO metadata, same as /product/$slug.
export const Route = createFileRoute("/feedback")({
  loader: async () => {
    const [feedback, siteUrl] = await Promise.all([getAllFeedback(), getSiteUrl()]);
    return { feedback, siteUrl };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl } = loaderData;
    const title = "Kind words — Yese Creations";
    const description =
      "Real reviews from customers who bought handmade crochet, plushies, prints and more from Yese Creations.";
    const canonicalUrl = `${siteUrl}/feedback`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Yese Creations" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalUrl },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
    };
  },
  component: FeedbackRoute,
});

function FeedbackRoute() {
  const { feedback } = Route.useLoaderData();
  return <FeedbackPage feedback={feedback} />;
}
