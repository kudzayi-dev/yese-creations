import type { Access, CollectionConfig } from "payload";

// --- Architecture note (load-bearing) ---------------------------------
// The CMS is the system of record for customer contact/shipping details.
// Stripe's role is strictly payment processing — it never becomes the
// place where a customer's name/address/email lives long-term. The
// storefront's checkout flow (lib/orders.ts) creates an Order here BEFORE
// confirming payment with Stripe (status: "pending"), then the Stripe
// webhook (routes/api.webhooks.stripe.ts) flips it to "paid"/"payment_failed"
// once Stripe's signed event confirms the outcome. Stripe only ever sees
// email (for its own receipt) — never the shipping address.
//
// Access control: Payload's default (when unspecified) already requires an
// authenticated admin user for every operation, so an unauthenticated
// public request is refused by default. But `create` (order placed by an
// anonymous shopper) and the webhook's `update` (marking paid) run from the
// storefront's SERVER — a separate process with no Payload admin session.
// Those two operations are opened ONLY to requests carrying the shared
// CMS_SERVICE_TOKEN secret (never exposed to the browser), checked via a
// custom header. Reading/browsing orders in `/admin` still requires a real
// logged-in admin user; the service token does not grant read/delete.
const isServiceRequest: (req: { headers: Headers }) => boolean = (req) => {
  const token = req.headers.get("x-service-token");
  const expected = process.env["CMS_SERVICE_TOKEN"];
  return Boolean(expected) && token === expected;
};

const readAccess: Access = ({ req }) => Boolean(req.user) || isServiceRequest(req);
const createAccess: Access = ({ req }) => isServiceRequest(req);
const updateAccess: Access = ({ req }) => Boolean(req.user) || isServiceRequest(req);
const deleteAccess: Access = ({ req }) => Boolean(req.user);

export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: readAccess,
    create: createAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  admin: {
    useAsTitle: "stripePaymentIntentId",
    defaultColumns: ["stripePaymentIntentId", "status", "email", "total", "createdAt"],
    description:
      "Customer orders — the CMS is the system of record for contact/shipping details. Stripe only processes payment.",
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending payment", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Payment failed", value: "payment_failed" },
        { label: "Refunded", value: "refunded" },
      ],
      index: true,
    },
    {
      name: "stripePaymentIntentId",
      label: "Stripe PaymentIntent ID",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Join key back to Stripe — the only thing Stripe and the CMS share about this order.",
      },
    },

    // --- Customer contact + shipping (CMS-owned) ---
    { name: "email", type: "email", required: true },
    { name: "firstName", label: "First name", type: "text", required: true },
    { name: "lastName", label: "Last name", type: "text", required: true },
    { name: "phone", label: "Phone", type: "text" },
    { name: "address1", label: "Address line 1", type: "text", required: true },
    { name: "address2", label: "Address line 2", type: "text" },
    { name: "city", label: "City", type: "text", required: true },
    { name: "postcode", label: "Postcode", type: "text", required: true },
    { name: "country", label: "Country", type: "text", required: true },

    // --- Order contents (snapshot at time of purchase, re-priced server-side) ---
    {
      name: "shippingMethod",
      type: "select",
      required: true,
      options: [
        { label: "Standard", value: "standard" },
        { label: "Express", value: "express" },
        { label: "Next day", value: "nextday" },
      ],
    },
    {
      name: "items",
      type: "array",
      required: true,
      labels: { singular: "Line item", plural: "Line items" },
      fields: [
        { name: "productId", label: "Product ID", type: "number", required: true },
        { name: "name", type: "text", required: true },
        { name: "unitPrice", label: "Unit price (£)", type: "number", required: true },
        { name: "qty", label: "Quantity", type: "number", required: true },
        { name: "lineTotal", label: "Line total (£)", type: "number", required: true },
      ],
    },
    { name: "subtotal", label: "Subtotal (£)", type: "number", required: true },
    { name: "shipping", label: "Shipping (£)", type: "number", required: true },
    { name: "total", label: "Total (£)", type: "number", required: true },
  ],
  timestamps: true,
};
