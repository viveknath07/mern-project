import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getOrders, getProducts, getWishlist } from "../services/api.js";

const Home = () => {
  const { customer } = useAuth();
  const { totalQuantity } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [orderCount, setOrderCount] = useState(0);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    // Fetch products, wishlist, and orders for mini dashboard & featured section
    const loadHomeData = async () => {
      try {
        const [prodData, wishData, orderData] = await Promise.allSettled([
          getProducts({}),
          getWishlist(),
          getOrders()
        ]);

        if (prodData.status === "fulfilled" && prodData.value?.products) {
          // Take first 4 products as featured picks
          setFeaturedProducts(prodData.value.products.slice(0, 4));
        }

        if (wishData.status === "fulfilled" && wishData.value?.wishlist) {
          setSavedIds(new Set(wishData.value.wishlist.map((p) => p._id)));
        }

        if (orderData.status === "fulfilled" && orderData.value?.orders) {
          setOrderCount(orderData.value.orders.length);
        }
      } catch {
        /* non-critical */
      } finally {
        setLoadingFeatured(false);
      }
    };

    loadHomeData();
  }, []);

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText("SHOPKART");
    setCopiedCoupon(true);
    if (addToast) addToast("Coupon 'SHOPKART' copied to clipboard!", "success");
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const categories = [
    {
      name: "Electronics",
      tagline: "Audio, Gear & Modern Gadgets",
      badge: "Trending",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      )
    },
    {
      name: "Fashion",
      tagline: "Curated Apparel & Streetwear",
      badge: "New Style",
      gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
        </svg>
      )
    },
    {
      name: "Books",
      tagline: "Best Sellers & Life Classics",
      badge: "Essential",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
    {
      name: "Home",
      tagline: "Modern Decor & Living Accents",
      badge: "Popular",
      gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    }
  ];

  return (
    <main className="home-page">
      <Navbar wishlistCount={savedIds.size} />

      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-ambient-glow"></div>
          <div className="hero-content">
            <div className="welcome-badge">
              <span className="pulse-dot"></span>
              <span>ShopKart Prime Member: <strong>{customer.fullName}</strong></span>
            </div>

            <h1 className="hero-title">
              Curated Commerce <br />
              <span className="hero-gradient-text">Crafted for Excellence.</span>
            </h1>

            <p className="home-note">
              Explore an elevated collection of verified electronics, designer fashion, celebrated literature, and minimalist home aesthetics. Fast, authentic, and seamless.
            </p>

            {/* Category Quick Chips */}
            <div className="hero-category-chips">
              <span className="chips-label">Quick Jump:</span>
              {categories.map((c) => (
                <button
                  key={c.name}
                  className="hero-chip-btn"
                  onClick={() => navigate(`/products?category=${c.name}`)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="hero-actions">
              <Link className="main-button hero-cta" to="/products">
                <span>Explore Full Catalogue</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <Link className="secondary-button hero-secondary-cta" to="/cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Cart ({totalQuantity})</span>
              </Link>
              <Link className="secondary-button hero-secondary-cta" to="/wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>Saved ({savedIds.size})</span>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="hero-stats-row">
              <div className="stat-item">
                <span className="stat-number">4.9 ★</span>
                <span className="stat-label">Customer Rating</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Verified Authentic</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">Express</span>
                <span className="stat-label">Doorstep Delivery</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">Razorpay</span>
                <span className="stat-label">Bank-Grade Gateway</span>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Voucher Banner */}
        <section className="promo-strip-card">
          <div className="promo-strip-content">
            <div className="promo-badge">Limited Time Offer</div>
            <div className="promo-text-wrap">
              <h3>Get 10% Off On Your Entire Order</h3>
              <p>Apply code <strong>SHOPKART</strong> or <strong>SAVE10</strong> during cart checkout.</p>
            </div>
          </div>
          <button className="promo-copy-btn" onClick={handleCopyCoupon}>
            {copiedCoupon ? "✓ Copied to Clipboard!" : "Copy Code: SHOPKART"}
          </button>
        </section>

        {/* Featured Picks Section */}
        {featuredProducts.length > 0 && (
          <section className="featured-section">
            <div className="section-head-split">
              <div>
                <div className="badge-pill">Curated Highlights</div>
                <h2 className="section-title">Trending This Week</h2>
                <p className="section-subtitle">Hand-picked top tier products trending across all categories</p>
              </div>
              <Link to="/products" className="view-all-link">
                <span>View Full Catalogue</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>

            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  initialSaved={savedIds.has(product._id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="categories-section">
          <div className="section-head">
            <div className="badge-pill">Department Catalogue</div>
            <h2>Shop by Category</h2>
            <p>Explore distinct collections tailored to your lifestyle and needs</p>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/products?category=${cat.name}`)}
              >
                <div className="category-top-row">
                  <div className="category-icon-wrap" style={{ background: cat.gradient }}>
                    {cat.icon}
                  </div>
                  <span className="category-badge-chip">{cat.badge}</span>
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.tagline}</p>
                <div className="category-card-footer">
                  <span className="explore-text">Explore Category</span>
                  <span className="category-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Dashboard Card */}
        <section className="profile-dashboard-section">
          <div className="profile-box">
            <div className="profile-box-header">
              <div className="profile-avatar-lg">{getInitials(customer.fullName)}</div>
              <div>
                <h2>{customer.fullName}</h2>
                <span className="member-badge">Active ShopKart Prime Member</span>
              </div>
            </div>

            <div className="profile-stats-grid">
              <div className="profile-stat-box" onClick={() => navigate("/cart")}>
                <span className="profile-stat-number">{totalQuantity}</span>
                <span className="profile-stat-label">Items in Cart</span>
                <span className="profile-stat-action">View Cart →</span>
              </div>
              <div className="profile-stat-box" onClick={() => navigate("/wishlist")}>
                <span className="profile-stat-number">{savedIds.size}</span>
                <span className="profile-stat-label">Saved in Wishlist</span>
                <span className="profile-stat-action">View Wishlist →</span>
              </div>
              <div className="profile-stat-box" onClick={() => navigate("/orders")}>
                <span className="profile-stat-number">{orderCount}</span>
                <span className="profile-stat-label">Completed Orders</span>
                <span className="profile-stat-action">Order History →</span>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-card-item">
                <span className="profile-label">Email Address</span>
                <strong className="profile-value">{customer.email}</strong>
              </div>
              <div className="profile-card-item">
                <span className="profile-label">Phone Number</span>
                <strong className="profile-value">{customer.phone}</strong>
              </div>
              <div className="profile-card-item">
                <span className="profile-label">Membership Status</span>
                <strong className="profile-value status-active-text">Verified Member</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Row */}
        <section className="perks-row">
          <div className="perk-card">
            <div className="perk-icon">🚚</div>
            <h4>Express Doorstep Delivery</h4>
            <p>Free standard shipping on orders above ₹999</p>
          </div>
          <div className="perk-card">
            <div className="perk-icon">🛡️</div>
            <h4>100% Genuine Guarantee</h4>
            <p>Direct authentic sourcing with original warranty</p>
          </div>
          <div className="perk-card">
            <div className="perk-icon">↺</div>
            <h4>Hassle-Free Returns</h4>
            <p>14-day replacement window with quick pickup</p>
          </div>
          <div className="perk-card">
            <div className="perk-icon">💳</div>
            <h4>Razorpay Protection</h4>
            <p>256-bit bank encrypted UPI & Cards checkout</p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
};

export default Home;
