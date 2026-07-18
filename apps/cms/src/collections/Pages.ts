import type { CollectionConfig } from "payload";
import {
  HeroBlock,
  PromoBannerBlock,
  TrustBandBlock,
  ProductGridBlock,
  StoryBlock,
  GalleryBlock,
  ProcessBlock,
  MoodboardBlock,
  BespokeBlock,
  TestimonialsBlock,
} from "../blocks/homepage";

// The homepage (and, in future, seasonal/campaign landing pages) as a
// composable ordered array of blocks — adapted from a supplied "composable
// Payload blocks" advisory doc, trimmed to fit a single-brand, single-
// catalog, one-woman shop rather than a multi-collection storefront. Editors
// add/remove/reorder sections here without a code deploy; the storefront's
// "/" route reads the `home` page and renders `layout` in order (see
// routes/index.tsx).
export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug"],
    description:
      "Composable pages built from an ordered list of sections. The homepage lives here (slug \"home\") \u2014 add, remove, or drag to reorder sections in \"Layout\" below.",
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: 'The homepage uses "home". Future landing pages would use their own slug.' },
    },
    {
      name: "layout",
      type: "blocks",
      minRows: 0,
      blocks: [
        HeroBlock,
        PromoBannerBlock,
        TrustBandBlock,
        ProductGridBlock,
        StoryBlock,
        GalleryBlock,
        ProcessBlock,
        MoodboardBlock,
        BespokeBlock,
        TestimonialsBlock,
      ],
    },
  ],
};
