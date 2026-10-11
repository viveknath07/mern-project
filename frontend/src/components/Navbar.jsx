import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const Navbar = ({ wishlistCount }) => {
  const { customer, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar-header">
      <nav className="navbar">
        <div className="nav-left">
          <Link className="brand" to="/home">
            <span className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </span>
            <span className="brand-text">Shop<span className="brand-highlight">Kart</span></span>
            <span className="brand-edition-tag">PRO</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            <Link className={`nav-link ${isActive("/home") ? "active" : ""}`} to="/home">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </Link>

            <Link className={`nav-link ${isActive("/products") ? "active" : ""}`} to="/products">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>Products</span>
            </Link>

            <Link className={`nav-link wishlist-nav-link ${isActive("/wishlist") ? "active" : ""}`} to="/wishlist" id="nav-wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>Wishlist</span>
              {typeof wishlistCount === "number" && wishlistCount > 0 && (
                <span className="wishlist-count-badge pulse-badge">{wishlistCount}</span>
              )}
            </Link>

            <Link className={`nav-link cart-nav-link ${isActive("/cart") ? "active" : ""}`} to="/cart" id="nav-cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Cart</span>
              {totalQuantity > 0 && (
                <span className="cart-count-badge pulse-badge">{totalQuantity}</span>
              )}
            </Link>

            <Link className={`nav-link ${isActive("/orders") ? "active" : ""}`} to="/orders" id="nav-orders">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <span>Orders</span>
            </Link>
          </div>
        </div>

        {customer ? (
          <div className="nav-right">
            <div className="user-pill" title={customer.email}>
              <div className="user-avatar-wrap">
                <div className="user-avatar">{getInitials(customer.fullName)}</div>
                <span className="status-online-dot"></span>
              </div>
              <div className="user-pill-info">
                <span className="user-name">{customer.fullName}</span>
                <span className="user-membership-label">Prime Member</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout} title="Logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        ) : (
          <div className="nav-right">
            <Link to="/login" className="outline-button nav-auth-btn">Login</Link>
            <Link to="/register" className="main-button nav-auth-btn">Register</Link>
          </div>
        )}
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-links">
            <Link className={`mobile-nav-link ${isActive("/home") ? "active" : ""}`} to="/home" onClick={() => setMobileMenuOpen(false)}>
              🏠 Home
            </Link>
            <Link className={`mobile-nav-link ${isActive("/products") ? "active" : ""}`} to="/products" onClick={() => setMobileMenuOpen(false)}>
              🛍️ Products Catalogue
            </Link>
            <Link className={`mobile-nav-link ${isActive("/wishlist") ? "active" : ""}`} to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
              ❤️ Wishlist {typeof wishlistCount === "number" && wishlistCount > 0 ? `(${wishlistCount})` : ""}
            </Link>
            <Link className={`mobile-nav-link ${isActive("/cart") ? "active" : ""}`} to="/cart" onClick={() => setMobileMenuOpen(false)}>
              🛒 Cart {totalQuantity > 0 ? `(${totalQuantity})` : ""}
            </Link>
            <Link className={`mobile-nav-link ${isActive("/orders") ? "active" : ""}`} to="/orders" onClick={() => setMobileMenuOpen(false)}>
              📦 My Orders
            </Link>
            {customer && (
              <button className="mobile-nav-logout" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                🚪 Logout ({customer.fullName})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
