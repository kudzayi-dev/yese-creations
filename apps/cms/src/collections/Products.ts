import {
  MOTIFS,
  PALETTE_MAX,
  PALETTE_MIN,
  productSlug,
} from "@yese/product-data";
import type { CollectionConfig } from "payload";

// motif enum options are DERIVED from the @yese/product-data runtime array
// rather than hand-copied, so the CMS select field and the shared TS union
// cannot drift.
const motifOptions = MOTIFS.map((m) => ({ label: m, value: m }));

// Tag: the shared union includes "" for "no tag". Payload models that as simply
// not selecting a value, so we omit "" from the options and treat null as "".
const tagOptions = (["bestseller", "new", "limited", "popular"] as const).map((t) => ({
  label: t,
  value: t,
}));

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    // Storefront reads products unauthenticated (SSR/SSG + client fetches).
    read: () => true,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "cat", "price", "tag", "slug"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description:
          "Auto-generated from the name. Powers the PDP URL — changing it breaks existing links.",
      },
      hooks: {
        // Uses productSlug() from @yese/product-data — the SAME rule the storefront
        // uses to build /product/<slug>, so URLs can't drift from the prototype.
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === "string" && value.length > 0) return value;
            if (data?.name) return productSlug({ name: data.name as string });
            return value;
          },
        ],
      },
    },
    {
      name: "cat",
      label: "Category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
      required: true,
      index: true,
      admin: {
        description: "Add or rename categories in the Categories collection — no code change needed.",
      },
    },
    {
      name: "price",
      label: "Price (£)",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description: "Enter the price in pounds. e.g. 24.99 for £24.99. Stored as pence internally for Stripe.",
        step: 0.01,
      },
      hooks: {
        // User enters pounds (e.g. 24.99) → stored as pence (2499)
        beforeValidate: [({ value }) => (typeof value === "number" ? Math.round(value * 100) : value)],
        // Stored pence → show pounds when editing
        afterRead: [({ value }) => (typeof value === "number" ? value / 100 : value)],
      },
    },
    {
      name: "meta",
      label: "Short description",
      type: "text",
      required: true,
      admin: {
        description:
          'One line shown under the product name on cards — material, size, or a key detail. e.g. "Hand-crocheted cotton, approx 28cm".',
      },
    },
    {
      name: "tag",
      label: "Badge",
      type: "select",
      options: tagOptions,
      admin: {
        position: "sidebar",
        description: "Optional label shown on the product card. Leave empty for no badge.",
      },
    },

    // --- Placeholder art (used when a product has no real photos) ---
    {
      name: "palette",
      label: "Colour theme",
      type: "number",
      required: true,
      defaultValue: 0,
      min: PALETTE_MIN,
      max: PALETTE_MAX,
      admin: {
        description: `Colour theme for the placeholder image when no real photo is uploaded (0–${PALETTE_MAX}). Each number maps to a different brand gradient.`,
      },
    },
    {
      name: "motif",
      label: "Placeholder icon",
      type: "select",
      required: true,
      options: motifOptions,
      admin: {
        description:
          "The little icon shown in the placeholder image before real photos are added.",
      },
    },

    // --- Photos ---
    {
      name: "photos",
      label: "Product photos",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      admin: {
        description:
          "Upload real product photos here. The first one is used on the grid card. If empty, a generated placeholder is shown instead.",
      },
    },

    // --- Detail copy (folded in from PRODUCT_DETAILS; every product has a detail) ---
    {
      name: "story",
      label: "Product story",
      type: "textarea",
      admin: {
        description:
          "The main description shown on the product page. If left empty, a generic description is generated from the short description.",
      },
    },
    {
      name: "specs",
      label: "Details",
      type: "array",
      labels: { singular: "Detail", plural: "Details" },
      fields: [
        {
          name: "spec",
          label: "Detail",
          type: "text",
          required: true,
        },
      ],
      admin: {
        description: 'Bullet points shown under "The details" on the product page. e.g. "100% cotton yarn", "Approx 28cm tall".',
      },
    },
    {
      name: "care",
      label: "Care instructions",
      type: "textarea",
      admin: {
        description:
          'Shown under "Looking after it". e.g. "Spot clean only with a damp cloth."',
      },
    },
    {
      name: "madeIn",
      label: "How it\u2019s made",
      type: "text",
      admin: {
        description:
          'Shown in the coral line above the product name. e.g. "6–8 hours by hand", "an original, 1 of 1".',
      },
    },

    // --- SEO (PDP requirement) ---
    {
      name: "metaTitle",
      label: "Page title (SEO)",
      type: "text",
      admin: {
        position: "sidebar",
        description: "Tab/search title for the product page. Falls back to the product name.",
      },
    },
    {
      name: "metaDescription",
      label: "Search description (SEO)",
      type: "textarea",
      admin: {
        position: "sidebar",
        description: "Shown in Google search results. Falls back to the product story if empty.",
      },
    },
  ],
};
