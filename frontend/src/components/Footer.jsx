import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";

const Footer = () => {
  const [email, setEmail] = useState("");
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      if (addToast) addToast("Please enter a valid email address.", "error");
      return;
    }
    if (addToast) {
      addToast("Thank you for subscribing! Your ₹500 welcome voucher has been sent to your email.", "success");
    }
    setEmail("");
  };

  return (
    <footer className="site-footer">
      <div className="footer-top-strip">
        <div className="footer-container footer-features-row">
          <div className="footer-feature-item">
            <div className="footer-feature-icon">⚡</div>
            <div>
              <h4>Express Delivery</h4>
              <p>Lightning fast doorstep delivery across all pin codes</p>
            </div>
          </div>
          <div className="footer-feature-item">
            <div className="footer-feature-icon">🛡️</div>
            <div>
              <h4>100% Authentic</h4>
              <p>Direct from verified brand partners & manufacturers</p>
            </div>
          </div>
          <div className="footer-feature-item">
            <div className="footer-feature-icon">💳</div>
            <div>
              <h4>Secure Payments</h4>
              <p>Razorpay encrypted gateway with UPI, Cards & NetBanking</p>
            </div>
          </div>
          <div className="footer-feature-item">
            <div className="footer-feature-icon">🔄</div>
            <div>
              <h4>Hassle-Free Returns</h4>
              <p>14-day replacement guarantee with instant pickup</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-container footer-grid">
          {/* Brand info */}
          <div className="footer-col footer-brand-col">
            <Link className="brand footer-brand" to="/home">
              <span className="brand-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </span>
              <span className="brand-text">Shop<span className="brand-highlight">Kart</span></span>
            </Link>
            <p className="footer-tagline">
              Your premier destination for high-end gadgets, trendsetting fashion, curated literature, and elegant home essentials. Designed for discerning shoppers.
            </p>
            <div className="footer-social-links">
              <span className="social-badge" title="Verified Store">🛡️ Verified Merchant</span>
              <span className="social-badge" title="Active 24/7">⚡ 24/7 Support</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h3 className="footer-title">Navigation</h3>
            <ul className="footer-links">
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">Order History</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h3 className="footer-title">Categories</h3>
            <ul className="footer-links">
              <li><Link to="/products?category=Electronics">Electronics & Audio</Link></li>
              <li><Link to="/products?category=Fashion">Fashion & Apparel</Link></li>
              <li><Link to="/products?category=Books">Books & Best Sellers</Link></li>
              <li><Link to="/products?category=Home">Home & Living</Link></li>
              <li><Link to="/products">Trending Offers</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-col footer-newsletter-col">
            <h3 className="footer-title">Join The Club</h3>
            <p className="footer-subtext">
              Subscribe to get exclusive member perks, early access to seasonal sales, and ₹500 off your first purchase.
            </p>
            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-wrap">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn">
                  Join
                </button>
              </div>
            </form>
            <p className="newsletter-disclaimer">
              🔒 We respect your privacy. Unsubscribe anytime with 1 click.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <p className="footer-copyright">
            © {new Date().getFullYear()} ShopKart Inc. All rights reserved. Crafting premium digital commerce.
          </p>
          <div className="footer-payment-badges">
            <span className="payment-tag">Razorpay</span>
            <span className="payment-tag">UPI</span>
            <span className="payment-tag">Visa</span>
            <span className="payment-tag">Mastercard</span>
            <span className="payment-tag">RuPay</span>
            <span className="payment-tag">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
