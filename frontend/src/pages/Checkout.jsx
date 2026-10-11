import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  createPaymentOrder as apiCreatePaymentOrder,
  verifyPayment as apiVerifyPayment
} from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

// ── Load Razorpay Checkout script dynamically ─────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Field-level validation ────────────────────────────────────
const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!/^\d{10}$/.test(form.phone.trim()))
    errors.phone = "Phone must be a valid 10-digit number.";
  if (!form.addressLine1.trim()) errors.addressLine1 = "Address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";
  if (!/^\d{6}$/.test(form.pincode.trim()))
    errors.pincode = "Pincode must be exactly 6 digits.";
  return errors;
};

const Checkout = () => {
  const { cartItems, loading: cartLoading, subtotal, totalQuantity, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Redirect if cart is empty (guard)
  if (!cartLoading && cartItems.length === 0) {
    return (
      <main className="cart-page">
        <Navbar />
        <section className="cart-content">
          <div className="state-box wishlist-empty">
            <div className="state-icon-wrap empty-cart-icon">🛒</div>
            <p className="state-title">Your shopping bag is empty</p>
            <p className="state-note">Add products to your cart before proceeding to checkout.</p>
            <Link className="main-button card-button" to="/products">Browse Catalogue</Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    // ── 1. Client-side validation ──────────────────────────────
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPlacing(true);

    try {
      // ── 2. Load Razorpay script ────────────────────────────────
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Check your internet connection.");
        setPlacing(false);
        return;
      }

      // ── 3. Create ShopKart pending order + Razorpay order ────────
      const data = await apiCreatePaymentOrder(form);

      // ── 4. Open Razorpay Standard Checkout ───────────────────────
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order Payment",
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          try {
            // ── 5. Send payment credentials to backend for HMAC verification ──
            const result = await apiVerifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (result.success) {
              // ── 6. Clear global cart state → Navbar becomes Cart (0) ──
              clearCart();
              if (addToast) addToast("Payment verified! Order confirmed successfully.", "success");
              // ── 7. Navigate to success page ──────────────────────────
              navigate(`/order-success/${result.order._id}`);
            } else {
              setError("Payment verification failed. Your cart has not been cleared.");
              setPlacing(false);
            }
          } catch (verifyErr) {
            const msg = verifyErr.response?.data?.message || "Payment verification failed.";
            setError(msg + " Your cart has not been cleared. Please try again.");
            setPlacing(false);
          }
        },

        prefill: {
          name: form.fullName,
          contact: form.phone
        },

        theme: { color: "#10b981" },

        modal: {
          ondismiss: () => {
            setPlacing(false);
            setError("Payment was cancelled. Your cart items remain intact.");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}. Your cart has not been cleared.`);
        setPlacing(false);
      });

      paymentObject.open();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
      setPlacing(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma", type: "text" },
    { name: "phone", label: "Phone Number (10 digits)", placeholder: "9876543210", type: "tel" },
    { name: "addressLine1", label: "Street Address", placeholder: "Flat / House No., Landmark, Area", type: "text" },
    { name: "city", label: "City", placeholder: "Bengaluru", type: "text" },
    { name: "state", label: "State", placeholder: "Karnataka", type: "text" },
    { name: "pincode", label: "Pincode (6 digits)", placeholder: "560001", type: "text" }
  ];

  return (
    <main className="checkout-page">
      <Navbar />

      <section className="checkout-content">
        {/* Checkout Header with Stepper */}
        <div className="checkout-head-banner">
          <div className="banner-badge">Encrypted Checkout</div>
          <h1>Shipping & Payment</h1>

          {/* Stepper */}
          <div className="checkout-stepper">
            <div className="step-item step-completed">
              <span className="step-circle">✓</span>
              <span className="step-label">Bag</span>
            </div>
            <div className="step-connector step-connector-active"></div>
            <div className="step-item step-current">
              <span className="step-circle">2</span>
              <span className="step-label">Address</span>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <span className="step-circle">3</span>
              <span className="step-label">Payment</span>
            </div>
          </div>
        </div>

        <div className="checkout-layout">
          {/* ── Left: Shipping Form ── */}
          <div className="checkout-form-section">
            <div className="checkout-card-box">
              <div className="card-box-header">
                <h2 className="section-heading">Shipping Address</h2>
                <Link className="back-link" to="/cart">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span>Edit Bag</span>
                </Link>
              </div>
              <p className="checkout-subnote">Please enter your verified doorstep delivery address.</p>

              <form id="checkout-form" className="checkout-form" onSubmit={handlePlaceOrder} noValidate>
                <div className="checkout-form-grid">
                  {fields.map(({ name, label, placeholder, type }) => (
                    <div key={name} className="form-group">
                      <label className="form-label" htmlFor={`field-${name}`}>
                        {label} <span className="required-star">*</span>
                      </label>
                      <input
                        id={`field-${name}`}
                        name={name}
                        type={type}
                        className={`form-input ${fieldErrors[name] ? "input-error" : ""}`}
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={handleChange}
                        disabled={placing}
                      />
                      {fieldErrors[name] && (
                        <p className="field-error">{fieldErrors[name]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="checkout-error-box">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button
                  id="place-order-btn"
                  type="submit"
                  className="main-button checkout-btn place-order-btn"
                  disabled={placing || cartLoading}
                >
                  {placing ? (
                    <span className="btn-loading">
                      <span className="spinner-sm" /> Opening Razorpay Gateway...
                    </span>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>Pay {formatPrice(subtotal)} with Razorpay</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <aside className="order-summary checkout-summary">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-rows">
              {cartItems.map((item) => (
                <div key={item.product._id} className="summary-row">
                  <div className="summary-item-info">
                    <img
                      className="summary-item-img"
                      src={item.product.image}
                      alt={item.product.name}
                    />
                    <span className="summary-item-name">
                      {item.product.name}
                      <span className="summary-qty"> × {item.quantity}</span>
                    </span>
                  </div>
                  <span className="summary-item-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-breakdown-row">
              <span>Items Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-breakdown-row">
              <span>Doorstep Shipping</span>
              <strong className="free-shipping-text">FREE</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span className="summary-total-label">
                Total Payable ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
              </span>
              <span className="summary-total-price">{formatPrice(subtotal)}</span>
            </div>

            <div className="secure-badge-box">
              <span className="lock-icon">🔒</span>
              <div>
                <p className="secure-badge-title">Secured by Razorpay</p>
                <p className="secure-badge-sub">256-bit encryption • Instant UPI, Credit/Debit cards & NetBanking</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Checkout;
