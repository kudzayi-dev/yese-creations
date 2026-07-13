import path from "path";
import { fileURLToPath } from "url";

import type { CollectionConfig } from "payload";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Uploads live on local disk (see .plan/stages/04-cms-media.md — decision 1).
// staticDir resolves to apps/cms/media, which is gitignored.
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Product images are public by definition — the storefront renders them unauthenticated.
    read: () => true,
  },
  admin: {
    useAsTitle: "alt",
  },
  upload: {
    staticDir: path.resolve(dirname, "../../media"),
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"],
    // Display contexts from the design handoff: 84px thumb (2x = 168), ~600px card,
    // ~1000px detail stage. `contain` on the thumb avoids hard-cropping transparent logos.
    imageSizes: [
      { name: "thumb", width: 168, height: 168, position: "centre", fit: "contain" },
      { name: "card", width: 600, height: 600, position: "centre", fit: "cover" },
      { name: "stage", width: 1000, height: 1000, position: "centre", fit: "cover" },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description:
          "Describes the image for screen readers and og:image context. Keep it meaningful — it feeds the PDP SEO markup.",
      },
    },
  ],
};
