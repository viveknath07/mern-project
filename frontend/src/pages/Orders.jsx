import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import { getOrders, updateOrderStatus } from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const OrderCard = ({ order, onStatusUpdate }) => {
  const [advancing, setAdvancing] = useState(false);

  const currentIdx = STATUS_STEPS.indexOf(order.status);
  const nextStatus = STATUS_STEPS[currentIdx + 1];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setAdvancing(true);
    try {
      const data = await updateOrderStatus(order._id, nextStatus);
      onStatusUpdate(data.order);
    } catch {
      /* silent */
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <article className="order-card">
      <div className="order-card-head">
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

      {/* Visual Tracking Stepper */}
      <div className="order-progress-stepper">
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

      <div className="order-card-items">
        {order.items.map((item, i) => (
          <div key={i} className="order-item-row">
            {item.image && (
              <img className="order-item-img" src={item.image} alt={item.name} />
            )}
            <div className="order-item-detail">
              <span className="order-item-name">{item.name}</span>
              <span className="order-item-unit-count">Quantity: {item.quantity}</span>
            </div>
            <span className="order-item-price">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="order-card-footer">
        <span className="order-total">Total Amount: <strong>{formatPrice(order.totalAmount)}</strong></span>
        <div className="order-card-actions">
          {nextStatus && order.paymentStatus === "PAID" && (
            <button
              className="outline-button card-button status-advance-btn"
              onClick={handleAdvance}
              disabled={advancing}
            >
              {advancing ? "Updating..." : `Advance to ${nextStatus}`}
            </button>
          )}
          <Link
            id={`view-order-${order._id}`}
            className="main-button card-button"
            to={`/orders/${order._id}`}
          >
            <span>View Receipt & Details</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState("ALL");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      setOrders(data.orders);
    } catch {
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (filterTab === "ACTIVE") return o.status !== "DELIVERED";
    if (filterTab === "DELIVERED") return o.status === "DELIVERED";
    return true;
  });

  return (
    <main className="orders-page">
      <Navbar />

      <section className="orders-content">
        <div className="orders-head-banner">
          <div className="banner-badge">Order History</div>
          <h1>My Orders</h1>
          <p className="orders-subtitle">Track deliveries, inspect payment receipts, and manage order status.</p>
        </div>

        {/* Filter Tabs */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-filter-tabs">
            <button
              className={`filter-tab-btn ${filterTab === "ALL" ? "active" : ""}`}
              onClick={() => setFilterTab("ALL")}
            >
              All Orders ({orders.length})
            </button>
            <button
              className={`filter-tab-btn ${filterTab === "ACTIVE" ? "active" : ""}`}
              onClick={() => setFilterTab("ACTIVE")}
            >
              In Progress ({orders.filter((o) => o.status !== "DELIVERED").length})
            </button>
            <button
              className={`filter-tab-btn ${filterTab === "DELIVERED" ? "active" : ""}`}
              onClick={() => setFilterTab("DELIVERED")}
            >
              Delivered ({orders.filter((o) => o.status === "DELIVERED").length})
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="state-box">
            <div className="spinner" />
            <p className="state-title">Loading your orders...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="state-box state-error">
            <div className="state-icon-wrap">⚠️</div>
            <p className="state-title">{error}</p>
            <button className="main-button card-button" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="state-box wishlist-empty">
            <div className="state-icon-wrap empty-cart-icon">📦</div>
            <p className="state-title">No orders yet</p>
            <p className="state-note">You haven't placed any orders yet. Discover our curated collection!</p>
            <Link className="main-button card-button" to="/products">
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="orders-list">
            <p className="result-count">
              Showing <strong>{filteredOrders.length}</strong> {filteredOrders.length === 1 ? "order" : "orders"}
            </p>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}

        {!loading && !error && orders.length > 0 && filteredOrders.length === 0 && (
          <div className="state-box empty-products-state">
            <p className="state-title">No orders matching this filter</p>
            <button className="main-button card-button" onClick={() => setFilterTab("ALL")}>
              Show All Orders
            </button>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Orders;
