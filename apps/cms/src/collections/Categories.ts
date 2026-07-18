import type { CollectionConfig } from "payload";

// The shop's product taxonomy, promoted from a compile-time enum
// (@yese/product-data's PRODUCT_CATEGORIES) to a real, editable collection.
// This is the foundational piece the composable-blocks plan depends on: a
// Category Grid block, the Shop-section filter chips, the Footer's "Shop"
// column, and the /feedback + search category chips can now all reference
// this collection instead of a hardcoded list — adding or renaming a
// category is a CMS edit, not a code change + deploy.
//
// Products.cat is a relationship to this collection (see Products.ts).
// Feedback.cat is deliberately NOT migrated yet — it stays a fixed select
// for now (see that file's comment) to keep this change's blast radius
// contained to the Shop-facing surfaces; flagged as a follow-up.
export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "sortOrder"],
    description:
      "The shop's product categories \u2014 drives the Shop filter chips, the footer's Shop column, and the /feedback + search category chips. Add, rename, or reorder here; no deploy needed.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        description: "Auto-generated from the name. Used in filter-chip URLs/state.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === "string" && value.length > 0) return value;
            if (data?.name) {
              return (data.name as string)
                .toLowerCase()
                .replace(/&/g, "and")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            }
            return value;
          },
        ],
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Lower numbers show first in the filter-chip row and the footer's Shop column.",
      },
    },
  ],
};
