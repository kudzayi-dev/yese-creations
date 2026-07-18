import type { GlobalConfig } from "payload";

// Every link in the footer's "Studio" / "Hello" columns and the bottom legal
// row was previously hardcoded JSX in Footer.tsx, several of them literally
// href="#" placeholders (the social links never actually pointed anywhere).
// Adding or removing a social account, a legal page, or a studio link meant
// a code change + deploy for what is, structurally, just content. This
// global moves all of that into three editable arrays so Theresa can manage
// her own footer from /admin.
//
// Read is public (storefront's server-side loader has no admin session,
// same reasoning as SiteSettings/Products/Media). Only an authenticated
// admin can edit.
//
// defaultValue on each array reproduces the current hardcoded footer
// content exactly, so the first read after this global is added (before
// anyone has touched /admin) renders identically to today — nothing
// regresses on deploy.
export const FooterSettings: GlobalConfig = {
  slug: "footer-settings",
  label: "Footer",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "socialLinks",
      label: "Social links",
      type: "array",
      labels: { singular: "Social link", plural: "Social links" },
      admin: {
        description:
          "Shown in the footer's \"Hello\" column. Add or remove accounts here — no code change needed.",
      },
      defaultValue: [
        { platform: "instagram", url: "https://instagram.com/yese.creations", label: "@yese.creations" },
        { platform: "pinterest", url: "https://pinterest.com/yesecreations", label: "yesecreations" },
        { platform: "tiktok", url: "https://tiktok.com/@yesemakes", label: "yesemakes" },
      ],
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: [
            { label: "Instagram", value: "instagram" },
            { label: "Pinterest", value: "pinterest" },
            { label: "TikTok", value: "tiktok" },
            { label: "Other", value: "other" },
          ],
          admin: {
            description: "\"Other\" shows the label as plain text with no platform icon.",
          },
        },
        { name: "url", type: "text", required: true },
        {
          name: "label",
          type: "text",
          required: true,
          admin: { description: "Displayed handle, e.g. @yese.creations" },
        },
      ],
    },
    {
      name: "studioLinks",
      label: "Studio links",
      type: "array",
      labels: { singular: "Studio link", plural: "Studio links" },
      admin: {
        description:
          "Shown in the footer's \"Studio\" column (Our story, Bespoke, Care guide, etc). Replaces the old code-level page-readiness flags — just add the link here once the page is live.",
      },
      defaultValue: [{ label: "Our story", url: "/about" }],
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "legalLinks",
      label: "Legal / bottom links",
      type: "array",
      labels: { singular: "Legal link", plural: "Legal links" },
      admin: {
        description: "Shown in the thin bottom row of the footer (Shipping, Returns, Privacy, etc).",
      },
      defaultValue: [
        { label: "Shipping", url: "#" },
        { label: "Returns", url: "#" },
        { label: "Privacy", url: "#" },
      ],
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
  ],
};
