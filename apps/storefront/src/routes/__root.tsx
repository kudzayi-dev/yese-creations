import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import "../styles/tokens.css";
import { CartProvider } from "~/hooks/useCart";
import { AboutOverlayProvider } from "~/hooks/useAboutOverlay";
import { SearchOverlayProvider } from "~/hooks/useSearchOverlay";
import { CartDrawer } from "~/components/CartDrawer";
import { Toast } from "~/components/Toast";
import { AboutOverlay } from "~/components/AboutOverlay";
import { SearchOverlay } from "~/components/SearchOverlay";

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
        // Yeseva One dropped (design tweak — display font is now DM Sans,
        // see tokens.css). DM Sans weight 300 added for the new light-weight
        // heading/name/logo look; existing 400-700 weights stay for body
        // copy, prices/totals (500), and bold UI bits.
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=DM+Sans:wght@300;400;500;600;700&display=swap",
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
          <AboutOverlayProvider>
            <SearchOverlayProvider>
              <Outlet />
              <CartDrawer />
              <Toast />
              <AboutOverlay />
              <SearchOverlay />
            </SearchOverlayProvider>
          </AboutOverlayProvider>
        </CartProvider>
        <Scripts />
      </body>
    </html>
  );
}
