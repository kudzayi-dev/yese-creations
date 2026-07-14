import type { Access } from "payload";

// Shared by any collection holding customer PII (Customers, Orders): the
// storefront's server has no Payload admin session, so `create`/`update`
// from checkout need a way in that isn't "log into /admin" — a shared
// secret header, checked here, does that without weakening anything else.
// `read`/`delete` stay on Payload's normal admin-session requirement.
export const isServiceRequest = (req: { headers: Headers }): boolean => {
  const token = req.headers.get("x-service-token");
  const expected = process.env["CMS_SERVICE_TOKEN"];
  return Boolean(expected) && token === expected;
};

export const readAccess: Access = ({ req }) => Boolean(req.user) || isServiceRequest(req);
export const createAccess: Access = ({ req }) => isServiceRequest(req);
export const updateAccess: Access = ({ req }) => Boolean(req.user) || isServiceRequest(req);
export const deleteAccess: Access = ({ req }) => Boolean(req.user);
