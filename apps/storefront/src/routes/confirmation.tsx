import { createFileRoute } from "@tanstack/react-router";
import { Confirmation, type RedirectStatus } from "~/components/Confirmation";

const REDIRECT_STATUSES = ["succeeded", "processing", "requires_payment_method"] as const;

function parseRedirectStatus(value: unknown): RedirectStatus {
  return typeof value === "string" && (REDIRECT_STATUSES as readonly string[]).includes(value)
    ? (value as RedirectStatus)
    : undefined;
}

// /confirmation. Stripe's confirmPayment() redirect_url (set in
// Checkout.tsx) points here; Stripe appends ?redirect_status=... (and
// payment_intent/payment_intent_client_secret, unused here) automatically.
export const Route = createFileRoute("/confirmation")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect_status: parseRedirectStatus(search["redirect_status"]),
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { redirect_status } = Route.useSearch();
  return <Confirmation redirectStatus={redirect_status} />;
}
