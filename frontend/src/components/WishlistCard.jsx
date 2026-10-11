import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const WishlistCard = ({ product, onRemove, removing }) => {
  const inStock = product.stock > 0;
  const { addItem, isActionLoading, isInCart } = useCart();
  const { addToast } = useToast();
  const cartBusy = isActionLoading(product._id);
  const inCart = isInCart(product._id);

  const handleAddToCart = async () => {
    if (cartBusy || !inStock) return;
    const result = await addItem(product._id);
    if (result.success && addToast) {
      addToast(`Added "${product.name}" to cart!`, "success", { label: "View Cart" });
    }
  };

  return (
    <article className="wishlist-card">
      <div className="wishlist-image-wrap">
        <img
          className="wishlist-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        <span className={`stock-badge ${inStock ? "in-stock" : "out-of-stock"}`}>
          {inStock ? `${product.stock} left` : "Out of stock"}
        </span>
      </div>

      <div className="wishlist-body">
        <span className="product-category-tag">{product.category}</span>
        <h3 className="wishlist-product-name">{product.name}</h3>
        <p className="wishlist-price">{formatPrice(product.price)}</p>

        <div className="wishlist-actions">
          <button
            className="main-button card-button"
            onClick={handleAddToCart}
            disabled={cartBusy || !inStock}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>{cartBusy ? "Adding..." : inCart ? "Add Another" : "Move to Cart"}</span>
          </button>

          <Link
            id={`view-${product._id}`}
            className="outline-button card-button"
            to={`/products/${product._id}`}
          >
            View Details
          </Link>

          <button
            id={`remove-${product._id}`}
            className="remove-button card-button"
            onClick={() => onRemove(product._id)}
            disabled={removing === product._id}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>{removing === product._id ? "Removing..." : "Remove"}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default WishlistCard;
