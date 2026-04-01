import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import CopyableContact from "./CopyableContact";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div>
          <div className="footer-brand">
            <img
              alt="Kenny Hills Bakers"
              className="brand-logo"
              src="https://www.kennyhillsbakers.com/cdn/shop/files/KHB_Circular_Logo.png?v=1661227805&width=663"
            />
            <div>
              <h3>Kenny Hills Bakers</h3>
              <p>Premium handcrafted Peach Strudel, baked fresh with love.</p>
            </div>
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/ingredients">Ingredients</Link>
            <Link href="/size-guide">Size Guide</Link>
            <Link href="/ingredients#faq-answers">FAQs</Link>
          </div>
        </div>

        <div>
          <h4>Contact Us</h4>
          <div className="footer-meta">
            <Link className="footer-location-link" href="/contact#visit-our-stores">
              <MapPin size={14} />
              See All Locations
            </Link>
            <CopyableContact
              href="tel:+60320113090"
              icon={<Phone size={14} />}
              value="+60 3-2011 3090"
            />
            <CopyableContact
              href="mailto:hello@kennyhillsbakers.com"
              icon={<Mail size={14} />}
              value="hello@kennyhillsbakers.com"
            />
          </div>
        </div>

        <div>
          <h4>Pickup Hours</h4>
          <div className="footer-meta">
            <span>
              <Clock3 size={14} />
              Mon-Fri: 9am - 7pm
            </span>
            <span>
              <Clock3 size={14} />
              Sat-Sun: 9am - 6pm
            </span>
          </div>
          <div className="footer-socials">
            <a aria-label="Instagram" href="https://www.instagram.com/kennyhillsbakers/?hl=en">
              <img alt="" className="footer-social-icon" src="/images/social/instagram.png" />
            </a>
            <a aria-label="Facebook" href="https://www.facebook.com/kennyhillsbakers/">
              <img alt="" className="footer-social-icon" src="/images/social/facebook.png" />
            </a>
          </div>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <p>&copy; 2026 Kenny Hills Bakers. All rights reserved.</p>
      </div>
    </footer>
  );
}
