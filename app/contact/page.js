"use client";

import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import CopyableContact from "../components/site/CopyableContact";
import SupportChat from "../components/site/SupportChat";
import { stores } from "../components/site/data";

export default function ContactPage() {
  const [selectedStore, setSelectedStore] = useState(stores[0]);
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("Please fill in all required fields.");
      return;
    }
    setStatus("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  return (
    <section className="page-section contact-page-shell" data-nav-theme="light">
      <div className="site-container">
        <div className="contact-hero-modern">
          <div className="contact-hero-copy reveal reveal-left">
            <span className="eyebrow">Contact Us</span>
            <h1>Need help with your order?</h1>
            <p>Ask about sizing, pickup, delivery, or the best store for your plan.</p>

            <div className="contact-cta-row">
              <a className="button contact-button-dark" href="tel:+60320113090">
                Call the Bakery
              </a>
              <a className="button button-outline" href="mailto:hello@kennyhillsbakers.com">
                Email Support
              </a>
            </div>
          </div>

          <div className="contact-visual-stage reveal reveal-right">
            <article className="contact-visual-main">
              <img alt="Peach Strudel whole cake styled for a celebration table" src="/images/peach-strudel/whole-3.jpg" />
              <div className="contact-visual-overlay">
                <span className="eyebrow">Quick support</span>
                <h2>Simple answers, clear next steps.</h2>
                <p>Tell us the occasion and we&apos;ll help you choose the right size and store.</p>
              </div>
            </article>
          </div>
        </div>

        <div className="contact-experience-grid">
          <article className="contact-form-studio reveal" id="contact-form">
            <div className="contact-form-heading">
              <div className="contact-card-icon" aria-hidden="true">
                <MessageCircle size={22} />
              </div>
              <div>
                <span className="eyebrow">Send A Message</span>
                <h2>Tell us what you need.</h2>
                <p>We&apos;ll reply with the clearest next step for sizing, pickup, delivery, or store help.</p>
              </div>
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-grid two-up">
                <label className="form-field">
                  <span>Full Name *</span>
                  <input
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="John Doe"
                    value={formData.name}
                  />
                </label>
                <label className="form-field">
                  <span>Phone Number</span>
                  <input
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="+60 12-345 6789"
                    value={formData.phone}
                  />
                </label>
              </div>
              <label className="form-field">
                <span>Email Address *</span>
                <input
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                />
              </label>
              <label className="form-field">
                <span>Subject</span>
                <input
                  onChange={(event) => updateField("subject", event.target.value)}
                  placeholder="How can we help you?"
                  value={formData.subject}
                />
              </label>
              <label className="form-field">
                <span>Message *</span>
                <textarea
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                />
              </label>
              <button className="button button-icon contact-button-dark" type="submit">
                <Send size={16} />
                Send Message
              </button>
            </form>

            {status ? (
              <div
                className={status.startsWith("Message sent") ? "form-status is-success" : "form-status"}
              >
                {status}
              </div>
            ) : null}
          </article>

          <aside className="contact-side-stack reveal">
            <div className="contact-support-wrap">
              <span className="eyebrow">AI Support</span>
              <h3>Ask Peach AI for an instant answer.</h3>
              <p>Ask about ordering, pickup, delivery, or store help.</p>
              <SupportChat mode="embedded" />
            </div>
          </aside>

        </div>

        <div className="contact-location-stage reveal" id="visit-our-stores">
          <div className="section-header">
            <span className="eyebrow">Visit Our Stores</span>
            <h2>Choose your Kenny Hills Bakers store.</h2>
            <p>
              Pick a Kenny Hills Bakers location from the dropdown, then view the branch details
              and open directions in one step.
            </p>
          </div>

          <div className="contact-location-grid">
            <div className="contact-store-picker-card">
              <label className="form-field contact-store-select-field">
                <span>Select a Kenny Hills Bakers store</span>
                <select
                  onChange={(event) =>
                    setSelectedStore(
                      stores.find((store) => store.id === event.target.value) ?? stores[0]
                    )
                  }
                  value={selectedStore.id}
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      Kenny Hills Bakers {store.name} | {store.state}
                    </option>
                  ))}
                </select>
              </label>

              <article className="store-card is-active contact-store-selected-card">
                <div className="contact-store-card-head">
                  <h4>Kenny Hills Bakers {selectedStore.name}</h4>
                  <span>{selectedStore.hours}</span>
                </div>
                <p>{selectedStore.address}</p>
                {selectedStore.phone ? (
                  <CopyableContact
                    className="contact-copy-inline"
                    href={`tel:${selectedStore.phone.replace(/\s+/g, "")}`}
                    value={selectedStore.phone}
                  />
                ) : (
                  <p>Phone number available in-store.</p>
                )}
              </article>
            </div>

            <div className="map-panel contact-map-panel">
              <iframe
                className="map-frame"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={selectedStore.mapUrl}
                title={selectedStore.name}
              />
              <div className="store-panel">
                <span className="eyebrow">Selected Store</span>
                <h3>Kenny Hills Bakers {selectedStore.name}</h3>
                <p>{selectedStore.address}</p>
                <div className="contact-points" style={{ marginTop: 16 }}>
                  {selectedStore.phone ? (
                    <CopyableContact
                      className="contact-point-copy"
                      href={`tel:${selectedStore.phone.replace(/\s+/g, "")}`}
                      value={selectedStore.phone}
                    />
                  ) : null}
                  <span>{selectedStore.hours}</span>
                </div>
                <div className="store-panel-actions">
                  {selectedStore.phone ? (
                    <a className="button contact-button-dark" href={`tel:${selectedStore.phone.replace(/\s+/g, "")}`}>
                      Call Store
                    </a>
                  ) : null}
                  <a
                    className="button contact-directions-button"
                    href={selectedStore.googleMapsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        aria-label="Chat with Kenny Hills Bakers on WhatsApp"
        className="contact-whatsapp-float"
        href="https://wa.me/60320113090"
        rel="noreferrer"
        target="_blank"
      >
        <span className="contact-whatsapp-mark" aria-hidden="true">
          <MessageCircle size={26} />
        </span>
      </a>
    </section>
  );
}
