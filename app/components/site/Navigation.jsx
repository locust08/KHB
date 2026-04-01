"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "./data";
import { useCart } from "./CartProvider";

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState(pathname === "/" ? "warm" : "light");
  const [activeNavHref, setActiveNavHref] = useState(pathname === "/ingredients" ? "/ingredients" : pathname);
  const { itemCount } = useCart();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const target = document.querySelector(window.location.hash);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  useEffect(() => {
    setActiveNavHref(pathname === "/ingredients" ? "/ingredients" : pathname);
  }, [pathname]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : originalOverflow;

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    let frameId = 0;

    function syncHeaderTheme() {
      frameId = 0;

      const header = document.querySelector(".site-header");
      const headerHeight = header?.getBoundingClientRect().height ?? 86;
      const probeX = Math.round(window.innerWidth / 2);
      const probeY = Math.min(
        window.innerHeight - 1,
        Math.max(0, Math.round(headerHeight + 16))
      );
      const target = document.elementFromPoint(probeX, probeY);
      const themedSection = target?.closest("[data-nav-theme]");
      const faqSection = target?.closest("#faq-answers");
      const nextTheme =
        themedSection?.getAttribute("data-nav-theme") ?? (pathname === "/" ? "warm" : "light");
      const nextActiveNavHref = faqSection
        ? "/ingredients#faq-answers"
        : pathname === "/ingredients"
          ? "/ingredients"
          : pathname;

      setHeaderTheme((current) => (current === nextTheme ? current : nextTheme));
      setActiveNavHref((current) => (current === nextActiveNavHref ? current : nextActiveNavHref));
    }

    function requestThemeSync() {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(syncHeaderTheme);
    }

    requestThemeSync();
    window.addEventListener("scroll", requestThemeSync, { passive: true });
    window.addEventListener("resize", requestThemeSync);

    return () => {
      window.removeEventListener("scroll", requestThemeSync);
      window.removeEventListener("resize", requestThemeSync);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);

  function handleNavLinkClick(event, href) {
    setIsOpen(false);

    if (!href.includes("#")) {
      return;
    }

    const [targetPath, hash] = href.split("#");

    if (pathname !== targetPath) {
      return;
    }

    event.preventDefault();

    const target = document.getElementById(hash);

    if (!target) {
      return;
    }

    window.history.replaceState(null, "", href);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNavHref(href);
  }

  return (
    <>
      <header className={`site-header nav-theme-${headerTheme}`}>
        <div className="site-container site-header-inner">
          <Link className="brand-mark" href="/">
            <img
              alt="Kenny Hills Bakers"
              className="brand-logo"
              src="https://www.kennyhillsbakers.com/cdn/shop/files/KHB_Circular_Logo.png?v=1661227805&width=663"
            />
          </Link>

          <nav className="desktop-nav" aria-label="Primary">
            {navLinks.map((item) => {
              const isActive = activeNavHref === item.href;

              return (
                <Link
                  key={item.href}
                  className={isActive ? "nav-link is-active" : "nav-link"}
                  href={item.href}
                  onClick={(event) => handleNavLinkClick(event, item.href)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="site-header-actions">
            <Link aria-label={`Open cart with ${itemCount} items`} className="nav-cart-link" href="/cart">
              <ShoppingCart size={18} />
              {itemCount > 0 ? <span className="nav-cart-count">{itemCount}</span> : null}
            </Link>
            <Link className="nav-order-link" href="/buy-now?size=medium">
              <span>Order Now</span>
            </Link>
            <button
              aria-expanded={isOpen}
              aria-label="Open navigation"
              className="menu-toggle"
              onClick={() => setIsOpen(true)}
              type="button"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className={isOpen ? "mobile-menu-backdrop is-open" : "mobile-menu-backdrop"}>
        <div className={isOpen ? "mobile-menu is-open" : "mobile-menu"}>
          <div className="mobile-menu-top">
            <span className="eyebrow">Navigate</span>
            <button
              aria-label="Close navigation"
              className="menu-close"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="mobile-nav" aria-label="Mobile">
            {navLinks.map((item) => {
              const isActive = activeNavHref === item.href;

              return (
                <Link
                  key={item.href}
                  className={isActive ? "mobile-nav-link is-active" : "mobile-nav-link"}
                  href={item.href}
                  onClick={(event) => handleNavLinkClick(event, item.href)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link className="mobile-cart-link" href="/cart">
            <ShoppingCart size={18} />
            <span>Cart{itemCount > 0 ? ` (${itemCount})` : ""}</span>
          </Link>
          <Link className="button button-primary mobile-order-button" href="/buy-now?size=medium">
            <ShoppingBag size={16} />
            Order Peach Strudel
          </Link>
        </div>
      </div>
    </>
  );
}
