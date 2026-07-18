import type { Block } from "payload";

// Ten thin content blocks for the homepage's `layout` field (see Pages.ts).
// Deliberately NOT generic Rich Content blocks — each feeds an EXISTING,
// hand-built storefront component (Hero, TrustBand, Products, Story,
// Gallery, Process, Moodboard, Bespoke, Reviews) rather than flattening the
// site's final, high-fidelity design into a page-builder aesthetic. Most
// blocks are "presence + a couple of overridable fields" — adding or
// removing the block from a page's layout IS the on/off switch, replacing
// SiteSettings.homepageSections' four booleans (that field group stays for
// backward compat but the homepage route now derives visibility from the
// live layout instead).

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    {
      name: "heading",
      type: "textarea",
      defaultValue: "Crochet & *painted*\nkeepsakes, made by\nme, with a little _magic_.",
      admin: {
        description:
          'The big headline. Use *word* for the coral script-accent style and _word_ for the outlined-stroke style (matches the current "painted" / "magic" treatment). A line on its own becomes a line break.',
      },
    },
    {
      name: "leadCopy",
      type: "textarea",
      admin: {
        description: "The paragraph under the headline. Leave empty to use the default copy.",
      },
    },
  ],
};

export const PromoBannerBlock: Block = {
  slug: "promoBanner",
  labels: { singular: "Promo Banner", plural: "Promo Banners" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "copy", type: "text", required: true },
    { name: "ctaLabel", type: "text" },
    { name: "ctaHref", type: "text" },
    {
      name: "theme",
      type: "select",
      defaultValue: "coral",
      options: ["coral", "gold", "teal"],
    },
    {
      name: "activeFrom",
      type: "date",
      admin: { description: "Optional. Leave empty to start showing immediately." },
    },
    {
      name: "activeTo",
      type: "date",
      admin: { description: "Optional — the banner self-expires after this date. No need to remember to remove it." },
    },
  ],
};

export const TrustBandBlock: Block = {
  slug: "trustBand",
  labels: { singular: "Trust Band", plural: "Trust Bands" },
  fields: [],
};

export const ProductGridBlock: Block = {
  slug: "productGrid",
  labels: { singular: "Shop Grid", plural: "Shop Grids" },
  fields: [
    { name: "kicker", type: "text", admin: { description: 'Small label above the heading, e.g. "Shop the collection".' } },
    { name: "heading", type: "text", admin: { description: "Leave either field empty to use the default copy." } },
  ],
};

export const StoryBlock: Block = {
  slug: "story",
  labels: { singular: "My Story", plural: "My Story" },
  fields: [],
};

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Original Artworks Gallery", plural: "Galleries" },
  fields: [],
};

export const ProcessBlock: Block = {
  slug: "process",
  labels: { singular: "How I Make Each Piece", plural: "Process" },
  fields: [
    {
      name: "steps",
      type: "array",
      labels: { singular: "Step", plural: "Steps" },
      minRows: 1,
      defaultValue: [
        {
          title: "You tell me your idea",
          detail:
            "Pick something from the shop, or send me a few words about your dream piece — colours, occasion, the story behind it.",
        },
        {
          title: "I pick the yarn (or paint)",
          detail:
            "I hand-mix shades from my 80-strong cotton library, or stretch a fresh canvas. I'll send you a quick moodboard first.",
        },
        {
          title: "Slowly, by my hands",
          detail:
            "6 to 30 hours of careful loops, or a few weeks at the easel. I'll send WIP photos along the way so you stay close to it.",
        },
        {
          title: "Wrapped & sent by me",
          detail:
            "Pressed, scented, ribbon-tied, and dropped at my local post office. Signed on the back, with a little handwritten note inside.",
        },
      ],
      admin: {
        description: 'Step numbers (01, 02, ...) are generated automatically from the order here — drag to reorder.',
      },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "detail", type: "textarea", required: true },
      ],
    },
  ],
};

export const MoodboardBlock: Block = {
  slug: "moodboard",
  labels: { singular: "Studio Journal", plural: "Studio Journal" },
  fields: [],
};

export const BespokeBlock: Block = {
  slug: "bespoke",
  labels: { singular: "Bespoke", plural: "Bespoke" },
  fields: [],
};

export const TestimonialsBlock: Block = {
  slug: "testimonials",
  labels: { singular: "Testimonials", plural: "Testimonials" },
  fields: [],
};
