import { createFileRoute } from "@tanstack/react-router";
import { Checkout } from "~/components/Checkout";

// Stage 17 — /checkout. Cart-driven (Stage 14's shared localStorage cart via
// useCart()), so this route has no loader of its own — the Checkout
// component reads the cart client-side the same way CartDrawer does.
export const Route = createFileRoute("/checkout")({
  component: Checkout,
});
