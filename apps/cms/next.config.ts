import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Payload runs its own server-side work; keep defaults minimal for now.
};

export default withPayload(nextConfig);
