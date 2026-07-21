import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output traces only the deps actually used at runtime into
  // .next/standalone — the difference between a lean Docker image and
  // shipping the whole monorepo's node_modules tree. See apps/cms/Dockerfile.
  output: "standalone",
  // sharp is a native addon (payload.config.ts imports it directly for
  // image processing). Confirmed via a real Docker build+run that
  // Turbopack's file-tracing for standalone output copies sharp's .node
  // binary but silently drops a co-located shared library it dlopen()s at
  // runtime (libvips-cpp.so) — a known Next.js standalone + native-addon
  // gotcha. Marking it external means Next leaves a plain runtime
  // require("sharp") in the bundle instead of tracing/bundling it, so it
  // resolves against whatever's actually installed in node_modules at
  // container-run time (see apps/cms/Dockerfile's explicit `npm install
  // sharp` step in the runtime stage) rather than a broken traced copy.
  serverExternalPackages: ["sharp"],
};

export default withPayload(nextConfig);
