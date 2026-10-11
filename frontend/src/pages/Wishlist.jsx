import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import WishlistCard from "../components/WishlistCard.jsx";
import { getWishlist, removeFromWishlist } from "../services/api.js";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null); // product._id being removed

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getWishlist();
      setWishlist(data.wishlist);
    } catch {
      setError("Something went wrong. We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      // Silently retry
    } finally {
      setRemoving(null);
    }
  };

  return (
    <main className="wishlist-page">
      <Navbar wishlistCount={wishlist.length} />

      <section className="wishlist-content">
        <div className="wishlist-head-banner">
          <div className="banner-badge">Saved Collection</div>
          <h1>My Wishlist</h1>
          {!loading && !error && wishlist.length > 0 && (
            <p className="wishlist-count-text">
              You have <strong>{wishlist.length}</strong> {wishlist.length === 1 ? "product" : "products"} saved for later.
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="wishlist-grid">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-body">
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-line medium"></div>
                  <div className="skeleton-line long"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-box state-error">
            <div className="state-icon-wrap">⚠️</div>
            <p className="state-title">Something went wrong.</p>
            <p className="state-note">{error}</p>
            <button
              id="retry-wishlist"
              className="main-button card-button"
              onClick={fetchWishlist}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="state-box wishlist-empty">
            <div className="state-icon-wrap empty-heart-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <p className="state-title">Your wishlist is empty</p>
            <p className="state-note">
              Explore products in our catalogue and tap the heart icon to save them here for easy access.
            </p>
            <Link
              id="browse-products-link"
              className="main-button card-button"
              to="/products"
            >
              Explore Products
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                removing={removing}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Wishlist;
