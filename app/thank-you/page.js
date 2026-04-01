"use client";

import Link from "next/link";
import { CheckCircle2, Download, Mail, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CopyableContact from "../components/site/CopyableContact";
import { formatCurrency, getSizeOptionByKey } from "../components/site/data";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "KHB123456";
  const total = Number(searchParams.get("total") ?? "169.60");
  const email = searchParams.get("email") ?? "customer@example.com";
  const date = searchParams.get("date");
  const deliveryTime = searchParams.get("deliveryTime") ?? "";
  const method = searchParams.get("method") ?? "delivery";
  const pickupStore = searchParams.get("pickupStore") ?? "";
  const sizeKey = searchParams.get("sizeKey") ?? "medium";
  const itemsSummary = searchParams.get("itemsSummary");
  const quantity = Number(searchParams.get("quantity") ?? "1");
  const candles = searchParams.get("candles") ?? "no";
  const candleQty = Number(searchParams.get("candleQty") ?? "0");
  const instructions = searchParams.get("instructions") ?? "";
  const address = searchParams.get("address") ?? "";
  const city = searchParams.get("city") ?? "";
  const postalCode = searchParams.get("postalCode") ?? "";
  const state = searchParams.get("state") ?? "";
  const payment = searchParams.get("payment") ?? "card";
  const paymentLabel = searchParams.get("paymentLabel") ?? "Credit/Debit Card";
  const selectedSize = getSizeOptionByKey(sizeKey);

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "Not specified";
  const deliveryTiming = [formattedDate, deliveryTime].filter(Boolean).join(" | ");
  const deliveryAddress = [address, city, postalCode, state].filter(Boolean).join(", ");
  const deliveryAddressLabel = method === "delivery" ? (deliveryAddress || "Not provided") : "Pickup order";
  const specialInstructions = instructions || "None";

  return (
    <section className="thank-you-wrap" data-nav-theme="light">
      <div className="site-container">
        <article className="thank-you-card reveal">
          <div className="success-icon"><CheckCircle2 size={40} /></div>
          <h1>Thank You for Your Order!</h1>
          <p>
            Your order has been successfully placed. We&apos;re excited to prepare your delicious
            Peach Strudel!
          </p>

          <div className="thank-you-summary">
            <section className="thank-you-group thank-you-group-summary">
              <div className="thank-you-group-head">
                <span className="thank-you-group-kicker">Summary</span>
              </div>
              <div className="thank-you-group-body">
                <div className="thank-you-meta"><strong>Order Number</strong><span>{orderNumber}</span></div>
                <div className="thank-you-meta is-total"><strong>Total</strong><span className="thank-you-total">{formatCurrency(total)}</span></div>
                <div className="thank-you-meta"><strong>Quantity</strong><span>{quantity}</span></div>
              </div>
            </section>

            <section className="thank-you-group">
              <div className="thank-you-group-head">
                <span className="thank-you-group-kicker">Order Details</span>
              </div>
              <div className="thank-you-group-body">
                <div className="thank-you-meta"><strong>{itemsSummary ? "Selected Items" : "Selected Size"}</strong><span>{itemsSummary ?? selectedSize.display}</span></div>
                <div className="thank-you-meta"><strong>Candles</strong><span>{candles === "yes" ? `${candleQty} included` : "No candles"}</span></div>
              </div>
            </section>

            <section className="thank-you-group thank-you-group-fulfilment">
              <div className="thank-you-group-head">
                <span className="thank-you-group-kicker">Fulfilment Details</span>
              </div>
              <div className="thank-you-group-body">
                <div className="thank-you-meta"><strong>Delivery/Pickup Timing</strong><span>{deliveryTiming}</span></div>
                <div className="thank-you-meta"><strong>Delivery Address</strong><span>{deliveryAddressLabel}</span></div>
                {method === "pickup" && pickupStore ? (
                  <div className="thank-you-meta"><strong>Pickup Store</strong><span>{pickupStore}</span></div>
                ) : null}
              </div>
            </section>

            <section className="thank-you-group thank-you-group-contact">
              <div className="thank-you-group-head">
                <span className="thank-you-group-kicker">Payment & Contact</span>
              </div>
              <div className="thank-you-group-body">
                <div className="thank-you-meta"><strong>Payment Method</strong><span>{payment === "online" || payment === "ewallet" ? paymentLabel : "Credit/Debit Card"}</span></div>
                <div className="thank-you-meta"><strong>Special Instructions</strong><span>{specialInstructions}</span></div>
                <div className="thank-you-meta">
                  <strong>Confirmation Sent To</strong>
                  <CopyableContact className="thank-you-meta-copy" href={`mailto:${email}`} value={email} />
                </div>
              </div>
            </section>
          </div>

          <div className="thank-you-panel">
            <h3>What happens next?</h3>
            <ul className="thank-you-steps">
              <li>
                <div className="thank-you-step-copy">
                  <strong>Order Confirmation</strong>
                  <span>Check your email for order details and receipt.</span>
                </div>
              </li>
              <li>
                <div className="thank-you-step-copy">
                  <strong>Preparation</strong>
                  <span>Our bakers will carefully craft your Peach Strudel.</span>
                </div>
              </li>
              <li>
                <div className="thank-you-step-copy">
                  <strong>Delivery/Pickup</strong>
                  <span>
                    Your order will be ready for {method === "delivery" ? "delivery" : "pickup"} on the scheduled date.
                  </span>
                </div>
              </li>
              <li>
                <div className="thank-you-step-copy">
                  <strong>Enjoy</strong>
                  <span>Serve chilled and savor every delicious bite.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="thank-you-actions">
            <Link className="button button-primary contact-button-dark" href="/">Back to Home</Link>
            <Link className="button button-outline" href="/contact">Contact Us</Link>
          </div>

          <div className="contact-points" style={{ marginTop: 22 }}>
            <CopyableContact
              className="contact-point-copy"
              href="mailto:orders@kennyhillsbakers.com"
              icon={<Mail size={14} />}
              value="orders@kennyhillsbakers.com"
            >
              Email: orders@kennyhillsbakers.com
            </CopyableContact>
            <span><Package size={14} />Reference order number {orderNumber} for support.</span>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<section className="page-section" data-nav-theme="light"><div className="site-container">Loading confirmation...</div></section>}>
      <ThankYouContent />
    </Suspense>
  );
}
