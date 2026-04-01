"use client";

import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Shield,
  ShoppingBag,
  Sparkles,
  Store,
  Truck
} from "lucide-react";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CopyableContact from "../components/site/CopyableContact";
import { formatCurrency, getSizeOptionByKey, sizeOptions } from "../components/site/data";
import { useCart } from "../components/site/CartProvider";

const sizeDescriptions = {
  small: {
    label: "Small - Single Portion",
    perfectFor: "Solo indulgence, coffee breaks, gifting moments"
  },
  medium: {
    label: "Medium - 6x6",
    perfectFor: "Small gatherings, intimate celebrations, dinner parties, gift giving"
  },
  large: {
    label: "Large - 8x8",
    perfectFor: "Birthdays, team events, generous celebrations, gifting"
  }
};

const benefitItems = [
  {
    icon: Clock3,
    title: "Quick Turnaround",
    copy: "Usually ready within 2-4 days of ordering"
  },
  {
    icon: Sparkles,
    title: "Fresh Baked Daily",
    copy: "Baked fresh every day to maintain premium texture"
  },
  {
    icon: Truck,
    title: "Flexible Delivery",
    copy: "Choose your preferred delivery date at checkout"
  },
  {
    icon: Store,
    title: "Free Pickup",
    copy: "Pick up at our Ampang bakery at no extra cost"
  }
];

const includedColumns = [
  [
    "Flaky puff pastry layers",
    "Fresh, juicy peaches",
    "Chilled dessert experience",
    "Careful birthday candle compatibility"
  ],
  [
    "Vanilla whipped cream cheese filling",
    "Beautifully packaged",
    "Perfect for 4-6 people",
    "100% satisfaction guarantee"
  ]
];

const trustItems = ["Secure Payment", "Privacy Protected", "Customer Support", "Satisfaction Guaranteed"];

function BuyNowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sizeKey = searchParams.get("size") ?? "medium";
  const selectedSize = useMemo(() => getSizeOptionByKey(sizeKey), [sizeKey]);
  const sizeContent = sizeDescriptions[selectedSize.key] ?? sizeDescriptions.medium;
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem(selectedSize.key, 1);
    router.push("/cart");
  }

  return (
    <>
      <section className="buy-figma-hero" data-nav-theme="warm">
        <div className="site-container buy-figma-shell">
          <div className="buy-figma-media reveal reveal-left">
            <div className="buy-figma-media-card">
              <img alt={`${selectedSize.display} Peach Strudel`} key={selectedSize.key} src={selectedSize.image} />
            </div>
          </div>

          <div className="buy-figma-panel reveal reveal-right">
            <div className="buy-figma-heading">
              <h1>Complete Your Order</h1>
              <p>You&apos;re just one step away from experiencing pure bliss</p>
            </div>

            <div className="buy-figma-size-block">
              <h2>Select Your Size</h2>
              <div className="buy-figma-size-grid">
                {sizeOptions.map((option) => {
                  const isActive = option.key === selectedSize.key;
                  const optionLabel =
                    option.key === "small" ? option.dimensions : option.dimensions.replace(/["\s]/g, "");

                  return (
                    <Link
                      key={option.key}
                      className={isActive ? "buy-figma-size-card is-active" : "buy-figma-size-card"}
                      href={`/buy-now?size=${option.key}`}
                    >
                      <strong>{option.name}</strong>
                      <span>{optionLabel}</span>
                      <em>{formatCurrency(option.price)}</em>
                      <small>{option.servings}</small>
                      {isActive ? (
                        <span className="buy-figma-size-check" aria-hidden="true">
                          <CheckCircle2 size={18} />
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>

            <article className="buy-figma-summary">
              <div className="buy-figma-summary-head">
                <h3>Peach Strudel</h3>
                <p>
                  Premium handcrafted dessert with vanilla whipped cream cheese and fresh peaches
                </p>
              </div>

              <div className="buy-figma-summary-rows">
                <div className="buy-figma-row">
                  <span>Selected Size</span>
                  <strong>{sizeContent.label}</strong>
                </div>
                <div className="buy-figma-row buy-figma-row-price">
                  <span>Price</span>
                  <strong>{formatCurrency(selectedSize.price)}</strong>
                </div>
                <div className="buy-figma-copy-row">
                  <span>Perfect For:</span>
                  <p>{sizeContent.perfectFor}</p>
                </div>
                <div className="buy-figma-row">
                  <span>Stock Status</span>
                  <strong className="buy-figma-stock">
                    <CheckCircle2 size={16} />
                    In Stock
                  </strong>
                </div>
              </div>

              <div className="buy-figma-note buy-figma-note-warm">
                <Truck size={18} />
                <p>
                  <strong>Delivery or Pickup:</strong> Choose your preferred delivery date at
                  checkout. Pickup available at our Ampang location.
                </p>
              </div>

              <div className="buy-figma-note buy-figma-note-cool">
                <PackageCheck size={18} />
                <p>
                  <strong>Storage Reminder:</strong> Keep refrigerated at 0-4 C. Best consumed
                  within 2 days, can still hold a little longer when covered.
                </p>
              </div>

              <div className="buy-figma-actions">
                <Link className="button button-primary button-icon buy-figma-primary" href={`/checkout?size=${selectedSize.key}`}>
                  <ShoppingBag size={16} />
                  Order Peach Strudel Now
                </Link>
                <button className="button button-outline buy-figma-secondary" onClick={handleAddToCart} type="button">
                  Add to Cart
                </button>
              </div>

              <p className="buy-figma-meta">Usually ready in 2-4 days • Free pickup available</p>
            </article>
          </div>
        </div>
      </section>

      <section className="buy-figma-section buy-figma-section-white" data-nav-theme="light">
        <div className="site-container buy-figma-section-inner">
          <header className="buy-figma-section-header">
            <h2>Why Order From Us?</h2>
            <p>Experience the Kenny Hills Bakers difference.</p>
          </header>

          <div className="buy-figma-benefits">
            {benefitItems.map((item) => (
              <article key={item.title} className="buy-figma-benefit-card reveal">
                <span className="buy-figma-benefit-icon">
                  <item.icon size={18} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="buy-figma-section buy-figma-section-tint" data-nav-theme="warm">
        <div className="site-container">
          <div className="buy-figma-included-card reveal">
            <header className="buy-figma-section-header buy-figma-section-header-compact">
              <h2>What You&apos;re Getting</h2>
            </header>

            <div className="buy-figma-included-grid">
              {includedColumns.map((column, index) => (
                <ul key={`included-${index}`} className="buy-figma-included-list">
                  {column.map((item) => (
                    <li key={item}>
                      <Check size={14} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="buy-figma-section buy-figma-section-white" data-nav-theme="light">
        <div className="site-container">
          <div className="buy-figma-security reveal">
            <span className="buy-figma-shield">
              <Shield size={22} />
            </span>
            <h2>Secure &amp; Trusted Ordering</h2>
            <p>
              Your order is processed securely through our trusted payment system. We respect your
              privacy and protect your information.
            </p>
            <div className="buy-figma-trust-row">
              {trustItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="buy-figma-cta" data-nav-theme="dark">
        <div className="site-container buy-figma-cta-inner reveal">
          <h2>Ready to Indulge?</h2>
          <p>
            Join hundreds of satisfied customers who&apos;ve experienced the magic of our Peach
            Strudel. Order now and taste the difference handcrafted quality makes.
          </p>
          <Link className="button button-light button-icon buy-figma-cta-button" href={`/checkout?size=${selectedSize.key}`}>
            <ShoppingBag size={16} />
            Order Your Peach Strudel
          </Link>
          <span>Starting from RM169.60 • In stock • Ready in 2-4 days</span>
        </div>
      </section>

      <section className="buy-figma-help" data-nav-theme="dark">
        <div className="site-container buy-figma-help-inner">
          <h2>Have Questions?</h2>
          <p>Our team is here to help. Contact us for any inquiries about your order.</p>
          <div className="buy-figma-help-links">
            <CopyableContact href="tel:+60320113090" value="+60 3-2011 3090" />
            <CopyableContact href="mailto:hello@kennyhillsbakers.com" value="hello@kennyhillsbakers.com" />
            <span>Ampang, Kuala Lumpur</span>
          </div>
        </div>
      </section>
    </>
  );
}

export default function BuyNowPage() {
  return (
    <Suspense
      fallback={
        <section className="page-section" data-nav-theme="light">
          <div className="site-container">Loading order options...</div>
        </section>
      }
    >
      <BuyNowContent />
    </Suspense>
  );
}
