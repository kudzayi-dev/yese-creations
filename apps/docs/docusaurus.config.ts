import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// Yese Creations — client handover guide. Built as a static site (docusaurus
// build) and served ONLY through apps/cms's /admin/docs route, which checks
// the visitor has a real, logged-in Payload admin session before returning
// any of these files — see
// apps/cms/src/app/(payload)/admin/docs/[[...slug]]/route.ts. This app
// never runs its own server in production; `pnpm build` here just produces
// static files for that route to read from disk. It's linked from the
// admin nav itself — see apps/cms/src/components/DocsNavLink.tsx.
//
// baseUrl is "/admin/docs/" because that's the real path this site is
// served at once mounted behind the CMS — every generated link/asset URL
// needs that prefix baked in. routeBasePath: "/" on the docs plugin (below)
// then makes the docs pages live directly at /admin/docs/<slug> instead of
// /admin/docs/docs/<slug>.
const config: Config = {
  title: "Yese Creations — Handover Guide",
  tagline: "How to run your shop day-to-day",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "http://localhost:3001",
  baseUrl: "/admin/docs/",

  organizationName: "yese-creations",
  projectName: "yese-handover-docs",

  onBrokenLinks: "throw",
  trailingSlash: false,

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/yese-logo.png",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Yese Creations",
      logo: {
        alt: "Yese Creations",
        src: "img/yese-logo.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "guidesSidebar",
          position: "left",
          label: "Guides",
        },
        {
          // "pathname://" tells Docusaurus this is a real absolute path outside
          // the site's own baseUrl (/admin/docs/) rather than a doc slug to
          // resolve and broken-link-check against this site's own pages.
          href: "pathname:///admin",
          label: "Back to admin",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [],
      copyright: `Yese Creations — internal handover guide. Not for public distribution.`,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
