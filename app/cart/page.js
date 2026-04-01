"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, getSizeOptionByKey } from "../components/site/data";
import { useCart } from "../components/site/CartProvider";

export default function CartPage() {
  const router = useRouter();
  const { isHydrated, items, removeItem, updateQuantity } = useCart();
  const [selectedIds, setSelectedIds] = useState([]);
  const [hasTouchedSelection, setHasTouchedSelection] = useState(false);

  const cartItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        size: getSizeOptionByKey(item.sizeKey)
      })),
    [items]
  );

  const effectiveSelectedIds = hasTouchedSelection
    ? selectedIds
    : cartItems.map((item) => item.id);

  const selectedItems = cartItems.filter((item) => effectiveSelectedIds.includes(item.id));
  const selectedCount = selectedItems.reduce((total, item) => total + item.quantity, 0);
  const selectedSubtotal = selectedItems.reduce(
    (total, item) => total + item.size.price * item.quantity,
    0
  );

  function toggleSelection(id) {
    setHasTouchedSelection(true);
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
  }

  function proceedToCheckout() {
    if (selectedItems.length === 0) {
      return;
    }

    router.push(`/checkout?items=${selectedItems.map((item) => item.id).join(",")}`);
  }

  if (!isHydrated) {
    return (
      <section className="page-section" data-nav-theme="light">
        <div className="site-container">Loading your cart...</div>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="page-section" data-nav-theme="light">
        <div className="site-container cart-empty-state">
          <span className="eyebrow">Your Cart</span>
          <h1>Your cart is waiting for its first Peach Strudel.</h1>
          <p>Pick a size, add it to cart, and come back here when you&apos;re ready to check out.</p>
          <Link className="button button-primary button-icon" href="/buy-now?size=medium">
            <ShoppingBag size={16} />
            Start with the Peach Strudel
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section" data-nav-theme="light">
      <div className="site-container cart-page-grid">
        <div className="cart-page-stack">
          <div className="section-header cart-page-header">
            <span className="eyebrow">Your Cart</span>
            <h1>Choose what you want to bring to checkout.</h1>
            <p>Select the sizes you want, adjust quantities, and continue only with the items you&apos;re ready to order now.</p>
          </div>

          <div className="cart-selection-list">
            {cartItems.map((item) => {
              const isSelected = effectiveSelectedIds.includes(item.id);

              return (
                <article
                  key={item.id}
                  className={isSelected ? "cart-selection-card is-selected" : "cart-selection-card"}
                >
                  <label className="cart-selection-toggle">
                    <input
                      checked={isSelected}
                      onChange={() => toggleSelection(item.id)}
                      type="checkbox"
                    />
                    <span>Include in checkout</span>
                  </label>

                  <div className="cart-selection-body">
                    <img alt={item.size.display} src={item.size.image} />
                    <div className="cart-selection-copy">
                      <div className="cart-selection-head">
                        <div>
                          <span className="eyebrow">Selected size</span>
                          <h3>Peach Strudel {item.size.display}</h3>
                          <p>{item.size.dimensions} • {item.size.servings}</p>
                        </div>
                        <strong>{formatCurrency(item.size.price)}</strong>
                      </div>

                      <div className="cart-selection-actions">
                        <div className="quantity-stepper">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">
                            +
                          </button>
                        </div>

                        <button className="cart-remove-button" onClick={() => removeItem(item.id)} type="button">
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="summary-stack cart-checkout-summary">
            <article className="summary-card">
              <span className="eyebrow">Checkout selection</span>
              <h3>{selectedItems.length} item{selectedItems.length === 1 ? "" : "s"} selected</h3>
              <div className="summary-divider" />
              <div className="summary-row">
                <span>Total quantity</span>
                <strong>{selectedCount}</strong>
              </div>
              <div className="summary-row">
                <span>Items subtotal</span>
                <strong>{formatCurrency(selectedSubtotal)}</strong>
              </div>
              <button
                className="button button-primary button-icon"
                disabled={selectedItems.length === 0}
                onClick={proceedToCheckout}
                style={{ marginTop: 18, width: "100%" }}
                type="button"
              >
                <ArrowRight size={16} />
                Proceed to Checkout
              </button>
              <Link className="button button-outline" href="/buy-now?size=medium" style={{ marginTop: 12, width: "100%" }}>
                Add Another Strudel
              </Link>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
