import type { GlobalConfig } from "payload";

// DRAFT CONTENT, not legal advice. This is grounded in what the codebase
// actually does (Stripe processes payment, the CMS stores order/customer
// data, cart/wishlist use localStorage, no analytics/tracking exist
// anywhere in this app) but was written by an AI assistant, not a
// solicitor. Theresa (or a real legal/professional adviser) needs to
// review and confirm every section \u2014 especially the bracketed
// [CONFIRM: ...] placeholders \u2014 before this is relied on for a live site
// taking real payments from real customers.
//
// Modelled as sections (heading + body) rather than rich text, matching
// the same plain-text-fields convention as the About global \u2014 avoids
// introducing lexical\u2192HTML conversion into the storefront for the first
// time just for this, while still giving each page real internal
// structure (unlike a single wall-of-text field).
export const LegalPages: GlobalConfig = {
  slug: "legal-pages",
  label: "Legal Pages",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    description:
      "DRAFT content, not legal advice \u2014 written to accurately describe what this site actually does, but not reviewed by a solicitor. Please read through both pages and fill in every [CONFIRM: ...] placeholder (your contact details, data-retention period, business details) before relying on this for a live site.",
  },
  fields: [
    {
      name: "privacy",
      type: "group",
      label: "Privacy Policy",
      fields: [
        {
          name: "lastUpdated",
          type: "date",
          admin: { description: "Update this whenever you change the wording below." },
        },
        {
          name: "sections",
          type: "array",
          labels: { singular: "Section", plural: "Sections" },
          minRows: 1,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "body", type: "textarea", required: true },
          ],
          defaultValue: [
            {
              heading: "Who we are",
              body:
                "Yese Creations is an independent, one-person handmade goods studio based in the UK. [CONFIRM: add your registered business name/number here if you have one, and a contact email or address for data-protection enquiries.]",
            },
            {
              heading: "What information we collect",
              body:
                "When you place an order, we collect your name, email address, delivery address, and (if you provide it) phone number. If you sign up to our newsletter, we collect your email address. We don't collect anything beyond what's needed to fulfil your order, respond to you, or send the newsletter you signed up for.",
            },
            {
              heading: "How we use your information",
              body:
                "We use your details to process and fulfil your order, to contact you about it if we need to, and to send you our newsletter if you've signed up for it. We don't sell or share your information with anyone for marketing purposes.",
            },
            {
              heading: "Payment",
              body:
                "Payments are handled entirely by Stripe, a regulated payment processor. We never see or store your full card details \u2014 they go directly to Stripe. Stripe may set a small number of its own cookies during checkout for fraud prevention.",
            },
            {
              heading: "Cookies and similar technology",
              body:
                "We don't use analytics, advertising, or tracking cookies of any kind. Your shopping basket and wishlist are remembered using your browser's local storage \u2014 this stays on your own device and is never sent to us. During checkout, Stripe (see above) may set its own cookies for fraud prevention.",
            },
            {
              heading: "How long we keep your information",
              body:
                "[CONFIRM: how long do you keep order/customer records? A common approach is to keep them for as long as needed for accounting/tax purposes (in the UK, typically 6 years), then delete them. Newsletter subscriber emails are typically kept until someone unsubscribes.]",
            },
            {
              heading: "Your rights",
              body:
                "You can ask us at any time what information we hold about you, ask us to correct it, or ask us to delete it (subject to anything we're legally required to keep, e.g. for tax records). To do this, contact us at [CONFIRM: add a real contact email address].",
            },
            {
              heading: "Changes to this policy",
              body: "We may update this policy from time to time. The date at the top shows when it was last changed.",
            },
          ],
        },
      ],
    },
    {
      name: "terms",
      type: "group",
      label: "Terms & Conditions",
      fields: [
        {
          name: "lastUpdated",
          type: "date",
          admin: { description: "Update this whenever you change the wording below." },
        },
        {
          name: "sections",
          type: "array",
          labels: { singular: "Section", plural: "Sections" },
          minRows: 1,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "body", type: "textarea", required: true },
          ],
          defaultValue: [
            {
              heading: "About these terms",
              body:
                "These terms apply whenever you order something from Yese Creations. By placing an order, you're agreeing to them.",
            },
            {
              heading: "Our products",
              body:
                "Everything is handmade by one person, to order in many cases \u2014 so small variations in colour, size, and shape between items (and between the photos and what arrives) are normal, not a fault. Product photos are as accurate as we can make them, but yarn dye lots and paint batches vary slightly over time.",
            },
            {
              heading: "Bespoke and custom orders",
              body:
                "Anything made to your own specification (custom colours, sizes, wording, or a one-off commission) is a bespoke order. [CONFIRM WITH A SOLICITOR: under UK consumer law, made-to-order/personalised goods are often exempt from the standard 14-day right to cancel that applies to off-the-shelf items \u2014 please confirm the exact wording and whether/how you want to apply this before publishing, since getting this wrong either over- or under-promises customers' rights.]",
            },
            {
              heading: "Prices and payment",
              body:
                "All prices are shown in GBP (\u00a3) and include VAT where applicable. Payment is taken in full at checkout via Stripe before your order is made or dispatched.",
            },
            {
              heading: "Shipping",
              body:
                "We currently ship within the UK only. Standard shipping is free on orders over \u00a380; below that, and for express/next-day options, the cost is shown at checkout before you pay. [CONFIRM: add typical dispatch/delivery timeframes, especially for made-to-order items which take longer than in-stock ones.]",
            },
            {
              heading: "Returns and cancellations",
              body:
                "Ready-made items can be returned within 14 days of delivery for a refund, provided they're unused and in their original condition \u2014 see \"Bespoke and custom orders\" above for how this differs for made-to-order/personalised pieces. To start a return, contact us at [CONFIRM: add a real contact email address].",
            },
            {
              heading: "If something arrives faulty or damaged",
              body:
                "If your order arrives faulty, damaged, or not as described, contact us as soon as possible at [CONFIRM: add a real contact email address] with a photo where possible, and we'll sort out a replacement or refund. This is separate from \u2014 and doesn't affect \u2014 your standard consumer rights.",
            },
            {
              heading: "Our liability",
              body:
                "[CONFIRM WITH A SOLICITOR: a standard liability-limitation clause for a small handmade-goods business typically goes here \u2014 e.g. limiting liability to the order value, excluding indirect losses, while never excluding liability for death/personal injury caused by negligence or for fraud, which can't legally be excluded. Don't publish generic boilerplate here without having it checked.]",
            },
            {
              heading: "Governing law",
              body:
                "These terms are governed by the law of England and Wales. [CONFIRM this is correct for your actual business registration/location.]",
            },
          ],
        },
      ],
    },
  ],
};
