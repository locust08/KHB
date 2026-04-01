import "./globals.css";
import Navigation from "./components/site/Navigation";
import Footer from "./components/site/Footer";
import SupportChat from "./components/site/SupportChat";
import ScrollRevealObserver from "./components/site/ScrollRevealObserver";
import AttributionTracker from "./components/site/AttributionTracker";
import TrackingScripts from "./components/site/TrackingScripts";
import { CartProvider } from "./components/site/CartProvider";
import { getPublicSiteUrl } from "@/src/lib/utils/env";

const siteUrl = getPublicSiteUrl();

export const metadata = {
  title: "Peach Strudel | Kenny Hills Bakers",
  description:
    "A warm, editorial product microsite for Kenny Hills Bakers Peach Strudel, with size guides, storage tips, and a full order flow.",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <TrackingScripts />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <AttributionTracker />
          <ScrollRevealObserver />
          <div className="site-shell">
            <Navigation />
            <main className="site-main">{children}</main>
            <Footer />
            <SupportChat />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
