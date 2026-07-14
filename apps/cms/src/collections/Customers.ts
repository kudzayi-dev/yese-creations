import type { CollectionConfig } from "payload";
import { createAccess, deleteAccess, readAccess, updateAccess } from "../access/serviceOrAdmin";

// --- Architecture note (load-bearing) ---------------------------------
// A Customer is the shop owner's answer to "who is this person and what's
// their current contact/shipping info" — one record per email address,
// shared across every order that person places. This is deliberately
// separate from Orders' own contact/shipping fields: an Order keeps an
// immutable SNAPSHOT of what was true at the moment it was placed (so a
// past order still shows the address it actually shipped to, even if the
// customer's default address changes later), while a Customer record is
// the current/most-recent picture, kept up to date each time they check
// out — see lib/orders.ts's findOrCreateCustomer().
//
// Same access pattern as Orders, for the same reason: the storefront's
// checkout runs unauthenticated from the CMS's point of view, so
// create/update need the shared CMS_SERVICE_TOKEN rather than a login.
export const Customers: CollectionConfig = {
  slug: "customers",
  access: {
    read: readAccess,
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "firstName", "lastName", "phone", "updatedAt"],
    description:
      "One record per customer, shared across all of their orders. Kept up to date with their most recent contact/shipping details each time they check out — see an individual Order for what was actually shipped to at the time.",
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Looked up by email at checkout — one Customer per email address.",
      },
    },
    { name: "firstName", label: "First name", type: "text", required: true },
    { name: "lastName", label: "Last name", type: "text", required: true },
    { name: "phone", label: "Phone", type: "text" },
    { name: "address1", label: "Address line 1", type: "text", required: true },
    { name: "address2", label: "Address line 2", type: "text" },
    { name: "city", label: "City", type: "text", required: true },
    { name: "postcode", label: "Postcode", type: "text", required: true },
    { name: "country", label: "Country", type: "text", required: true },
  ],
  timestamps: true,
};
