"use client";

import Link from "next/link";
import { CheckCircle2, Mail, MessageCircle, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import CopyableContact from "../components/site/CopyableContact";
import LeadSuccessTracker from "../components/site/LeadSuccessTracker";
import { formatCurrency } from "../components/site/data";
import { formatDeliveryDateLabel } from "@/src/lib/utils/format";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const leadToken = searchParams.get("lead") ?? "";
  const [lead, setLead] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!leadToken) {
      setError("We could not find your confirmation details. Please contact support.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadLeadConfirmation() {
      try {
        const response = await fetch(`/api/leads/confirmation/${encodeURIComponent(leadToken)}`, {
          cache: "no-store"
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load your confirmation.");
        }

        if (isMounted) {
          setLead(result.lead);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load your confirmation."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLeadConfirmation();

    return () => {
      isMounted = false;
    };
  }, [leadToken]);

  const deliveryTiming = useMemo(() => {
    if (!lead) {
      return "";
    }

    return [formatDeliveryDateLabel(lead.deliveryDate), lead.deliveryTime]
      .filter(Boolean)
      .join(" | ");
  }, [lead]);

  if (isLoading) {
    return (
      <section className="page-section" data-nav-theme="light">
        <div className="site-container">Loading confirmation...</div>
      </section>
    );
  }

  if (error || !lead) {
    return (
      <section className="page-section" data-nav-theme="light">
        <div className="site-container">
          <article className="thank-you-card reveal">
            <h1>We saved your request, but couldn&apos;t load the confirmation view.</h1>
            <p>{error || "Please contact the bakery team with your latest order details."}</p>
            <div className="thank-you-actions">
              <Link className="button button-primary contact-button-dark" href="/contact">
                Contact Us
              </Link>
              <Link className="button button-outline" href="/">
                Back to Home
              </Link>
            </div>
          </article>
        </div>
      </section>
    );
  }

  const deliveryAddressLabel =
    lead.deliveryMethod === "pickup" ? "Pickup order" : lead.addressLine || "Not provided";

  return (
    <section className="thank-you-wrap" data-nav-theme="light">
      <div className="site-container">
        <LeadSuccessTracker lead={lead} />
        <article className="thank-you-card reveal">
          <div className="success-icon">
            <CheckCircle2 size={40} />
          </div>
          <h1>Thank You for Your Order!</h1>
          <p>
            Your order has been successfully saved. We&apos;re excited to prepare your delicious
            Peach Strudel.
          </p>

          <div className="thank-you-summary">
            <section className="thank-you-group thank-you-group-summary">
              <div className="thank-you-group-head">
                <span className="thank-you-group-kicker">Summary</span>
              </div>
              <div className="thank-you-group-body">
                <div className="thank-you-meta">
                  <strong>Order Number</strong>
                  <span>{lead.orderNumber}</span>
                </div>
                <div className="thank-you-meta is-total">
                  <strong>Total</strong>
                  <span className="thank-you-total">
                    {formatCurrency(lead.total)}
                  </span>
                </div>
                <div className="thank-you-meta">
                  <strong>Quantity</strong>
                  <span>
                    {lead.items.reduce((count, item) => count + item.quantity, 0)}
                  </span>
                </div>
              </div>
            </section>

            <section className="thank-you-group">
              <div className="thank-you-group-head">
                <span className="thank-you-group-kicker">Order Details</span>
              </div>
              <div className="thank-you-group-body">
                <div className="thank-you-meta">
                  <strong>Selected Items</strong>
                  <span>
                    {lead.items.map((item) => `${item.sizeLabel} x${item.quantity}`).join(", ")}
                  </span>
                </div>
                <div className="thank-you-meta">
                  <strong>Candles</strong>
                  <span>
                    {lead.includeCandles ? `${lead.candleQuantity} included` : "No candles"}
                  </span>
                </div>
              </div>
            </section>

            <section className="thank-you-group thank-you-group-fulfilment">
              <div className="thank-you-group-head">
                <span className="thank-you-group-kicker">Fulfilment Details</span>
              </div>
              <div className="thank-you-group-body">
                <div className="thank-you-meta">
                  <strong>Delivery/Pickup Timing</strong>
                  <span>{deliveryTiming}</span>
                </div>
                <div className="thank-you-meta">
                  <strong>Delivery Address</strong>
                  <span>{deliveryAddressLabel}</span>
                </div>
                {lead.deliveryMethod === "pickup" && lead.pickupStoreName ? (
                  <div className="thank-you-meta">
                    <strong>Pickup Store</strong>
                    <span>{lead.pickupStoreName}</span>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="thank-you-group thank-you-group-contact">
              <div className="thank-you-group-head">
                <span className="thank-you-group-kicker">Payment & Contact</span>
              </div>
              <div className="thank-you-group-body">
                <div className="thank-you-meta">
                  <strong>Payment Method</strong>
                  <span>{lead.paymentLabel}</span>
                </div>
                <div className="thank-you-meta">
                  <strong>Special Instructions</strong>
                  <span>{lead.specialInstructions || "None"}</span>
                </div>
                <div className="thank-you-meta">
                  <strong>Confirmation Sent To</strong>
                  <CopyableContact
                    className="thank-you-meta-copy"
                    href={`mailto:${lead.email}`}
                    value={lead.email}
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="thank-you-panel">
            <h3>What happens next?</h3>
            <ul className="thank-you-steps">
              <li>
                <div className="thank-you-step-copy">
                  <strong>Lead Stored</strong>
                  <span>Your request has been saved to our order pipeline and admin systems.</span>
                </div>
              </li>
              <li>
                <div className="thank-you-step-copy">
                  <strong>Preparation</strong>
                  <span>Our bakers will carefully prepare your Peach Strudel.</span>
                </div>
              </li>
              <li>
                <div className="thank-you-step-copy">
                  <strong>Delivery/Pickup</strong>
                  <span>
                    Your order will be ready for {lead.deliveryMethod === "delivery" ? "delivery" : "pickup"} on the scheduled date.
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
            <Link className="button button-primary contact-button-dark" href="/">
              Back to Home
            </Link>
            {lead.whatsappUrl ? (
              <a
                className="button button-outline"
                href={lead.whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle size={16} />
                Confirm on WhatsApp
              </a>
            ) : (
              <Link className="button button-outline" href="/contact">
                Contact Us
              </Link>
            )}
          </div>

          <div className="contact-points" style={{ marginTop: 22 }}>
            <CopyableContact
              className="contact-point-copy"
              href={`mailto:${lead.email}`}
              icon={<Mail size={14} />}
              value={lead.email}
            >
              Email: {lead.email}
            </CopyableContact>
            <span>
              <Package size={14} />
              Reference order number {lead.orderNumber} for support.
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <section className="page-section" data-nav-theme="light">
          <div className="site-container">Loading confirmation...</div>
        </section>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
