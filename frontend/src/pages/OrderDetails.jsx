import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { getOrderById } from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        const msg = err.response?.status === 403
          ? "You don't have permission to view this order."
          : "Order not found.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const currentIdx = order ? STATUS_STEPS.indexOf(order.status) : 0;

  return (
    <main className="orders-page">
      <Navbar />

      <section className="orders-content">
        <div className="orders-head-banner">
          <Link className="back-link" to="/orders">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to All Orders</span>
          </Link>
          <div className="banner-badge" style={{ marginTop: "14px" }}>Order Specification & Receipt</div>
          <h1>Order Details</h1>
        </div>

        {loading && (
          <div className="state-box">
            <div className="spinner" />
            <p className="state-title">Loading order details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box state-error">
            <div className="state-icon-wrap">⚠️</div>
            <p className="state-title">{error}</p>
            <Link className="main-button card-button" to="/orders">Back to Orders</Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="order-detail-card">
            {/* Header */}
            <div className="order-detail-head">
              <div>
                <p className="order-id">Order Reference: #{order._id.slice(-8).toUpperCase()}</p>
                <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="order-badges">
                <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
                <span className={`payment-badge payment-${order.paymentStatus.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Tracking progress */}
            <div className="order-progress-stepper" style={{ margin: "20px 0" }}>
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step} className={`stepper-node ${isDone ? "node-done" : ""} ${isCurrent ? "node-current" : ""}`}>
                    <div className="stepper-dot">
                      {isDone ? "✓" : idx + 1}
                    </div>
                    <span className="stepper-text">{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Items */}
            <div className="order-detail-section">
              <h2 className="detail-section-title">Purchased Items</h2>
              {order.items.map((item, i) => (
                <div key={i} className="order-detail-item">
                  {item.image && (
                    <img className="order-detail-img" src={item.image} alt={item.name} />
                  )}
                  <div className="order-detail-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-unit-price">
                      {formatPrice(item.price)} each × {item.quantity} units
                    </p>
                  </div>
                  <p className="order-item-line-total">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="order-detail-total">
                <span>Total Amount Paid</span>
                <span className="order-total-price">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Shipping */}
            <div className="order-detail-section">
              <h2 className="detail-section-title">Delivery Address</h2>
              <div className="shipping-detail">
                <p className="shipping-name"><strong>{order.shippingAddress.fullName}</strong></p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p>📞 {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment info */}
            {order.razorpayPaymentId && (
              <div className="order-detail-section">
                <h2 className="detail-section-title">Razorpay Payment Verification</h2>
                <div className="payment-ref-box">
                  <span className="payment-ref-label">Transaction ID:</span>
                  <span className="mono">{order.razorpayPaymentId}</span>
                </div>
              </div>
            )}

            <div className="order-detail-actions">
              <button
                className="outline-button card-button"
                onClick={() => window.print()}
              >
                🖨️ Print Invoice
              </button>
              <Link className="main-button card-button" to="/orders">
                Back to Orders
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default OrderDetails;
