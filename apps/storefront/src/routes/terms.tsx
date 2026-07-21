import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "~/lib/site";
import { getLegalPages } from "~/lib/products";
import { LegalPage } from "~/components/LegalPage";

// Real, standalone, server-rendered route — same reasoning as /about and
// /feedback. Content is CMS-driven (Legal Pages global) and is DRAFT, not
// legal advice — see apps/cms/src/globals/LegalPages.ts's header comment.
export const Route = createFileRoute("/terms")({
  loader: async () => {
    const [siteUrl, legalPages] = await Promise.all([getSiteUrl(), getLegalPages()]);
    return { siteUrl, terms: legalPages.terms };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl } = loaderData;
    const title = "Terms & Conditions — Yese Creations";
    const description = "The terms that apply when you order from Yese Creations.";
    const canonicalUrl = `${siteUrl}/terms`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalUrl },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
    };
  },
  component: TermsRoute,
});

function TermsRoute() {
  const { terms } = Route.useLoaderData();
  return <LegalPage title="Terms & Conditions" data={terms} />;
}
