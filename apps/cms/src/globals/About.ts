import type { GlobalConfig } from "payload";

// Theresa's bio/"My Story" content — rendered by three consumers that must
// never drift apart (Story.tsx on the homepage, the standalone /about
// route, and the AboutOverlay fast-view): apps/storefront/src/components/
// Story/AboutContent.tsx reads this global and feeds all three.
//
// Deliberately plain text fields (paragraphs array + a couple of text
// fields), not rich text \u2014 matches the existing convention already used
// for Products.story/care (also plain textarea, not lexical). Avoids
// pulling lexical-parsing dependencies into the storefront for the first
// time just for this. The one thing that stays in code is the H2 headline
// itself (styles.one's inline script-font "one" accent word) \u2014 a brand
// flourish with bespoke inline styling, not prose content, same reasoning
// already applied to Hero's headline.
//
// Read is public (storefront's server-side loaders have no admin session,
// same reasoning as every other public-read global/collection). Only an
// authenticated admin can edit.
export const About: GlobalConfig = {
  slug: "about",
  label: "About / My Story",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    description:
      "Theresa's bio, shown on the homepage's \"My Story\" section, the standalone /about page, and the fast in-app overlay \u2014 all three read from here, so nothing can drift out of sync.",
  },
  fields: [
    {
      name: "kicker",
      type: "text",
      defaultValue: "My Story",
      admin: { description: 'Small label above the heading, e.g. "My Story".' },
    },
    {
      name: "heading",
      type: "text",
      defaultValue: "One woman, *one* very colourful studio.",
      admin: {
        description: 'Use *word* for the coral script-accent style (matches the current "one" treatment).',
      },
    },
    {
      name: "paragraphs",
      label: "Bio paragraphs",
      type: "array",
      labels: { singular: "Paragraph", plural: "Paragraphs" },
      minRows: 1,
      defaultValue: [
        {
          text:
            "I'm Theresa \u2014 a freehand crochet artist and maker behind Yese Creations. There's no pattern, no machine, just yarn, paint, and a lot of patience: every piece starts as an idea and gets worked out stitch by stitch until it feels right.",
        },
        {
          text:
            "What began with cozy hats and decorative garlands has grown into a full little studio of handmade treasures \u2014 amigurumi dolls, plushies, painted prints, and home pieces, alongside the crochet you'll still find at the heart of it. Nothing here is mass-produced. Each item is made one at a time, which means small variations, real texture, and the kind of detail you only get from something made by hand rather than a machine.",
        },
        {
          text:
            "Whether you're after a gift that feels personal or something to make your own space a little warmer, I hope you find a piece that feels like it was made for you \u2014 because in a way, it was. Every order is wrapped, signed & posted by me.",
        },
      ],
      fields: [{ name: "text", type: "textarea", required: true }],
    },
    {
      name: "signatureName",
      type: "text",
      defaultValue: "Yese",
    },
    {
      name: "signatureSubtitle",
      type: "text",
      defaultValue: "\u2014 maker, painter & resident tea-drinker",
    },
    {
      name: "marginNote",
      type: "textarea",
      defaultValue: 'this is the only "team page"\nyou\'ll find on the site!',
      admin: {
        description: "The small handwritten-style note next to the photos. Use a line break for a two-line note.",
      },
    },
  ],
};
