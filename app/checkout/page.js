"use client";

import { CreditCard, Landmark, Minus, Plus, Smartphone, Store, Truck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  ewalletOptions,
  formatCurrency,
  getSizeOptionByKey,
  malaysiaBanks,
  stores
} from "../components/site/data";
import { useCart } from "../components/site/CartProvider";
import { getAttributionSnapshot } from "@/src/lib/tracking/attribution";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sizeKey = searchParams.get("size") ?? "medium";
  const cartIdsParam = searchParams.get("items") ?? "";
  const selectedCartIds = useMemo(
    () => cartIdsParam.split(",").filter(Boolean),
    [cartIdsParam]
  );
  const isCartCheckout = selectedCartIds.length > 0;
  const selectedSize = useMemo(() => getSizeOptionByKey(sizeKey), [sizeKey]);
  const { isHydrated, items, removeItems, updateQuantity } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [includeCandles, setIncludeCandles] = useState(false);
  const [candleQuantity, setCandleQuantity] = useState(1);
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id);
  const [selectedBank, setSelectedBank] = useState(malaysiaBanks[0]);
  const [selectedEwallet, setSelectedEwallet] = useState(ewalletOptions[0]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", postalCode: "", state: "", deliveryDate: "", deliveryTime: "", instructions: "", cardNumber: "", cardName: "", expiryDate: "", cvv: ""
  });
  const selectedPickupStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) ?? stores[0],
    [selectedStoreId]
  );

  const checkoutItems = useMemo(() => {
    if (!isCartCheckout) {
      return [
        {
          id: `direct-${selectedSize.key}`,
          quantity,
          size: selectedSize
        }
      ];
    }

    return items
      .filter((item) => selectedCartIds.includes(item.id))
      .map((item) => ({
        ...item,
        size: getSizeOptionByKey(item.sizeKey)
      }));
  }, [isCartCheckout, items, quantity, selectedCartIds, selectedSize]);

  const subtotal = checkoutItems.reduce(
    (total, item) => total + item.size.price * item.quantity,
    0
  );
  const deliveryFee = deliveryMethod === "delivery" ? 15 : 0;
  const tax = subtotal * 0.06;
  const total = subtotal + deliveryFee + tax;
  const totalQuantity = checkoutItems.reduce((count, item) => count + item.quantity, 0);
  const selectedPaymentLabel =
    paymentMethod === "card"
      ? "Credit/Debit Card"
      : paymentMethod === "online"
        ? selectedBank
        : selectedEwallet;

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function updateItemQuantity(itemId, nextQuantity) {
    if (isCartCheckout) {
      updateQuantity(itemId, nextQuantity);
      return;
    }

    setQuantity(Math.max(1, nextQuantity));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setNote("Please complete your personal information before placing the order.");
      return;
    }
    if (deliveryMethod === "delivery" && (!formData.address || !formData.city || !formData.postalCode)) {
      setNote("Delivery orders need a full address, city, and postal code.");
      return;
    }
    if (!formData.deliveryDate) {
      setNote("Please choose a delivery or pickup date.");
      return;
    }

    setIsSubmitting(true);
    setNote("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone
          },
          fulfillment: {
            method: deliveryMethod,
            address: deliveryMethod === "delivery" ? formData.address : "",
            city: deliveryMethod === "delivery" ? formData.city : "",
            postalCode: deliveryMethod === "delivery" ? formData.postalCode : "",
            state: deliveryMethod === "delivery" ? formData.state : "",
            pickupStoreId: deliveryMethod === "pickup" ? selectedStoreId : "",
            pickupStoreName: deliveryMethod === "pickup" ? selectedPickupStore.name : ""
          },
          schedule: {
            deliveryDate: formData.deliveryDate,
            deliveryTime: formData.deliveryTime,
            instructions: formData.instructions
          },
          payment: {
            method: paymentMethod,
            label: selectedPaymentLabel
          },
          addOns: {
            includeCandles,
            candleQuantity: includeCandles ? candleQuantity : 0
          },
          order: {
            items: checkoutItems.map((item) => ({
              id: item.id,
              sizeKey: item.size.key,
              sizeLabel: item.size.display,
              dimensions: item.size.dimensions,
              image: item.size.image,
              unitPrice: item.size.price,
              quantity: item.quantity,
              lineTotal: item.size.price * item.quantity
            })),
            subtotal,
            deliveryFee,
            tax,
            total,
            currency: "MYR"
          },
          attribution: getAttributionSnapshot(),
          context: {
            pageUrl: typeof window !== "undefined" ? window.location.href : ""
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "We could not save your order right now.");
      }

      if (isCartCheckout) {
        removeItems(selectedCartIds);
      }

      router.push(result.confirmationUrl);
    } catch (error) {
      setNote(error instanceof Error ? error.message : "We could not save your order right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCartCheckout && !isHydrated) {
    return (
      <section className="page-section" data-nav-theme="light">
        <div className="site-container">Loading checkout...</div>
      </section>
    );
  }

  if (isCartCheckout && checkoutItems.length === 0) {
    return (
      <section className="page-section" data-nav-theme="light">
        <div className="site-container">Your selected cart items are no longer available. Please return to the cart and choose them again.</div>
      </section>
    );
  }

  return (
    <section className="page-section" data-nav-theme="light">
      <div className="site-container checkout-page-shell">
        <div className="section-header checkout-page-header checkout-page-header-modern reveal">
          <div className="checkout-page-copy">
            <span className="eyebrow">Checkout</span>
            <h1>Finish your order with a cleaner, faster flow.</h1>
            <p>
              {isCartCheckout
                ? "Review your selected items, lock in pickup or delivery, and confirm payment in one compact flow."
                : "Choose your details, lock in the date, and complete your Peach Strudel order in just a few steps."}
            </p>
          </div>
          <div className="checkout-header-pills" aria-label="Checkout overview">
            <span>{totalQuantity} item{totalQuantity > 1 ? "s" : ""}</span>
            <span>{deliveryMethod === "delivery" ? "Delivery" : "Pickup"}</span>
            <span>{paymentMethod === "card" ? "Card" : paymentMethod === "online" ? "Online Banking" : "E-Wallet"}</span>
          </div>
        </div>

        <form className="checkout-grid" onSubmit={handleSubmit}>
          <section className="checkout-selected-shell reveal reveal-right">
            <article className="summary-card checkout-summary-card checkout-selected-card">
              <div className="checkout-summary-topline">
                <span className="eyebrow">Selected for checkout</span>
                <span className="checkout-summary-badge">{totalQuantity} item{totalQuantity > 1 ? "s" : ""}</span>
              </div>
              <div className="checkout-item-list">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img alt={item.size.display} src={item.size.image} />
                    <div>
                      <h3>Peach Strudel {item.size.display}</h3>
                      <p>{item.size.dimensions}</p>
                      <div className="quantity-stepper">
                        <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)} type="button"><Minus size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} type="button"><Plus size={14} /></button>
                      </div>
                    </div>
                    <strong className="checkout-item-price">
                      {formatCurrency(item.size.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <div className="checkout-stack checkout-flow-grid reveal reveal-left">
            <article className="checkout-card checkout-card-compact checkout-card-personal">
              <div className="checkout-header">
                <div>
                  <span className="eyebrow">Personal information</span>
                  <h3>Your details</h3>
                </div>
                <span className="checkout-card-chip">Step 1</span>
              </div>
              <div className="checkout-form-grid two-up">
                <label className="order-field"><span>First Name *</span><input onChange={(e) => updateField("firstName", e.target.value)} value={formData.firstName} /></label>
                <label className="order-field"><span>Last Name *</span><input onChange={(e) => updateField("lastName", e.target.value)} value={formData.lastName} /></label>
              </div>
              <div className="checkout-form-grid two-up" style={{ marginTop: 16 }}>
                <label className="order-field"><span>Email *</span><input onChange={(e) => updateField("email", e.target.value)} type="email" value={formData.email} /></label>
                <label className="order-field"><span>Phone *</span><input onChange={(e) => updateField("phone", e.target.value)} value={formData.phone} /></label>
              </div>
            </article>

            <article className="checkout-card checkout-card-compact checkout-card-fulfillment">
              <div className="checkout-header">
                <div>
                  <span className="eyebrow">Fulfillment</span>
                  <h3>Delivery method</h3>
                </div>
                <span className="checkout-card-chip">Step 2</span>
              </div>
              <div className="checkout-options">
                <button className={deliveryMethod === "delivery" ? "delivery-method-button is-active" : "delivery-method-button"} onClick={() => setDeliveryMethod("delivery")} type="button">
                  <Truck size={20} />
                  <span>Delivery</span>
                  <small>{formatCurrency(15)}</small>
                </button>
                <button className={deliveryMethod === "pickup" ? "delivery-method-button is-active" : "delivery-method-button"} onClick={() => setDeliveryMethod("pickup")} type="button">
                  <Store size={20} />
                  <span>Pickup</span>
                  <small>Free</small>
                </button>
              </div>

              {deliveryMethod === "delivery" ? (
                <div className="checkout-form-grid" style={{ marginTop: 18 }}>
                  <label className="order-field"><span>Street Address *</span><input onChange={(e) => updateField("address", e.target.value)} value={formData.address} /></label>
                  <div className="checkout-form-grid two-up">
                    <label className="order-field"><span>City *</span><input onChange={(e) => updateField("city", e.target.value)} value={formData.city} /></label>
                    <label className="order-field"><span>Postal Code *</span><input onChange={(e) => updateField("postalCode", e.target.value)} value={formData.postalCode} /></label>
                  </div>
                  <label className="order-field"><span>State</span><input onChange={(e) => updateField("state", e.target.value)} value={formData.state} /></label>
                </div>
              ) : (
                <div className="checkout-pickup-compact" style={{ marginTop: 18 }}>
                  <label className="order-field checkout-store-select">
                    <span>Choose pickup store</span>
                    <select onChange={(e) => setSelectedStoreId(e.target.value)} value={selectedStoreId}>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name} | {store.state}
                        </option>
                      ))}
                    </select>
                  </label>

                  <article className="pickup-store-button is-active checkout-selected-store">
                    <strong>{selectedPickupStore.name}</strong>
                    <p>{selectedPickupStore.address}</p>
                    <p>{selectedPickupStore.hours}</p>
                  </article>
                </div>
              )}
            </article>

            <article className="checkout-card checkout-card-compact checkout-card-schedule">
              <div className="checkout-header">
                <div>
                  <span className="eyebrow">Schedule</span>
                  <h3>Delivery/Pickup Timing</h3>
                </div>
                <span className="checkout-card-chip">Step 3</span>
              </div>
              <div className="checkout-form-grid two-up">
                <label className="order-field"><span>Date *</span><input min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} onChange={(e) => updateField("deliveryDate", e.target.value)} type="date" value={formData.deliveryDate} /></label>
                <label className="order-field"><span>Preferred Time</span><input onChange={(e) => updateField("deliveryTime", e.target.value)} type="time" value={formData.deliveryTime} /></label>
              </div>
              <label className="order-field" style={{ marginTop: 16 }}>
                <span>Special Instructions</span>
                <textarea onChange={(e) => updateField("instructions", e.target.value)} placeholder="Message on cake, gate code, pickup note..." value={formData.instructions} />
              </label>

              <div className="checkout-addon-panel">
                <div className="checkout-addon-copy">
                  <span className="eyebrow">Celebration add-on</span>
                  <h4>Candles</h4>
                  <p>Let us know if you want candles packed with the order, and how many to include.</p>
                </div>
                <div className="checkout-choice-grid">
                  <button
                    className={includeCandles ? "checkout-choice-button" : "checkout-choice-button is-active"}
                    onClick={() => setIncludeCandles(false)}
                    type="button"
                  >
                    No candles
                  </button>
                  <button
                    className={includeCandles ? "checkout-choice-button is-active" : "checkout-choice-button"}
                    onClick={() => setIncludeCandles(true)}
                    type="button"
                  >
                    Add candles
                  </button>
                </div>
                {includeCandles ? (
                  <div className="checkout-addon-stepper">
                    <span>How many candles?</span>
                    <div className="quantity-stepper">
                      <button onClick={() => setCandleQuantity((current) => Math.max(1, current - 1))} type="button">
                        <Minus size={14} />
                      </button>
                      <span>{candleQuantity}</span>
                      <button onClick={() => setCandleQuantity((current) => current + 1)} type="button">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </article>

            <article className="checkout-card checkout-card-compact checkout-card-payment">
              <div className="checkout-header">
                <div>
                  <span className="eyebrow">Payment</span>
                  <h3>Choose a payment method</h3>
                </div>
                <span className="checkout-card-chip">Step 4</span>
              </div>

              <div className="payment-options">
                <button className={paymentMethod === "card" ? "payment-method-button is-active" : "payment-method-button"} onClick={() => setPaymentMethod("card")} type="button">
                  <CreditCard size={20} />
                  <span>Credit/Debit Card</span>
                </button>
                <button className={paymentMethod === "online" ? "payment-method-button is-active" : "payment-method-button"} onClick={() => setPaymentMethod("online")} type="button">
                  <Landmark size={20} />
                  <span>Online Banking</span>
                </button>
                <button className={paymentMethod === "ewallet" ? "payment-method-button is-active" : "payment-method-button"} onClick={() => setPaymentMethod("ewallet")} type="button">
                  <Smartphone size={20} />
                  <span>E-Wallet</span>
                </button>
              </div>

              {paymentMethod === "card" ? (
                <div className="checkout-form-grid" style={{ marginTop: 18 }}>
                  <label className="order-field"><span>Card Number</span><input onChange={(e) => updateField("cardNumber", e.target.value)} value={formData.cardNumber} /></label>
                  <label className="order-field"><span>Cardholder Name</span><input onChange={(e) => updateField("cardName", e.target.value)} value={formData.cardName} /></label>
                  <div className="checkout-form-grid two-up">
                    <label className="order-field"><span>Expiry Date</span><input onChange={(e) => updateField("expiryDate", e.target.value)} placeholder="MM/YY" value={formData.expiryDate} /></label>
                    <label className="order-field"><span>CVV</span><input onChange={(e) => updateField("cvv", e.target.value)} value={formData.cvv} /></label>
                  </div>
                </div>
              ) : paymentMethod === "online" ? (
                <div className="checkout-form-grid" style={{ marginTop: 18 }}>
                  <label className="order-field">
                    <span>Choose your bank</span>
                    <select onChange={(e) => setSelectedBank(e.target.value)} value={selectedBank}>
                      {malaysiaBanks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="order-note">
                    You&apos;ll be redirected to {selectedBank}&apos;s online banking portal to complete
                    the payment securely.
                  </div>
                </div>
              ) : (
                <div className="order-note" style={{ marginTop: 18 }}>
                  <label className="order-field">
                    <span>Choose your e-wallet</span>
                    <select onChange={(e) => setSelectedEwallet(e.target.value)} value={selectedEwallet}>
                      {ewalletOptions.map((wallet) => (
                        <option key={wallet} value={wallet}>
                          {wallet}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div style={{ marginTop: 12 }}>
                    You&apos;ll continue with {selectedEwallet} to complete payment after reviewing
                    your order.
                  </div>
                </div>
              )}
            </article>
          </div>

          <section className="checkout-complete-shell reveal reveal-right">
            <article className="summary-card checkout-summary-card checkout-summary-modern checkout-complete-card">
              <div className="checkout-summary-topline">
                <span className="eyebrow">Order summary</span>
                <span className="checkout-summary-badge">Complete order</span>
              </div>
              <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              <div className="summary-row"><span>{deliveryMethod === "delivery" ? "Delivery Fee" : "Pickup"}</span><strong>{formatCurrency(deliveryFee)}</strong></div>
              <div className="summary-row"><span>Tax (6%)</span><strong>{formatCurrency(tax)}</strong></div>
              <div className="checkout-total-panel">
                <div className="summary-row is-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
                <small>Secure checkout. Final payment method is confirmed on the next step.</small>
              </div>
              <button
                className="button button-primary checkout-submit-button"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Saving Order..." : "Complete Order"}
              </button>
              {note ? <div className="order-note">{note}</div> : null}
              <p className="checkout-terms-note">
                By placing your order, you agree to our Terms & Conditions.
              </p>
            </article>
          </section>
        </form>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<section className="page-section" data-nav-theme="light"><div className="site-container">Loading checkout...</div></section>}>
      <CheckoutContent />
    </Suspense>
  );
}
