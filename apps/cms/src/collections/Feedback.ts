import { PRODUCT_CATEGORIES } from "@yese/product-data";
import type { CollectionConfig } from "payload";

// Derived from the shared runtime array (same pattern as Products.ts's
// categoryOptions) so this select can't drift from the real product
// taxonomy. NOTE: the reviews design mockup used a stale category set
// (Bouquets/Home/Plushies/Bags/Accessories/Prints) — the real, current
// taxonomy is Bouquets/Art/Soft Toys/Accessories/Hats/Prints. Use the real
// one when assigning cat to feedback entries.
const categoryOptions = PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c }));

// Customer feedback / testimonials shown on the homepage (curated highlights)
// and the standalone /feedback page (the full list). Two intended sources of
// entries, distinguished by `source`:
//   - "ebay"  — real feedback migrated from the yesecreations eBay store.
//               eBay only exposes a masked buyer handle (e.g. "j***n"), never
//               a real name, so `buyerHandle` is what renders in the identity
//               slot instead of `customerName` for these.
//   - "app"   — future reviews left directly on this site by a named
//               customer. These use `customerName` in the identity slot.
// The Reviews card component picks its layout (named vs. verified-purchase
// badge + masked handle) based on `source`, not on whether name happens to
// be filled in — see design discussion: this keeps the two card styles
// looking like deliberate variants rather than one style with "missing"
// data.
export const Feedback: CollectionConfig = {
  slug: "feedback",
  access: {
    // Storefront reads feedback unauthenticated, same as Products.
    read: () => true,
  },
  admin: {
    useAsTitle: "quote",
    defaultColumns: ["quote", "source", "cat", "productName", "rating", "featured"],
    description:
      "Customer testimonials. 2-3 marked \"Featured\" show on the homepage; everything shows on /feedback.",
  },
  fields: [
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "ebay",
      options: [
        { label: "eBay (sourced)", value: "ebay" },
        { label: "App (named review)", value: "app" },
      ],
      admin: {
        description:
          "Controls which card style renders: eBay shows a masked handle + verified-purchase badge, App shows a real name.",
      },
    },
    {
      name: "quote",
      type: "textarea",
      required: true,
    },
    {
      name: "rating",
      type: "number",
      required: true,
      defaultValue: 5,
      min: 1,
      max: 5,
      admin: {
        description:
          "eBay doesn't expose a per-review star rating on the public feedback profile (only an overall positive %) — default to 5 for sourced entries, all of which were left as positive/Verified purchase feedback.",
      },
    },
    {
      name: "productName",
      label: "Product",
      type: "text",
      required: true,
      admin: {
        description: "Free-text product name as it appeared on eBay, or the product this review is about.",
      },
    },
    {
      name: "cat",
      label: "Category",
      type: "select",
      required: true,
      options: categoryOptions,
      index: true,
      admin: {
        description: "Which shop category this review is about — powers the /feedback category filter.",
      },
    },
    {
      name: "buyerHandle",
      label: "Buyer handle (eBay)",
      type: "text",
      admin: {
        description:
          "Masked eBay buyer ID, e.g. \"j***n\" — exactly as shown on the public feedback profile. Only used when source is eBay.",
        condition: (data) => data?.source === "ebay",
      },
    },
    {
      name: "customerName",
      label: "Customer name (App)",
      type: "text",
      admin: {
        description: "Real name, shown for in-app named reviews only.",
        condition: (data) => data?.source === "app",
      },
    },
    {
      name: "verified",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Shows the \"Verified purchase\" badge. True for all sourced eBay feedback.",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Show this one on the homepage highlight row (keep this to 2-3 entries).",
      },
    },
  ],
};
