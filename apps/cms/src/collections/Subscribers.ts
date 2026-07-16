import type { CollectionConfig } from "payload";
import { createAccess, deleteAccess, readAccess, updateAccess } from "../access/serviceOrAdmin";

// --- Architecture note (load-bearing) ---------------------------------
// One record per email address subscribed to the "stitch club" mailing
// list (Footer.tsx's newsletter signup form — previously a static,
// unwired input with nowhere for the submitted email to go). Same access
// pattern as Customers/Orders, for the same reason: the storefront's
// newsletter signup runs unauthenticated from the CMS's point of view, so
// create needs the shared CMS_SERVICE_TOKEN rather than a login — see
// lib/newsletter.ts.
//
// Deliberately its own collection rather than folded into Customers: a
// newsletter subscriber has not necessarily ever placed an order (no
// name/address/phone to collect), and a customer who's ordered hasn't
// necessarily opted into marketing email — conflating the two would force
// every subscriber through address fields they were never asked for, or
// silently opt every customer into email they didn't request.
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  access: {
    read: readAccess,
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "source", "unsubscribed", "createdAt"],
    description:
      "Stitch club mailing list — one record per subscribed email, submitted from the homepage footer's signup form.",
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Looked up by email on signup \u2014 resubmitting the same address is a no-op, not an error.",
      },
    },
    {
      name: "source",
      type: "text",
      defaultValue: "homepage-footer",
      admin: {
        description: "Where the signup came from \u2014 defaults to the only signup point that exists today.",
      },
    },
    {
      name: "unsubscribed",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Manually flipped by an admin on an unsubscribe request \u2014 no self-service unsubscribe flow exists yet.",
      },
    },
  ],
  timestamps: true,
};
