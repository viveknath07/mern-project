import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getProductById, getProducts, getWishlist, toggleWishlist } from "../services/api.js";

const formatPrice = (price) =>
  `₹${Number(price).toLocaleString("en-IN")}`;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { addItem, isActionLoading, isInCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedEffect, setAddedEffect] = useState(false);

  // Wishlist state
  const [saved, setSaved] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const [data, wishData] = await Promise.all([
          getProductById(id),
          getWishlist().catch(() => ({ wishlist: [] }))
        ]);

        setProduct(data.product);

        const currentSavedIds = new Set(wishData.wishlist.map((p) => p._id));
        setSavedIds(currentSavedIds);
        setSaved(currentSavedIds.has(data.product._id));

        // Fetch related products in the same category
        if (data.product?.category) {
          getProducts({ category: data.product.category })
            .then((res) => {
              const others = res.products.filter((p) => p._id !== data.product._id).slice(0, 3);
              setRelatedProducts(others);
            })
            .catch(() => {});
        }
      } catch (requestError) {
        const status = requestError.response?.status;
        const message =
          requestError.response?.data?.message ||
          (status === 404
            ? "Product not found."
            : "Something went wrong while loading the product.");
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const inStock = product && product.stock > 0;
  const isLowStock = inStock && product.stock <= 10;
  const cartBusy = product ? isActionLoading(product._id) : false;
  const inCart = product ? isInCart(product._id) : false;

  const originalPrice = product ? Math.round(product.price * 1.25) : 0;
  const savingsAmount = originalPrice - (product?.price || 0);

  const handleAddToCart = async () => {
    if (!product || cartBusy || !inStock) return;
    const result = await addItem(product._id);
    if (result.success) {
      setAddedEffect(true);
      setTimeout(() => setAddedEffect(false), 2000);
      if (addToast) {
        addToast(`Added "${product.name}" to cart!`, "success", { label: "View Cart" });
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!product || wishlistBusy) return;
    setWishlistBusy(true);
    try {
      const data = await toggleWishlist(product._id);
      setSaved(data.saved);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (data.saved) next.add(product._id);
        else next.delete(product._id);
        return next;
      });
      if (addToast) {
        addToast(
          data.saved ? "Saved to wishlist!" : "Removed from wishlist",
          data.saved ? "success" : "info"
        );
      }
    } catch {
      if (addToast) addToast("Failed to update wishlist.", "error");
    } finally {
      setWishlistBusy(false);
    }
  };

  return (
    <main className="products-page">
      <Navbar wishlistCount={savedIds.size} />

      <section className="details-content">
        <div className="breadcrumbs">
          <button className="back-link" onClick={() => navigate("/products")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Products</span>
          </button>
          {product && (
            <span className="breadcrumb-path">
              / <Link to={`/products?category=${product.category}`}>{product.category}</Link> / <span>{product.name}</span>
            </span>
          )}
        </div>

        {loading && (
          <div className="state-box">
            <div className="spinner" aria-label="Loading"></div>
            <p className="state-title">Loading product details...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-box state-error">
            <p className="state-title">{error}</p>
            <Link className="main-button card-button" to="/products">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && product && (
          <>
            <div className="details-card">
              <div className="details-image-container">
                <div className="details-image-wrap">
                  <img
                    className="details-image"
                    src={product.image}
                    alt={product.name}
                  />
                  <div className="details-image-badge">
                    <span>100% Genuine</span>
                  </div>
                </div>
              </div>

              <div className="details-info">
                <div className="details-head-meta">
                  <span className="product-category-tag">{product.category}</span>
                  <span className="product-rating">
                    <span className="rating-star">★</span> 4.8 (142 Customer Reviews)
                  </span>
                </div>

                <h1 className="details-name">{product.name}</h1>

                <div className="details-price-row">
                  <div className="details-price-stack">
                    <span className="details-price">{formatPrice(product.price)}</span>
                    <span className="details-original-price">{formatPrice(originalPrice)}</span>
                    <span className="details-savings-badge">Save {formatPrice(savingsAmount)}</span>
                  </div>
                  <span className={`stock-badge-inline ${!inStock ? "out-of-stock" : isLowStock ? "low-stock" : "in-stock"}`}>
                    <span className="pulse-dot"></span>
                    {!inStock ? "Out of Stock" : isLowStock ? `Only ${product.stock} Units Left!` : `${product.stock} Units Available`}
                  </span>
                </div>

                <div className="details-divider"></div>

                <h2 className="details-subhead">Product Overview</h2>
                <p className="details-description">{product.description}</p>

                {/* Specs & Highlights */}
                <div className="product-highlights">
                  <div className="highlight-item">
                    <span className="highlight-icon">🚚</span>
                    <div>
                      <strong>Free Express Delivery</strong>
                      <p>Estimated doorstep delivery in 2-3 business days</p>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">🛡️</span>
                    <div>
                      <strong>1 Year Manufacturer Warranty</strong>
                      <p>Full protection against defects & performance issues</p>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">↺</span>
                    <div>
                      <strong>14-Day Replacement Policy</strong>
                      <p>Hassle-free instant return & pickup guarantee</p>
                    </div>
                  </div>
                  <div className="highlight-item">
                    <span className="highlight-icon">💳</span>
                    <div>
                      <strong>Razorpay Secured Payment</strong>
                      <p>UPI, Credit/Debit cards & NetBanking with 256-bit SSL</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="details-actions">
                  <button
                    className={`main-button details-add-cart-btn ${addedEffect ? "btn-added-state" : ""}`}
                    onClick={handleAddToCart}
                    disabled={cartBusy || !inStock}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <span>
                      {cartBusy
                        ? "Adding to Cart..."
                        : addedEffect
                        ? "✓ Added to Cart!"
                        : inCart
                        ? "Add Another Unit"
                        : "Add to Cart"}
                    </span>
                  </button>

                  <button
                    className={`outline-button details-wishlist-btn ${saved ? "saved-outline" : ""}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistBusy}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>{saved ? "Saved in Wishlist" : "Add to Wishlist"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Products */}
            {relatedProducts.length > 0 && (
              <section className="related-products-section">
                <div className="section-head">
                  <div className="badge-pill">Similar Recommendations</div>
                  <h2>More in {product.category}</h2>
                  <p>Other popular items from this category you might love</p>
                </div>
                <div className="product-grid">
                  {relatedProducts.map((p) => (
                    <ProductCard key={p._id} product={p} initialSaved={savedIds.has(p._id)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default ProductDetails;
