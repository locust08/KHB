import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const perfectFor = [
  {
    title: "Morning Meeting",
    description: "A polished breakfast-table centerpiece for presentations, client catchups, and early wins.",
    image: "/images/occasions/morning-meeting.png"
  },
  {
    title: "Team Gathering",
    description: "Made for shared plates, lively conversation, and moments when everyone reaches for one more slice.",
    image: "/images/occasions/team-gathering.png"
  },
  {
    title: "Chef Choice",
    description: "Gift-ready, elegant, and thoughtful enough to feel like a curated dessert rather than a last-minute pick.",
    image: "/images/occasions/chef-choice.png"
  },
  {
    title: "Dessert Moments",
    description: "A quieter indulgence for tea, candles, and the kind of evening that deserves something beautiful.",
    image: "/images/occasions/dessert-moment.png"
  }
];

const khbGalleryRows = [
  [
    {
      title: "Peach Strudel menu shot",
      image: "/images/khb-gallery-custom/gallery-01.jpg"
    },
    {
      title: "Peach Strudel whole",
      image: "/images/khb-gallery-custom/gallery-02.jpg"
    },
    {
      title: "Peach Strudel plate view",
      image: "/images/khb-gallery-custom/gallery-03.jpg"
    },
    {
      title: "Peach Strudel slice detail",
      image: "/images/khb-gallery-custom/gallery-04.jpg"
    }
  ],
  [
    {
      title: "Kenny Hills display",
      image: "/images/khb-gallery-custom/gallery-05.jpg"
    },
    {
      title: "Chef presentation",
      image: "/images/khb-gallery-custom/gallery-06.jpg"
    },
    {
      title: "Peach Strudel detail",
      image: "/images/khb-gallery-custom/gallery-07.jpg"
    },
    {
      title: "Kenny Hills bakery scene",
      image: "/images/khb-gallery-custom/gallery-08.jpg"
    }
  ]
];

const khbGalleryMarqueeRows = khbGalleryRows.map((row) => [...row, ...row]);

export default function AboutPage() {
  return (
    <>
      <section
        className="page-banner"
        data-nav-theme="dark"
        style={{ backgroundImage: "url('/images/peach-strudel/whole-3.jpg')" }}
      >
        <div className="site-container">
          <h1>About Our Peach Strudel</h1>
          <p>A premium handcrafted dessert that brings joy to every celebration.</p>
        </div>
      </section>

      <section className="page-section surface-white" data-nav-theme="light">
        <div className="site-container story-grid">
          <div className="story-copy reveal reveal-left">
            <span className="eyebrow">Our Story</span>
            <h2>Crafted with Passion, Served with Pride</h2>
            <p>
              Our Peach Strudel is a masterpiece of bakery artistry, where tradition meets
              innovation. Each strudel begins with meticulously crafted <strong>flaky puff
              pastry</strong>, layered to perfection to create that signature golden, buttery
              crunch.
            </p>
            <p>
              Between those delicate layers, we fold in our signature{" "}
              <strong>vanilla whipped cream cheese</strong> - smooth, luxurious, and subtly sweet.
              This creamy filling is complemented by <strong>ripe, juicy peaches</strong> that
              bring a burst of natural sweetness and vibrant color.
            </p>
            <p>
              The result is a <strong>chilled dessert experience</strong> that&apos;s refreshingly
              indulgent, with crispy, creamy, fruity layers in every bite.
            </p>
          </div>
          <div className="reveal reveal-right">
            <img alt="Peach dessert with whipped cream" src="/images/peach-strudel/whole-2.jpg" />
          </div>
        </div>
      </section>

      <section className="page-section surface-gradient" data-nav-theme="warm">
        <div className="site-container product-grid">
          <div className="reveal reveal-left">
            <img alt="Puff pastry layers close up" src="/images/peach-strudel/single-2.jpg" />
          </div>
          <div className="story-copy reveal reveal-right">
            <span className="eyebrow">The Experience</span>
            <h2>Premium, Handcrafted, Indulgent</h2>
            <div className="number-list">
              {[
                {
                  title: "Flaky Perfection",
                  copy: "Dozens of delicate puff pastry layers create that signature golden crunch."
                },
                {
                  title: "Creamy Luxury",
                  copy: "Vanilla whipped cream cheese filling that is smooth, rich, and heavenly."
                },
                {
                  title: "Fresh Fruit Bliss",
                  copy: "Sweet, juicy peaches add natural flavor and beautiful color."
                },
                {
                  title: "Chilled to Perfection",
                  copy: "Best served cold for a refreshing, indulgent dessert experience."
                }
              ].map((item, index) => (
                <div key={item.title} className="number-list-item">
                  <div className="number-chip">{index + 1}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section surface-white" data-nav-theme="light">
        <div className="site-container">
          <div className="section-header reveal">
            <span className="eyebrow">Perfect For Every Occasion</span>
            <h2>Perfect For Every Occasion</h2>
            <p>
              Whether you&apos;re celebrating, gathering, or gifting, our Peach Strudel makes every
              moment special.
            </p>
          </div>
          <div className="occasion-grid">
            {perfectFor.map((item, index) => (
              <article
                key={item.title}
                className="occasion-card reveal"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <input
                  id={`occasion-card-${index}`}
                  className="occasion-flip-toggle"
                  type="checkbox"
                  aria-label={`Flip ${item.title} card to reveal the photo`}
                />
                <label className="occasion-flip-shell" htmlFor={`occasion-card-${index}`}>
                  <span className="occasion-flip-card">
                    <span className="occasion-face occasion-face-front">
                      <span className="occasion-front-chip">{String(index + 1).padStart(2, "0")}</span>
                      <span className="occasion-front-kicker">Perfect For</span>
                      <span className="occasion-front-title">{item.title}</span>
                      <span className="occasion-front-copy">{item.description}</span>
                      <span className="occasion-front-hint">Hover or tap to flip</span>
                    </span>
                    <span className="occasion-face occasion-face-back" aria-hidden="true">
                      <img alt="" className="occasion-image" src={item.image} />
                    </span>
                  </span>
                </label>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section khb-gallery-band" data-nav-theme="light">
        <div className="site-container">
          <div className="khb-gallery-head reveal">
            <span className="khb-gallery-kicker">Gallery Photos</span>
            <h2>
              Discover <span>Creations</span>
              <br />
              Through Gallery Photos
            </h2>
            <p>
              A moving wall of Kenny Hills Bakers moments, using official visuals with a cleaner,
              softer presentation that fits the rest of the page.
            </p>
          </div>

          <div className="khb-gallery-board reveal-sequence">
            {khbGalleryMarqueeRows.map((row, rowIndex) => (
              <div
                key={`gallery-row-${rowIndex}`}
                className={rowIndex === 0 ? "khb-gallery-marquee" : "khb-gallery-marquee is-reverse"}
              >
                <div className="khb-gallery-marquee-track">
                  {[...row, ...row].map((item, itemIndex) => (
                    <article
                      key={`${item.title}-${itemIndex}`}
                      aria-hidden={itemIndex >= row.length / 2}
                      className="khb-gallery-tile"
                    >
                      <img alt={itemIndex < row.length ? item.title : ""} src={item.image} />
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band" data-nav-theme="dark">
        <div className="site-container cta-band-inner">
          <div>
            <span className="eyebrow eyebrow-light">Experience the Magic</span>
            <h2>Experience the Magic</h2>
            <p>
              Order your handcrafted Peach Strudel today and taste the difference quality makes.
            </p>
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
