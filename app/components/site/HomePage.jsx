"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Package,
  ShoppingBag,
  Star,
  Store,
  Truck,
  Users,
  X
} from "lucide-react";
import TikTokStackedCarousel from "./TikTokStackedCarousel";
import { homeFeatures, sizeOptions, tiktokEmbeds, testimonials } from "./data";

const heroBenefits = [
  { icon: Package, label: "In Stock" },
  { icon: Truck, label: "Ready to Ship" },
  { icon: CalendarDays, label: "Select Date" },
  { icon: Store, label: "Pickup Available" }
];

const heroIngredientsNoWrap = new Set(["Peaches", "Cream Cheese"]);

const heroIngredients = [
  {
    name: "Puff Pastry",
    image:
      "https://smart.dhgate.com/wp-content/uploads/2025/07/Gluten-Free-Puff-Pastry_1200px-featured-2.jpg",
    description: "Buttery, flaky layers of premium puff pastry.",
    x: 50,
    y: 4
  },
  {
    name: "Peaches",
    image:
      "https://images.unsplash.com/photo-1719161684320-9f08586c5b67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjaCUyMGZydWl0JTIwZnJlc2glMjBzbGljZWR8ZW58MXx8fHwxNzc0MzM5OTQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Sweet, juicy fresh peaches.",
    x: 86,
    y: 16
  },
  {
    name: "Cream Cheese",
    image:
      "https://images.unsplash.com/photo-1573810655264-8d1e50f1592d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhbSUyMGNoZWVzZSUyMHNwcmVhZHxlbnwxfHx8fDE3NzQzNDAzMTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Rich cream cheese whipped into a smooth, chilled filling.",
    x: 96,
    y: 48
  },
  {
    name: "Vanilla",
    image:
      "https://images.unsplash.com/photo-1686998423980-ab223d183055?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YW5pbGxhJTIwYmVhbiUyMHBvZHxlbnwxfHx8fDE3NzQzNDAzMTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Pure vanilla bean gives the filling its mellow, fragrant finish.",
    x: 80,
    y: 80
  },
  {
    name: "Butter",
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/007/701/458/small_2x/dairy-natural-yellow-butter-piece-photo.jpg",
    description: "Premium butter brings depth, richness, and lift to every layer.",
    x: 50,
    y: 92
  },
  {
    name: "Sugar",
    image:
      "https://images.unsplash.com/photo-1685967836908-7d3b4921a670?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWdhciUyMGdyYW51bGF0ZWQlMjB3aGl0ZXxlbnwxfHx8fDE3NzQyODQwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Fine sugar adds just enough sweetness to let the peaches shine.",
    x: 14,
    y: 80
  },
  {
    name: "Eggs",
    image:
      "https://images.unsplash.com/photo-1664339307400-9c22e5f44496?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ2dzJTIwZnJlc2glMjBicm93bnxlbnwxfHx8fDE3NzQzNDAzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Fresh eggs add structure and a delicate golden finish.",
    x: 4,
    y: 48
  },
  {
    name: "Whipping Cream",
    image:
      "https://cookfasteatwell.com/wp-content/uploads/2021/11/Bowl-of-Sweetened-Whipped-Cream-with-whip-on-side.jpg",
    description: "Heavy whipping cream keeps the filling airy, silky, and light.",
    x: 16,
    y: 16
  }
];

export default function HomePage() {
  const [activeIngredient, setActiveIngredient] = useState("Peaches");
  const [hoveredIngredient, setHoveredIngredient] = useState(null);
  const [modalIngredient, setModalIngredient] = useState(null);
  const heroCenterImage = "/images/peach-strudel/single-1.jpg";

  const hovered = useMemo(
    () => heroIngredients.find((item) => item.name === hoveredIngredient) ?? null,
    [hoveredIngredient]
  );

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = modalIngredient ? "hidden" : originalOverflow;

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [modalIngredient]);

  function handleIngredientClick(name) {
    setActiveIngredient(name);
    setModalIngredient(name);
  }

  const startingPrice = `RM${sizeOptions[0].price.toFixed(2)}`;

  return (
    <>
      <section className="hero-section hero-section-reference" data-nav-theme="warm">
        <div className="site-container hero-grid hero-grid-reference">
          <div className="hero-copy hero-copy-reference hero-copy-intro reveal reveal-left">
            <h1>Peach Strudel</h1>
            <p className="hero-kicker">Layers of indulgence, every bite a delight</p>
            <p className="hero-subtitle">
              Flaky puff pastry layered with vanilla whipped cream cheese and sweet, juicy
              peaches. A chilled dessert that&apos;s perfect for any celebration.
            </p>
          </div>

          <div className="ingredient-stage ingredient-stage-reference reveal reveal-right">
            <div className="ingredient-ring ingredient-ring-reference">
              <div className="ingredient-circles ingredient-circles-reference" aria-hidden="true" />
              <div className="ingredient-image-frame ingredient-image-frame-reference">
                <img alt="Peach Strudel" src={heroCenterImage} />
              </div>

              {heroIngredients.map((item) => (
                <button
                  key={item.name}
                  className={
                    item.name === activeIngredient
                      ? "ingredient-node ingredient-node-reference is-active"
                      : "ingredient-node ingredient-node-reference"
                  }
                  onClick={() => handleIngredientClick(item.name)}
                  onMouseEnter={() => setHoveredIngredient(item.name)}
                  onMouseLeave={() => setHoveredIngredient(null)}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  type="button"
                >
                  <span className="ingredient-dot ingredient-dot-reference" />
                  <span
                    className={
                      heroIngredientsNoWrap.has(item.name)
                        ? "hero-ring-label hero-ring-label-nowrap"
                        : "hero-ring-label"
                    }
                  >
                    {item.name}
                  </span>

                  {hovered?.name === item.name ? (
                    <span className="ingredient-tooltip">
                      <img alt={hovered.name} src={hovered.image} />
                      <span className="ingredient-tooltip-body">
                        <strong>{hovered.name}</strong>
                        <span>{hovered.description}</span>
                      </span>
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <p className="hero-note-reference">Click on ingredients to explore</p>
          </div>

          <div className="hero-copy hero-copy-reference hero-copy-details reveal reveal-left">
            <div className="hero-price hero-price-inline">
              <strong>{startingPrice}</strong>
              <span className="hero-price-note">starting from</span>
            </div>
            <div className="hero-actions hero-actions-reference">
              <Link className="button button-primary button-icon" href="/buy-now?size=medium">
                <ShoppingBag size={16} />
                Order Now
              </Link>
              <Link className="button button-outline" href="/ingredients#ingredients-overview">
                View Ingredients
              </Link>
            </div>
            <div className="hero-benefit-grid">
              {heroBenefits.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="hero-benefit-card">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {modalIngredient ? (
        <div className="ingredient-modal-backdrop" onClick={() => setModalIngredient(null)}>
          <div className="ingredient-modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              aria-label="Close ingredient details"
              className="ingredient-modal-close"
              onClick={() => setModalIngredient(null)}
              type="button"
            >
              <X size={18} />
            </button>
            <div className="ingredient-modal-media">
              <img
                alt={modalIngredient}
                src={heroIngredients.find((item) => item.name === modalIngredient)?.image}
              />
            </div>
            <h3>{modalIngredient}</h3>
            <p>{heroIngredients.find((item) => item.name === modalIngredient)?.description}</p>
          </div>
        </div>
      ) : null}

      <section className="content-section surface-white" data-nav-theme="light">
        <div className="site-container">
          <div className="section-header reveal">
            <span className="eyebrow">Why you&apos;ll love it</span>
            <h2>Why You&apos;ll Love It</h2>
            <p>
              Discover what makes our Peach Strudel the perfect choice for your special moments.
            </p>
          </div>
          <div className="feature-grid">
            {homeFeatures.map((item, index) => {
              const Icon = [Heart, Package, Users][index];
              return (
                <article
                  key={item.title}
                  className="glass-card feature-card reveal"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="icon-badge">
                    <Icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="content-section surface-gradient" data-nav-theme="warm" id="story-video">
        <div className="site-container">
          <div className="section-header reveal">
            <span className="eyebrow">See it in action</span>
            <h2>See It in Action</h2>
            <p>Watch how our Peach Strudel is crafted with love and care.</p>
          </div>
          <TikTokStackedCarousel items={tiktokEmbeds} />
        </div>
      </section>

      <section className="content-section surface-white" data-nav-theme="light">
        <div className="site-container">
          <div className="section-header reveal">
            <span className="eyebrow">What our customers say</span>
            <h2>What Our Customers Say</h2>
            <p>Real reviews from dessert lovers.</p>
          </div>
          <div className="marquee-shell">
            <div className="testimonial-marquee">
              {[...testimonials, ...testimonials].map((item, index) => (
                <article key={`${item.name}-${index}`} className="testimonial-card">
                  <div className="stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} fill="currentColor" size={16} />
                    ))}
                  </div>
                  <p>&quot;{item.text}&quot;</p>
                  <div className="testimonial-meta">
                    <strong>{item.name}</strong>
                    <span>{item.date}</span>
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
            <span className="eyebrow eyebrow-light">Ready to experience pure bliss?</span>
            <h2>Order Your Peach Strudel Today</h2>
            <p>Order your Peach Strudel today. Usually ready in 2-4 days.</p>
          </div>
          <Link className="button button-light button-icon" href="/buy-now?size=medium">
            <ArrowRight size={16} />
            Order Your Peach Strudel Now
          </Link>
        </div>
      </section>
    </>
  );
}
