import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem.jsx";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const FREE_SHIPPING_THRESHOLD = 999;

const Cart = () => {
  const { cartItems, loading, error, totalQuantity, subtotal, loadCart } = useCart();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
  const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = Math.max(0, subtotal + shippingCost - discountAmount);

  // Free shipping progress calculation
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyPromo = (codeToApply) => {
    const code = (codeToApply || promoCode).trim().toUpperCase();
    if (code === "SAVE10" || code === "SHOPKART") {
      setDiscountApplied(true);
      setPromoCode(code);
      if (addToast) addToast(`Promo "${code}" applied! 10% discount added.`, "success");
    } else {
      if (addToast) addToast("Invalid promo code. Try 'SHOPKART'", "error");
    }
  };

  return (
    <main className="cart-page">
      <Navbar />

      <section className="cart-content">
        <div className="cart-head-banner">
          <div className="banner-badge">Shopping Bag</div>
          <h1>My Cart</h1>
          {!loading && !error && cartItems.length > 0 && (
            <p className="cart-head-subtitle">
              You have <strong>{totalQuantity}</strong> {totalQuantity === 1 ? "item" : "items"} ready for checkout.
            </p>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="state-box">
            <div className="spinner" aria-label="Loading"></div>
            <p className="state-title">Loading your cart...</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="state-box state-error">
            <div className="state-icon-wrap">⚠️</div>
            <p className="state-title">Unable to load your cart.</p>
            <p className="state-note">{error}</p>
            <button
              id="retry-cart"
              className="main-button card-button"
              onClick={loadCart}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && cartItems.length === 0 && (
          <div className="state-box wishlist-empty">
            <div className="state-icon-wrap empty-cart-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <p className="state-title">Your shopping bag is empty</p>
            <p className="state-note">
              Looks like you haven't added any items to your shopping bag yet.
            </p>
            <Link
              id="browse-products-from-cart"
              className="main-button card-button"
              to="/products"
            >
              Explore Products
            </Link>
          </div>
        )}

        {/* ── Cart items + order summary ── */}
        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">
            {/* Items list */}
            <div className="cart-items-section">
              {/* Free shipping progress bar */}
              <div className="free-shipping-card">
                <div className="shipping-progress-text">
                  {amountNeededForFreeShipping === 0 ? (
                    <span className="unlocked-text">
                      🎉 <strong>Congratulations!</strong> You've unlocked FREE Express Shipping!
                    </span>
                  ) : (
                    <span>
                      Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more to unlock <strong>FREE Express Shipping</strong>!
                    </span>
                  )}
                </div>
                <div className="shipping-progress-track">
                  <div
                    className="shipping-progress-bar"
                    style={{ width: `${freeShippingProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="cart-section-title">
                <p className="result-count">
                  Bag Items (<strong>{totalQuantity}</strong>)
                </p>
              </div>

              <ul className="cart-list">
                {cartItems.map((item) => (
                  <CartItem key={item.product._id} item={item} />
                ))}
              </ul>
            </div>

            {/* Order summary sidebar */}
            <aside className="order-summary">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-rows">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="summary-row">
                    <span className="summary-item-name">
                      {item.product.name}
                      <span className="summary-qty"> × {item.quantity}</span>
                    </span>
                    <span className="summary-item-price">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-breakdown-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="summary-breakdown-row">
                <span>Shipping</span>
                <strong className={shippingCost === 0 ? "free-shipping-text" : ""}>
                  {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                </strong>
              </div>

              {discountApplied && (
                <div className="summary-breakdown-row discount-row">
                  <span>Promo Discount (10%)</span>
                  <strong>-{formatPrice(discountAmount)}</strong>
                </div>
              )}

              {/* Promo Code Form */}
              <div className="promo-box">
                <form
                  className="promo-code-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyPromo();
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={discountApplied}
                  />
                  <button type="submit" disabled={discountApplied || !promoCode.trim()}>
                    {discountApplied ? "Applied" : "Apply"}
                  </button>
                </form>

                {!discountApplied && (
                  <div className="promo-hint-row">
                    <span className="hint-label">Available:</span>
                    <button
                      type="button"
                      className="promo-chip"
                      onClick={() => handleApplyPromo("SHOPKART")}
                    >
                      SHOPKART (10% OFF)
                    </button>
                  </div>
                )}
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <span className="summary-total-label">Grand Total</span>
                <span className="summary-total-price">{formatPrice(grandTotal)}</span>
              </div>

              <button
                id="proceed-checkout"
                className="main-button checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Proceed to Checkout</span>
              </button>

              <div className="secure-checkout-note">
                🔒 256-Bit SSL Encrypted Razorpay Checkout
              </div>

              <Link className="continue-shopping-link" to="/products">
                ← Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Cart;
