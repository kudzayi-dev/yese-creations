import { createFileRoute } from "@tanstack/react-router";
import { Checkout } from "~/components/Checkout";

// component reads the cart client-side the same way CartDrawer does.
export const Route = createFileRoute("/checkout")({
  component: Checkout,
});
