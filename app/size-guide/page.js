"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cake,
  Coffee,
  Gift,
  ShoppingBag,
  Sparkles,
  User,
  Users
} from "lucide-react";
import { formatCurrency, sizeOptions } from "../components/site/data";

const recommendationCards = [
  {
    group: "everyday",
    icon: User,
    occasion: "Personal Treat",
    recommendation: "Single",
    copy: "Quick solo dessert."
  },
  {
    group: "hosting",
    icon: Users,
    occasion: "Family Dinner",
    recommendation: "6x6",
    copy: "Easy sharing size."
  },
  {
    group: "celebration",
    icon: Cake,
    occasion: "Birthday Table",
    recommendation: "8x8",
    copy: "Best for bigger groups."
  },
  {
    group: "celebration",
    icon: Gift,
    occasion: "Elegant Gifting",
    recommendation: "6x6",
    copy: "Polished gift pick."
  },
  {
    group: "everyday",
    icon: Coffee,
    occasion: "Coffee Gathering",
    recommendation: "Single or 6x6",
    copy: "Flexible for small catchups."
  },
  {
    group: "hosting",
    icon: Sparkles,
    occasion: "Office Celebration",
    recommendation: "8x8",
    copy: "Made for the whole team."
  }
];

const recommendationGroups = [
  {
    key: "everyday",
    label: "Everyday Moments",
    description: "For solo cravings and casual coffee-time orders."
  },
  {
    key: "hosting",
    label: "Hosting & Sharing",
    description: "For family dinners, office tables, and easy group serving."
  },
  {
    key: "celebration",
    label: "Celebrations & Gifts",
    description: "For birthdays, gifting, and statement dessert moments."
  }
];

const pricingSectionContent = {
  small: {
    title: "Single",
    eyebrow: "Personal Treat",
    bestFor: "Solo indulgence, first-time tasting, and small dessert cravings.",
    chips: ["Single Portion", "~150g"],
    checklist: [
      "Perfect for one person",
      "Great for sampling",
      "Easy to enjoy anytime"
    ],
    buttonLabel: "Choose Single"
  },
  medium: {
    title: "6x6",
    eyebrow: "Gathering Size",
    bestFor: "Small gatherings, intimate celebrations, and gifting.",
    chips: ['6" x 6"', "~1kg"],
    checklist: [
      "Perfect for small families",
      "Ideal for dinner parties",
      "Great for gift giving"
    ],
    buttonLabel: "Choose 6x6"
  },
  large: {
    title: "8x8",
    eyebrow: "Celebration Centerpiece",
    bestFor: "Birthdays, parties, and larger celebrations.",
    chips: ['8" x 8"', "~1.8kg"],
    checklist: [
      "Feeds a crowd",
      "Best value per serving",
      "Ideal centerpiece"
    ],
    buttonLabel: "Choose 8x8"
  }
};

export default function SizeGuidePage() {
  const [activeRecommendationGroup, setActiveRecommendationGroup] = useState(
    recommendationGroups[0].key
  );
  const [activePricingIndex, setActivePricingIndex] = useState(0);
  const pricingCarouselRef = useRef(null);
  const visibleRecommendationCards = useMemo(
    () => recommendationCards.filter((item) => item.group === activeRecommendationGroup),
    [activeRecommendationGroup]
  );
  const activeRecommendationMeta = useMemo(
    () =>
      recommendationGroups.find((group) => group.key === activeRecommendationGroup) ??
      recommendationGroups[0],
    [activeRecommendationGroup]
  );

  useEffect(() => {
    const carousel = pricingCarouselRef.current;

    if (!carousel) {
      return undefined;
    }

    const updateActivePricingIndex = () => {
      const cards = Array.from(carousel.children);

      if (!cards.length) {
        return;
      }

      const currentIndex = cards.reduce(
        (closestIndex, card, index, allCards) => {
          const currentDistance = Math.abs(card.offsetLeft - carousel.scrollLeft);
          const closestDistance = Math.abs(allCards[closestIndex].offsetLeft - carousel.scrollLeft);

          return currentDistance < closestDistance ? index : closestIndex;
        },
        0
      );

      setActivePricingIndex(currentIndex);
    };

    updateActivePricingIndex();
    carousel.addEventListener("scroll", updateActivePricingIndex, { passive: true });
    window.addEventListener("resize", updateActivePricingIndex);

    return () => {
      carousel.removeEventListener("scroll", updateActivePricingIndex);
      window.removeEventListener("resize", updateActivePricingIndex);
    };
  }, []);

  function scrollToPricingOption(index) {
    const carousel = pricingCarouselRef.current;
    const card = carousel?.children?.[index];

    if (!carousel || !card) {
      return;
    }

    carousel.scrollTo({
      left: card.offsetLeft,
      behavior: "smooth"
    });
  }

  return (
    <>
      <section className="page-hero" data-nav-theme="warm">
        <div className="site-container page-hero-inner">
          <span className="eyebrow">Size & Order Guide</span>
          <h1>Size & Order Guide</h1>
          <p>Choose the format that feels right for the occasion, the table, and the way you want it to land.</p>
        </div>
      </section>

      <section className="page-section surface-white" data-nav-theme="light">
        <div className="site-container">
          <div className="pricing-compare reveal">
            <div className="pricing-compare-copy">
              <span className="pricing-compare-kicker">Size Selection</span>
              <h2>Choose Your Perfect Peach Strudel Size</h2>
              <p>From a personal treat to a full celebration centerpiece.</p>
              <div className="pricing-swipe-hint" aria-hidden="true">
                <span>Swipe to explore sizes</span>
              </div>
            </div>

            <div ref={pricingCarouselRef} className="pricing-compare-grid">
              {sizeOptions.map((item) => {
                const cardContent = pricingSectionContent[item.key];
                const isFeatured = item.key === "medium";
                const cardClassName = [
                  "pricing-card",
                  `pricing-card-${item.key}`,
                  isFeatured ? "is-featured" : ""
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <article key={item.key} className={cardClassName}>
                    <div className="pricing-card-media-shell">
                      <div className="pricing-card-halo" aria-hidden="true" />
                      <div className="pricing-card-media">
                        <img alt={`${item.display} Peach Strudel`} src={item.image} />
                      </div>
                    </div>

                    <div className="pricing-card-surface">
                      <div className="pricing-card-topline">
                        <span>{cardContent.eyebrow}</span>
                        {isFeatured ? (
                          <span className="pricing-card-spark">
                            <Sparkles size={14} />
                          </span>
                        ) : null}
                      </div>

                      <div className="pricing-card-head">
                        <h3>{cardContent.title}</h3>
                        <strong>{formatCurrency(item.price)}</strong>
                        <span>{item.servings}</span>
                      </div>

                      <div className="pricing-card-chip-row">
                        {cardContent.chips.map((chip) => (
                          <span key={chip} className="pricing-card-chip">
                            {chip}
                          </span>
                        ))}
                      </div>

                      <p className="pricing-card-best-for">
                        <strong>Best for</strong>
                        <span>{cardContent.bestFor}</span>
                      </p>

                      <ul className="pricing-card-list">
                        {cardContent.checklist.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>

                      <Link
                        className={isFeatured ? "pricing-card-button is-filled" : "pricing-card-button"}
                        href={`/checkout?size=${item.key}`}
                      >
                        {cardContent.buttonLabel}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="pricing-carousel-dots" aria-label="Available size options">
              {sizeOptions.map((item, index) => (
                <button
                  key={item.key}
                  aria-label={`Show ${pricingSectionContent[item.key].title} option`}
                  className={
                    index === activePricingIndex
                      ? "pricing-carousel-dot is-active"
                      : "pricing-carousel-dot"
                  }
                  onClick={() => scrollToPricingOption(index)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section surface-gradient" data-nav-theme="warm">
        <div className="site-container">
          <div className="section-header reveal">
            <span className="eyebrow">Recommended by Occasion</span>
            <h2>Recommended by Occasion</h2>
            <p>Choose a moment category, then see the size suggestions that fit it best.</p>
          </div>

          <div className="size-fit-board reveal">
            <div className="recommend-filter-bar" role="tablist" aria-label="Occasion groups">
              {recommendationGroups.map((group) => (
                <button
                  key={group.key}
                  aria-selected={group.key === activeRecommendationGroup}
                  className={
                    group.key === activeRecommendationGroup
                      ? "recommend-filter-button is-active"
                      : "recommend-filter-button"
                  }
                  onClick={() => setActiveRecommendationGroup(group.key)}
                  role="tab"
                  type="button"
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="recommend-filter-copy">
              <span className="recommend-filter-kicker">{activeRecommendationMeta.label}</span>
              <p>{activeRecommendationMeta.description}</p>
            </div>

            <div className="size-fit-grid">
              {visibleRecommendationCards.map((item) => (
                <article key={item.occasion} className="recommend-card recommend-card-modern">
                  <div className="recommend-icon">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h3>{item.occasion}</h3>
                    <span className="recommend-badge">{item.recommendation}</span>
                    <p>{item.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band" data-nav-theme="dark">
        <div className="site-container cta-band-inner">
          <div>
            <span className="eyebrow eyebrow-light">Found Your Perfect Size?</span>
            <h2>Found Your Perfect Size?</h2>
            <p>Order now and we&apos;ll have your Peach Strudel prepared fresh for your chosen date.</p>
          </div>
          <Link className="button button-light button-icon" href="/buy-now?size=medium">
            <ShoppingBag size={16} />
            Order Now
          </Link>
        </div>
      </section>
    </>
  );
}
