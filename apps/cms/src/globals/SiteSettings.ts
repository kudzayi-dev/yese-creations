import type { GlobalConfig } from "payload";

// Site-wide feature flags for homepage sections that exist in code but
// aren't ready for real customers yet (no real content, or still being
// built). Lets Theresa (or whoever's editing) turn a section on the moment
// it's ready without a code deploy — flip a switch in /admin instead of
// editing route.tsx and asking a developer to ship it.
//
// Read is public (the storefront's server-side loader has no admin session,
// same reasoning as Products/Media). Only an authenticated admin can flip
// the switches.
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: "group",
      name: "homepageSections",
      label: "Homepage sections",
      admin: {
        description:
          "Turn a section off if it isn't ready for real customers yet (no real content, still being designed, etc). Off means it's skipped entirely — not shown empty or as a placeholder.",
      },
      fields: [
        {
          name: "originalArtworks",
          label: "Original Artworks (gallery of paintings)",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "process",
          label: "How I make each piece",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "studioJournal",
          label: "Studio Journal (yarn room moodboard)",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "bespoke",
          label: "Bespoke (custom order form)",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Also controls the \"Bespoke\" nav link — off hides both the section and the link, so the nav never points at a section that isn't on the page.",
          },
        },
      ],
    },
    {
      type: "group",
      name: "feedback",
      label: "Feedback",
      admin: {
        description:
          "Controls which testimonials the storefront shows on the homepage and /feedback.",
      },
      fields: [
        {
          name: "showEbaySourced",
          label: "Show eBay-sourced reviews",
          type: "checkbox",
          defaultValue: true,
          admin: {
            description:
              "On launch, all feedback is migrated from the eBay store (masked buyer handle, no real name). Turn this off once there's enough organic in-app feedback (source: App) to stand on its own — eBay-sourced entries stay in the CMS but stop being returned to the storefront, no need to delete or re-tag them.",
          },
        },
      ],
    },
  ],
};
