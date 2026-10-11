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
    year: "numeric"
  });

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch {
        setError("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  return (
    <main className="orders-page">
      <Navbar />

      <section className="orders-content">
        {loading && (
          <div className="state-box">
            <div className="spinner" />
            <p className="state-title">Confirming order details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box state-error">
            <p className="state-icon">⚠️</p>
            <p className="state-title">{error}</p>
            <Link className="main-button card-button" to="/orders">My Orders</Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="success-card">
            <div className="success-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 className="success-title">Order Placed Successfully!</h1>
            <p className="success-subtitle">
              Thank you for shopping with ShopKart. Your payment has been verified via Razorpay and your order is confirmed.
            </p>

            <div className="success-meta">
              <div className="success-row">
                <span className="success-label">Order Reference</span>
                <span className="success-value mono">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="success-row">
                <span className="success-label">Order Date</span>
                <span className="success-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="success-row">
                <span className="success-label">Order Status</span>
                <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="success-row">
                <span className="success-label">Payment Status</span>
                <span className={`payment-badge payment-${order.paymentStatus.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="success-items">
              <h3 className="success-section-title">Purchased Items</h3>
              {order.items.map((item, i) => (
                <div key={i} className="success-item-row">
                  {item.image && (
                    <img className="success-item-img" src={item.image} alt={item.name} />
                  )}
                  <span className="success-item-name">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="success-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="success-total">
              <span>Total Paid</span>
              <span className="success-total-price">{formatPrice(order.totalAmount)}</span>
            </div>

            <div className="success-shipping">
              <h3 className="success-section-title">Delivery Address</h3>
              <p className="shipping-person"><strong>{order.shippingAddress.fullName}</strong></p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                {order.shippingAddress.pincode}
              </p>
              <p className="shipping-phone">📞 {order.shippingAddress.phone}</p>
            </div>

            <div className="success-actions">
              <Link id="view-orders-btn" className="main-button card-button" to="/orders">
                View My Orders
              </Link>
              <button
                className="outline-button card-button"
                onClick={() => window.print()}
              >
                🖨️ Print Receipt
              </button>
              <Link className="outline-button card-button" to="/products">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default OrderSuccess;
