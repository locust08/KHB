import "./globals.css";
import Navigation from "./components/site/Navigation";
import Footer from "./components/site/Footer";
import SupportChat from "./components/site/SupportChat";
import ScrollRevealObserver from "./components/site/ScrollRevealObserver";
import { CartProvider } from "./components/site/CartProvider";

export const metadata = {
  title: "Peach Strudel | Kenny Hills Bakers",
  description:
    "A warm, editorial product microsite for Kenny Hills Bakers Peach Strudel, with size guides, storage tips, and a full order flow."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
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
