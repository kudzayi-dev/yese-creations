/**
 * newsletter.ts — "stitch club" mailing list signup (Footer.tsx).
 *
 * Same architecture as lib/orders.ts's findOrCreateCustomer: the storefront
 * server has no Payload admin session, so writes to the CMS's `subscribers`
 * collection go over HTTP with the shared CMS_SERVICE_TOKEN as the
 * `x-service-token` header (see apps/cms/src/collections/Subscribers.ts's
 * access control). Look-up-then-create rather than a bare POST so
 * resubmitting an already-subscribed email is a friendly no-op instead of
 * a raw "Value must be unique" validation error bubbling to the visitor.
 */
import { createServerFn } from "@tanstack/react-start";

function cmsUrl(): string {
  const url = process.env["CMS_URL"];
  if (!url) throw new Error("CMS_URL is not set (server env only)");
  return url;
}

function serviceToken(): string {
  const token = process.env["CMS_SERVICE_TOKEN"];
  if (!token) throw new Error("CMS_SERVICE_TOKEN is not set (server env only)");
  return token;
}

export interface SubscribeResult {
  alreadySubscribed: boolean;
}

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }): Promise<SubscribeResult> => {
    const email = data.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      throw new Error("Enter a valid email address.");
    }

    const findRes = await fetch(
      `${cmsUrl()}/api/subscribers?where[email][equals]=${encodeURIComponent(email)}&limit=1`,
      { headers: { "x-service-token": serviceToken() } },
    );
    if (!findRes.ok) {
      const body = await findRes.text().catch(() => "");
      throw new Error(`Failed to look up subscriber in CMS (${findRes.status}): ${body}`);
    }
    const found = (await findRes.json()) as { docs: unknown[] };
    if (found.docs.length > 0) {
      return { alreadySubscribed: true };
    }

    const createRes = await fetch(`${cmsUrl()}/api/subscribers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-service-token": serviceToken(),
      },
      body: JSON.stringify({ email, source: "homepage-footer" }),
    });
    if (!createRes.ok) {
      const body = await createRes.text().catch(() => "");
      throw new Error(`Failed to create subscriber in CMS (${createRes.status}): ${body}`);
    }

    return { alreadySubscribed: false };
  });
