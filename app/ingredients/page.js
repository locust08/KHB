"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  Leaf,
  ShoppingBag,
  Snowflake,
  Thermometer,
  Timer
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const premiumIngredientAssetsExact = {
  leafIcon: "/images/figma/premium-ingredients/leaf-icon.svg",
  foodComposite: "/images/figma/premium-ingredients/food-composite-transparent.png",
  connectorPeaches: "/images/figma/premium-ingredients/connector-peaches.svg",
  connectorCream: "/images/figma/premium-ingredients/connector-cream.svg",
  connectorPastry: "/images/figma/premium-ingredients/connector-pastry.svg"
};

const premiumIngredientCalloutsExact = [
  {
    key: "peaches",
    title: "Fresh Peaches",
    emoji: "\uD83C\uDF51",
    connector: premiumIngredientAssetsExact.connectorPeaches,
    text: "Sweet, juicy peaches selected for perfect ripeness"
  },
  {
    key: "cream",
    title: "Vanilla Cream",
    emoji: "\uD83E\uDD5B",
    connector: premiumIngredientAssetsExact.connectorCream,
    text: "Whipped cream cheese with vanilla for silky smoothness"
  },
  {
    key: "pastry",
    title: "Puff Pastry",
    emoji: "\uD83E\uDD50",
    connector: premiumIngredientAssetsExact.connectorPastry,
    text: "Buttery, flaky layers made with premium butter and flour"
  }
];

const premiumIngredientText =
  "Puff pastry (wheat flour, butter, water, salt), cream cheese, whipping cream, peaches, sugar, vanilla extract, eggs";

const allergenDetails = [
  {
    title: "Dairy",
    image: "/images/allergens/dairy.jpg",
    text: "Butter, cream cheese, and whipping cream are all built into the filling and pastry experience."
  },
  {
    title: "Eggs",
    image: "/images/allergens/egg.jpg",
    text: "Eggs are used in the pastry structure to support tenderness, sheen, and clean layering."
  },
  {
    title: "Gluten",
    image: "/images/allergens/gluten.jpg",
    text: "Puff pastry is made with wheat flour, so this dessert is not suitable for gluten-free diets."
  },
  {
    title: "Shared kitchen",
    image: "https://images.pexels.com/photos/4753637/pexels-photo-4753637.jpeg?auto=compress&cs=tinysrgb&w=1200",
    text: "Nuts and other common allergens may be present because the bakery environment handles them too."
  }
];

const storageMoments = [
  {
    icon: Thermometer,
    image: "/images/peach-strudel/whole-2.jpg",
    title: "Move it straight to the chiller",
    text: "Store at 0 to 4 C as soon as it arrives so the pastry and filling hold their intended texture."
  },
  {
    icon: Timer,
    image: "/images/peach-strudel/whole-3.jpg",
    title: "Give it a short serving window",
    text: "Let it sit for about 10 minutes before slicing so the layers relax without losing their chill."
  },
  {
    icon: Snowflake,
    image: "/images/peach-strudel/single-1.jpg",
    title: "Never freeze it",
    text: "Freezing will flatten the pastry and dull the whipped filling, so keep it refrigerated only."
  },
  {
    icon: Leaf,
    image: "/images/peach-strudel/whole-1.jpg",
    title: "Best within 2 days",
    text: "The cleanest bite and sharpest texture are within 48 hours, though it can hold a little longer when covered."
  }
];

const servingTips = [
  {
    title: "Temper gently",
    detail: "Remove from chiller 10 minutes before serving for best flavor",
    accent: "Best for flavor release"
  },
  {
    title: "Slice cleanly",
    detail: "Use a sharp knife for clean, beautiful slices",
    accent: "Keeps the layers defined"
  },
  {
    title: "Finish the plate",
    detail: "Garnish with fresh peach slices or mint for presentation",
    accent: "Instant hosted-table upgrade"
  },
  {
    title: "Pair the pour",
    detail: "Pairs beautifully with coffee, tea, or champagne",
    accent: "Works from brunch to dessert"
  },
  {
    title: "Cover the leftovers",
    detail: "Store leftovers covered in an airtight container",
    accent: "Protects texture overnight"
  }
];

const faqs = [
  {
    category: "Storage",
    question: "How long can Peach Strudel stay out before serving?",
    answer:
      "Keep it chilled until close to serving time, then give it about 10 minutes at room temperature so the flavor opens up without softening too much."
  },
  {
    category: "Slicing",
    question: "What is the cleanest way to cut beautiful slices?",
    answer:
      "Use a sharp knife, wipe the blade between cuts, and let the pastry rest briefly before slicing so the cream and layers stay neat."
  },
  {
    category: "Serving",
    question: "What should I serve with it for guests?",
    answer:
      "Coffee, tea, and champagne all pair beautifully. If you want it to look more polished, add mint leaves or fresh peach slices on the plate."
  },
  {
    category: "Freshness",
    question: "How long does it stay at its best after pickup?",
    answer:
      "The pastry and filling are at their sharpest within 48 hours. Keep leftovers covered in an airtight container and refrigerated."
  },
  {
    category: "Allergens",
    question: "What allergens should I check before ordering for a group?",
    answer:
      "It contains dairy, eggs, and gluten, and it is prepared in a bakery environment that also handles nuts and other common allergens."
  },
  {
    category: "Planning",
    question: "When should I schedule pickup for an event or celebration?",
    answer:
      "Choose a pickup slot as close to the event as possible, keep it chilled after collection, and plate it shortly before serving so the finish still looks fresh."
  }
];

export default function IngredientsPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [activeStorageIndex, setActiveStorageIndex] = useState(0);
  const [activeServingIndex, setActiveServingIndex] = useState(null);
  const [activeAllergenIndex, setActiveAllergenIndex] = useState(0);
  const [isMobileStorageCarousel, setIsMobileStorageCarousel] = useState(false);
  const allergenTrackRef = useRef(null);
  const storageTrackRef = useRef(null);
  const servingGridRef = useRef(null);
  const servingFirstCardInnerRef = useRef(null);
  const servingScrollCueTimeoutRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");

    function syncStorageMode() {
      setIsMobileStorageCarousel(mediaQuery.matches);
    }

    syncStorageMode();
    mediaQuery.addEventListener("change", syncStorageMode);
    return () => {
      mediaQuery.removeEventListener("change", syncStorageMode);
    };
  }, []);

  useEffect(() => {
    if (isMobileStorageCarousel) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveStorageIndex((current) => (current + 1) % storageMoments.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [isMobileStorageCarousel]);

  useEffect(() => {
    if (!isMobileStorageCarousel) {
      return undefined;
    }

    const grid = servingGridRef.current;
    const firstCard = grid?.querySelector(".serving-flip-card");

    if (!grid || !firstCard) {
      return undefined;
    }

    function playServingScrollCue() {
      const inner = servingFirstCardInnerRef.current;

      if (
        !inner ||
        servingScrollCueTimeoutRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      inner.style.animation = "none";
      void inner.offsetHeight;
      inner.style.animation = "serving-mobile-scroll-flip 1s cubic-bezier(.22, 1, .36, 1) 1";

      servingScrollCueTimeoutRef.current = window.setTimeout(() => {
        inner.style.animation = "";
        servingScrollCueTimeoutRef.current = null;
      }, 1000);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== firstCard) {
            return;
          }

          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            playServingScrollCue();
          }
        });
      },
      {
        threshold: [0, 0.55, 0.75],
        rootMargin: "0px 0px -30% 0px"
      }
    );

      observer.observe(firstCard);

    return () => {
      observer.disconnect();

      if (servingScrollCueTimeoutRef.current) {
        window.clearTimeout(servingScrollCueTimeoutRef.current);
        servingScrollCueTimeoutRef.current = null;
      }
    };
  }, [isMobileStorageCarousel]);

  useEffect(() => {
    const track = allergenTrackRef.current;

    if (!track) {
      return undefined;
    }

    function syncAllergenIndex() {
      const firstCard = track.querySelector(".allergen-priority-card");

      if (!firstCard) {
        return;
      }

      const cardWidth = firstCard.getBoundingClientRect().width;
      const computedStyle = window.getComputedStyle(track);
      const gap = Number.parseFloat(computedStyle.columnGap || computedStyle.gap || "0") || 0;
      const step = cardWidth + gap;

      if (!step) {
        return;
      }

      const nextIndex = Math.round(track.scrollLeft / step);
      setActiveAllergenIndex(Math.max(0, Math.min(allergenDetails.length - 1, nextIndex)));
    }

    syncAllergenIndex();
    track.addEventListener("scroll", syncAllergenIndex, { passive: true });
    window.addEventListener("resize", syncAllergenIndex);

    return () => {
      track.removeEventListener("scroll", syncAllergenIndex);
      window.removeEventListener("resize", syncAllergenIndex);
    };
  }, []);

  function scrollToAllergen(index) {
    const track = allergenTrackRef.current;

    if (!track) {
      return;
    }

    const cards = track.querySelectorAll(".allergen-priority-card");
    const targetCard = cards[index];

    if (!targetCard) {
      return;
    }

    track.scrollTo({
      left: targetCard.offsetLeft,
      behavior: "smooth"
    });
  }

  function scrollToStorage(index) {
    const track = storageTrackRef.current;

    if (!track) {
      return;
    }

    const cards = track.querySelectorAll(".storage-showcase-card");
    const targetCard = cards[index];

    if (!targetCard) {
      return;
    }

    track.scrollTo({
      left: targetCard.offsetLeft,
      behavior: "smooth"
    });
  }

  useEffect(() => {
    if (!isMobileStorageCarousel) {
      return undefined;
    }

    const track = storageTrackRef.current;

    if (!track) {
      return undefined;
    }

    function syncStorageIndex() {
      const cards = track.querySelectorAll(".storage-showcase-card");

      if (!cards.length) {
        return;
      }

      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - trackCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveStorageIndex(Math.max(0, Math.min(storageMoments.length - 1, closestIndex)));
    }

    syncStorageIndex();
    track.addEventListener("scroll", syncStorageIndex, { passive: true });
    window.addEventListener("resize", syncStorageIndex);

    return () => {
      track.removeEventListener("scroll", syncStorageIndex);
      window.removeEventListener("resize", syncStorageIndex);
    };
  }, [isMobileStorageCarousel]);

  return (
    <>
      <section className="page-hero" data-nav-theme="warm">
        <div className="site-container page-hero-inner">
          <span className="eyebrow">Ingredients, Allergens & Storage</span>
          <h1>Ingredients, Allergens & Storage</h1>
          <p>Everything you need to know to order, serve, and keep your Peach Strudel at its best.</p>
        </div>
      </section>

      <section
        className="page-section surface-white"
        data-nav-theme="light"
        id="ingredients-overview"
      >
        <div className="site-container">
          <div className="premium-ingredients-section reveal">
            <div className="premium-ingredients-header">
              <div className="premium-ingredients-badge" aria-hidden="true">
                <img alt="" src={premiumIngredientAssetsExact.leafIcon} />
              </div>
              <h2>Premium Ingredients</h2>
              <p>We use only the finest ingredients to create our signature Peach Strudel</p>
            </div>

            <div className="premium-ingredients-stage">
              <div className="premium-ingredients-showcase-shell">
                <div className="premium-ingredients-showcase">
                  {premiumIngredientCalloutsExact.map((item) => (
                    <article
                      key={item.key}
                      className={`premium-ingredient-callout premium-ingredient-callout-${item.key}`}
                    >
                      <div className="premium-ingredient-icon" aria-hidden="true">
                        <span>{item.emoji}</span>
                      </div>
                      <div className="premium-ingredient-copy">
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </div>
                      <img
                        alt=""
                        aria-hidden="true"
                        className={`premium-ingredient-connector premium-ingredient-connector-${item.key}`}
                        src={item.connector}
                      />
                    </article>
                  ))}

                  <div className="premium-ingredients-artboard" aria-hidden="true">
                    <div className="premium-art-composite premium-art-composite-top">
                      <img alt="" src={premiumIngredientAssetsExact.foodComposite} />
                    </div>
                    <div className="premium-art-composite premium-art-composite-bottom">
                      <img alt="" src={premiumIngredientAssetsExact.foodComposite} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-ingredients-divider" />
              <p className="premium-ingredients-full-copy">
                <strong>Full ingredients:</strong> {premiumIngredientText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section surface-gradient" data-nav-theme="warm" id="allergen-info">
        <div className="site-container">
          <div className="allergen-spotlight reveal">
            <div className="allergen-warning-panel">
              <div className="allergen-warning-icon" aria-hidden="true">
                <AlertTriangle size={22} />
              </div>
              <span className="eyebrow">Allergen Information</span>
              <h2>Pause here before you order.</h2>
              <p>
                Peach Strudel contains dairy, eggs, and gluten, and it is prepared in a bakery
                environment that also handles nuts and other common allergens.
              </p>
            </div>

            <div className="allergen-priority-grid" ref={allergenTrackRef}>
              {allergenDetails.map((item) => (
                <article key={item.title} className="allergen-priority-card allergen-visual-card">
                  <img alt={item.title} className="allergen-visual-image" src={item.image} />
                  <div className="allergen-visual-overlay">
                    <span className="allergen-visual-kicker">
                      {item.title === "Shared kitchen" ? "Awareness" : "Contains"}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="allergen-carousel-dots" aria-label="Allergen cards navigation">
              {allergenDetails.map((item, index) => (
                <button
                  key={item.title}
                  aria-label={`Show ${item.title} allergen card`}
                  aria-pressed={index === activeAllergenIndex}
                  className={
                    index === activeAllergenIndex
                      ? "allergen-carousel-dot is-active"
                      : "allergen-carousel-dot"
                  }
                  onClick={() => scrollToAllergen(index)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section surface-white" data-nav-theme="light" id="storage-care">
        <div className="site-container">
          <div className="storage-flow-shell reveal">
            <div className="storage-showcase-header">
              <span className="eyebrow">Storage & Care</span>
              <h2>Keep it chilled and serve it right.</h2>
              <p>Everything important lives in these four cards, while the image stays clean and text-free.</p>
            </div>

            <div className="storage-showcase-board">
              <div className="storage-showcase-image-shell">
                {storageMoments.map((item, index) => (
                  <img
                    key={item.title}
                    alt="Peach Strudel storage and care visual"
                    className={
                      index === activeStorageIndex
                        ? "storage-showcase-image is-active"
                        : "storage-showcase-image"
                    }
                    src={item.image}
                  />
                ))}
              </div>

              <div className="storage-showcase-grid" ref={storageTrackRef}>
                {storageMoments.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = index === activeStorageIndex;

                  return (
                    <article
                      key={item.title}
                      className={isActive ? "storage-showcase-card is-active" : "storage-showcase-card"}
                    >
                      <div className="storage-showcase-icon" aria-hidden="true">
                        <Icon size={24} />
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </article>
                  );
                })}
              </div>

              <div className="storage-carousel-dots" aria-label="Storage cards navigation">
                {storageMoments.map((item, index) => (
                  <button
                    key={item.title}
                    aria-label={`Show ${item.title} storage card`}
                    aria-pressed={index === activeStorageIndex}
                    className={
                      index === activeStorageIndex
                        ? "storage-carousel-dot is-active"
                        : "storage-carousel-dot"
                    }
                    onClick={() => scrollToStorage(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>

            <section className="serving-guide-panel" id="serving-tips">
              <div className="serving-guide-intro">
                <span className="eyebrow">Serving Tips for Best Experience</span>
                <h2>Serve it cold, clean, and celebration-ready.</h2>
                <p>
                  These are the finishing steps that make the strudel feel polished at the table,
                  from the first cut to the last covered slice.
                </p>
              </div>

              <div className="serving-flip-grid" ref={servingGridRef}>
                {servingTips.map((tip, index) => {
                  const isActive = index === activeServingIndex;
                  const cardClassName = [
                    "serving-flip-card",
                    isActive ? "is-active" : ""
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <button
                      key={tip.title}
                      aria-pressed={isActive}
                      className={cardClassName}
                      onClick={() =>
                        setActiveServingIndex((current) => (current === index ? null : index))
                      }
                      type="button"
                    >
                      <span
                        className="serving-flip-card-inner"
                        ref={index === 0 ? servingFirstCardInnerRef : null}
                      >
                        <span className="serving-flip-face serving-flip-front">
                          <small>{String(index + 1).padStart(2, "0")}</small>
                          <em>{tip.accent}</em>
                        </span>
                        <span className="serving-flip-face serving-flip-back">
                          <small>Step {String(index + 1).padStart(2, "0")}</small>
                          <strong>{tip.title}</strong>
                          <p>{tip.detail}</p>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

            </section>
          </div>
        </div>
      </section>

      <section className="page-section surface-gradient" data-nav-theme="warm" id="faq-answers">
        <div className="site-container">
          <div className="faq-studio reveal">
            <div className="faq-studio-intro faq-studio-intro-wide">
              <span className="eyebrow">Frequently Asked Questions</span>
              <h2>Quick answers before you place the order.</h2>
              <p>
                Tap any question for the practical version: how to store it, when to serve it, and
                what to check before ordering for guests.
              </p>
            </div>

            <div className="faq-stack-modern">
              {faqs.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <article
                    key={item.question}
                    className={isOpen ? "faq-card faq-card-modern is-open" : "faq-card faq-card-modern"}
                  >
                    <button
                      className="faq-trigger faq-trigger-modern"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      type="button"
                    >
                      <span className="faq-order-chip">{item.category}</span>
                      <span className="faq-question-wrap">
                        <strong>{item.question}</strong>
                        <small>{isOpen ? "Tap to collapse" : "Tap to expand"}</small>
                      </span>
                      <ChevronDown
                        size={18}
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 180ms ease"
                        }}
                      />
                    </button>
                    {isOpen ? <div className="faq-answer faq-answer-modern">{item.answer}</div> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band" data-nav-theme="dark">
        <div className="site-container cta-band-inner">
          <div>
            <span className="eyebrow eyebrow-light">Ready to Order?</span>
            <h2>Ready to Order?</h2>
            <p>Experience our Peach Strudel with the confidence of knowing exactly what is inside.</p>
          </div>
          <Link className="button button-light button-icon" href="/buy-now?size=medium">
            <ShoppingBag size={16} />
            Order Your Peach Strudel
          </Link>
        </div>
      </section>
    </>
  );
}
