import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { toggleWishlist } from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const ProductCard = ({ product, initialSaved = false }) => {
  const inStock = product.stock > 0;
  const isLowStock = inStock && product.stock <= 10;
  const { addToast } = useToast();

  // Simulated original MSRP price for discount visual display
  const originalPrice = Math.round(product.price * 1.25);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  // ── Wishlist state ─────────────────────────────────────────
  const [saved, setSaved] = useState(initialSaved);
  const [wishlistStatus, setWishlistStatus] = useState("idle");
  const [wishlistError, setWishlistError] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  useEffect(() => {
    if (!hasInteracted) {
      setSaved(initialSaved);
    }
  }, [initialSaved, hasInteracted]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistStatus === "saving") return;
    setHasInteracted(true);
    setWishlistStatus("saving");
    setWishlistError("");
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 500);

    try {
      const data = await toggleWishlist(product._id);
      setSaved(data.saved);
      setWishlistStatus("idle");
      if (addToast) {
        addToast(
          data.saved ? `${product.name} saved to wishlist!` : `Removed from wishlist.`,
          data.saved ? "success" : "info"
        );
      }
    } catch {
      setWishlistStatus("error");
      setWishlistError("Unable to save. Try again.");
    }
  };

  // ── Cart state ─────────────────────────────────────────────
  const { addItem, isInCart, isActionLoading } = useCart();
  const inCart = isInCart(product._id);
  const cartBusy = isActionLoading(product._id);
  const [cartError, setCartError] = useState("");
  const [addedJustNow, setAddedJustNow] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (cartBusy || !inStock) return;
    setCartError("");
    const result = await addItem(product._id);
    if (!result.success) {
      setCartError(result.message || "Unable to add to cart.");
    } else {
      setAddedJustNow(true);
      setTimeout(() => setAddedJustNow(false), 1800);
      if (addToast) {
        addToast(`Added "${product.name}" to your cart!`, "success", {
          label: "View Cart"
        });
      }
    }
  };

  const cartLabel = () => {
    if (cartBusy) return "Adding...";
    if (addedJustNow) return "✓ Added!";
    if (inCart) return "Add Another";
    return "Add to Cart";
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link to={`/products/${product._id}`} className="product-image-link">
          <img
            className="product-image"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        </Link>

        {/* Badges container */}
        <div className="product-badges">
          {discountPercent > 0 && inStock && (
            <span className="discount-badge">{discountPercent}% OFF</span>
          )}
          <span className={`stock-badge ${!inStock ? "out-of-stock" : isLowStock ? "low-stock" : "in-stock"}`}>
            {!inStock ? "Out of Stock" : isLowStock ? `Only ${product.stock} Left!` : "In Stock"}
          </span>
        </div>

        {/* Floating Heart Button */}
        <button
          className={`wishlist-heart-btn ${saved ? "saved" : ""} ${heartAnim ? "heart-pop" : ""}`}
          onClick={handleWishlistToggle}
          disabled={wishlistStatus === "saving"}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          title={saved ? "Saved in Wishlist" : "Save to Wishlist"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div className="product-body">
        <div className="product-category-row">
          <span className="product-category-tag">{product.category}</span>
          <span className="product-rating">
            <span className="rating-star">★</span> 4.8 <span className="rating-count">(96)</span>
          </span>
        </div>

        <h3 className="product-name">
          <Link to={`/products/${product._id}`} title={product.name}>
            {product.name}
          </Link>
        </h3>

        <div className="product-price-row">
          <div className="price-stack">
            <span className="product-price">{formatPrice(product.price)}</span>
            {discountPercent > 0 && (
              <span className="product-original-price">{formatPrice(originalPrice)}</span>
            )}
          </div>
          <span className="product-shipping-tag">Free Delivery</span>
        </div>

        {wishlistStatus === "error" && (
          <p className="wishlist-error-inline">{wishlistError}</p>
        )}
        {cartError && (
          <p className="wishlist-error-inline">{cartError}</p>
        )}

        <div className="card-actions">
          <button
            id={`cart-btn-${product._id}`}
            className={`main-button card-button ${addedJustNow ? "btn-added-state" : ""} ${inCart ? "in-cart-btn" : ""}`}
            onClick={handleAddToCart}
            disabled={cartBusy || !inStock}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>{cartLabel()}</span>
          </button>

          <Link className="outline-button card-button view-details-btn" to={`/products/${product._id}`}>
            <span>Details</span>
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

export default ProductCard;
