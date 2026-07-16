import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "~/lib/site";
import { AboutPage } from "~/components/AboutPage";

// Real, standalone, server-rendered route — same reasoning as /feedback:
// the homepage's inline Story section and the AboutOverlay are both fine
// for browsing in-context, but neither is a real, independently indexable
// URL a search engine or a shared link can land on. This is that page.
export const Route = createFileRoute("/about")({
  loader: async () => {
    const siteUrl = await getSiteUrl();
    return { siteUrl };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl } = loaderData;
    const title = "My Story — Yese Creations";
    const description =
      "One woman, one very colourful studio. The story behind Yese Creations, handmade crochet, plushies and art from a one-person studio in London.";
    const canonicalUrl = `${siteUrl}/about`;

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
  component: AboutPage,
});
