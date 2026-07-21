import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "~/lib/site";
import { getLegalPages } from "~/lib/products";
import { LegalPage } from "~/components/LegalPage";

// Real, standalone, server-rendered route — same reasoning as /about and
// /feedback. Content is CMS-driven (Legal Pages global) and is DRAFT, not
// legal advice — see apps/cms/src/globals/LegalPages.ts's header comment.
export const Route = createFileRoute("/privacy")({
  loader: async () => {
    const [siteUrl, legalPages] = await Promise.all([getSiteUrl(), getLegalPages()]);
    return { siteUrl, privacy: legalPages.privacy };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { siteUrl } = loaderData;
    const title = "Privacy Policy — Yese Creations";
    const description = "How Yese Creations collects, uses, and protects your information.";
    const canonicalUrl = `${siteUrl}/privacy`;
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
  component: PrivacyRoute,
});

function PrivacyRoute() {
  const { privacy } = Route.useLoaderData();
  return <LegalPage title="Privacy Policy" data={privacy} />;
}
