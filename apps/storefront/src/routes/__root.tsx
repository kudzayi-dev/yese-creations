import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import "../styles/tokens.css";
import { CartProvider } from "~/hooks/useCart";
import { CartDrawer } from "~/components/CartDrawer";
import { Toast } from "~/components/Toast";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      // Google Fonts — preconnect for performance, then the actual stylesheet
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Yeseva+One&family=Caveat:wght@500;700&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument({ children }: { children?: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <CartProvider>
          <Outlet />
          <CartDrawer />
          <Toast />
        </CartProvider>
        <Scripts />
      </body>
    </html>
  );
}
