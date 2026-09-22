import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import Props from "./props.jsx";
import { getProductById, getRelatedProducts } from "./productsData.js";

function ProductDetail() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, showToast, setIsCartOpen, requireAuth } = useCart();

  // Retrieve product from state or look up by ID
  const product = location.state?.product?.id === productId
    ? location.state.product
    : getProductById(productId);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description | care | delivery

  const isHeartActive = isWishlisted(product.name);
  const relatedItems = getRelatedProducts(product.id, product.category, 4);

  const [reviewsList, setReviewsList] = useState([
    { id: 1, authorName: "Sophia Reynolds", rating: 5, comment: "Beyond breathtaking! Arrived in pristine condition and lasted over 10 days.", createdAt: "2026-09-01" },
    { id: 2, authorName: "Arjun Mehta", rating: 5, comment: "Same-day delivery was right on time. Packaging made it feel so personal and luxurious.", createdAt: "2026-08-31" },
  ]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const pId = product.dbId || (product.id && !isNaN(Number(product.id)) ? Number(product.id) : 1);
    fetch(`http://localhost:8080/api/reviews/product/${pId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReviewsList(data);
        }
      })
      .catch((err) => console.warn("Reviews load warning:", err));
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      alert("Please enter your name and review comment.");
      return;
    }
    setIsSubmittingReview(true);
    const pId = product.dbId || (product.id && !isNaN(Number(product.id)) ? Number(product.id) : 1);
    try {
      const res = await fetch("http://localhost:8080/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: pId,
          authorName: reviewForm.name.trim(),
          rating: Number(reviewForm.rating) || 5,
          comment: reviewForm.comment.trim(),
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setReviewsList((prev) => [saved, ...prev]);
        setReviewForm({ name: "", rating: 5, comment: "" });
        showToast("Thank you for your floral review! 🌸");
      }
    } catch (err) {
      console.warn("Review save error:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Scroll to top whenever product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setQuantity(1);
  }, [productId]);

  const numericPrice = typeof product.price === "string"
    ? parseFloat(product.price.replace(/[^\d.]/g, ""))
    : product.price;

  const numericOldPrice = product.oldPrice
    ? typeof product.oldPrice === "string"
      ? parseFloat(product.oldPrice.replace(/[^\d.]/g, ""))
      : product.oldPrice
    : null;

  const savings = numericOldPrice && numericOldPrice > numericPrice
    ? numericOldPrice - numericPrice
    : null;

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        image: product.image,
        name: product.name,
        price: product.price,
        category: product.category,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      navigate("/purchase", {
        state: {
          product: {
            id: product.id,
            image: product.image,
            name: product.name,
            price: product.price,
            category: product.category,
            quantity: Number(quantity) || 1,
          },
        },
      });
    });
  };

  return (
    <div className="product-detail-page-container">
      <Navbar />
      <CartDrawer />
      <Toast />

      <main className="product-detail-main">
        {/* BREADCRUMB NAV */}
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/#products">Flowers</Link>
          <span>/</span>
          <span className="current-crumb">{product.name}</span>
        </nav>

        {/* PRIMARY PRODUCT SHOWCASE */}
        <section className="product-hero-showcase">
          {/* LEFT: IMAGE & BADGES */}
          <div className="product-gallery-col">
            <div className="product-hero-image-wrap">
              <img
                src={product.image}
                alt={product.alter || product.name}
                className="product-hero-img"
              />
              <span className="fresh-pill-badge">🌸 100% FARM-FRESH</span>
              {savings && (
                <span className="discount-pill-badge">SAVE ₹{savings}</span>
              )}
              <button
                type="button"
                className={`product-wishlist-hero-btn ${isHeartActive ? "active" : ""}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isHeartActive ? "Remove from wishlist" : "Add to wishlist"}
                title={isHeartActive ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isHeartActive ? "♥" : "♡"}
              </button>
            </div>

            {/* TRUST PERKS STRIP UNDER IMAGE */}
            <div className="product-trust-strip">
              <div className="trust-item">
                <span className="trust-icon">🌿</span>
                <div>
                  <strong>Organic Harvest</strong>
                  <small>No chemical preservatives</small>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🚚</span>
                <div>
                  <strong>Cold-Van Delivery</strong>
                  <small>Temperature controlled</small>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">💌</span>
                <div>
                  <strong>Handwritten Note</strong>
                  <small>Italian calligraphy card</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS, PRICING & ACTIONS */}
          <div className="product-info-col">
            <span className="product-category-eyebrow">
              {product.category ? `${product.category.toUpperCase()} • FRESH BLOOM` : "ARTISAN COLLECTION"}
            </span>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating-row">
              <span className="stars">★★★★★</span>
              <span className="rating-score">4.9</span>
              <span className="rating-count">(148 verified floral reviews)</span>
              <span className="stock-status">✓ In Stock for Today</span>
            </div>

            {/* PRICING AREA */}
            <div className="product-pricing-card">
              <div className="price-stack">
                <span className="current-price">{product.price}</span>
                {product.oldPrice && (
                  <span className="strike-old-price">{product.oldPrice}</span>
                )}
              </div>
              <span className="tax-inclusive-tag">Inclusive of all taxes & eco-luxe kraft wrapping</span>
            </div>

            {/* DESCRIPTION */}
            <p className="product-main-desc">
              {product.description ||
                "Handpicked fresh harvest styled by our master florists. Conditioned in our greenhouse studio with flower nutrition for long-lasting vase vibrancy."}
            </p>

            {/* HIGHLIGHTS */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="product-highlights-box">
                <h4>Floral Highlights:</h4>
                <ul>
                  {product.highlights.map((h, i) => (
                    <li key={i}>
                      <span className="check-bullet">✓</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* QUANTITY & ACTIONS */}
            <div className="product-purchase-action-panel">
              <div className="quantity-selection-row">
                <span className="qty-label">Quantity:</span>
                <div className="qty-stepper large">
                  <button
                    type="button"
                    className="qty-step-btn minus"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    type="button"
                    className="qty-step-btn plus"
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    disabled={quantity >= 50}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="subtotal-indicator">
                  Subtotal: <strong>₹{(numericPrice * quantity).toFixed(2)}</strong>
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="product-buttons-row">
                <button
                  type="button"
                  className="add-to-cart-hero-btn"
                  onClick={handleAddToCart}
                >
                  <span>🛒 Add to Cart</span>
                </button>

                <button
                  type="button"
                  className="buy-now-hero-btn"
                  onClick={handleBuyNow}
                >
                  <span>Buy Now (₹{(numericPrice * quantity).toFixed(2)}) →</span>
                </button>
              </div>
            </div>

            {/* ACCORDION INFO TABS */}
            <div className="product-tabs-wrapper">
              <div className="tabs-header-bar">
                <button
                  type="button"
                  className={`info-tab-btn ${activeTab === "description" ? "active" : ""}`}
                  onClick={() => setActiveTab("description")}
                >
                  🌸 Bouquet Details
                </button>
                <button
                  type="button"
                  className={`info-tab-btn ${activeTab === "care" ? "active" : ""}`}
                  onClick={() => setActiveTab("care")}
                >
                  🌿 Care Instructions
                </button>
                <button
                  type="button"
                  className={`info-tab-btn ${activeTab === "delivery" ? "active" : ""}`}
                  onClick={() => setActiveTab("delivery")}
                >
                  🚚 Delivery & Slots
                </button>
              </div>

              <div className="tab-body-card">
                {activeTab === "description" && (
                  <div className="tab-content-fade">
                    <p>{product.description}</p>
                    <p>
                      <strong>Vase Compatibility:</strong> Fits vases 8” to 12” in height with wide or tapered neck.
                    </p>
                  </div>
                )}

                {activeTab === "care" && (
                  <div className="tab-content-fade">
                    <p>{product.care || "Trim stems at a 45° angle under water, change water every 2 days, and keep away from direct sunlight and fruit bowls."}</p>
                    <small>🌸 Bonus: Each order includes 1 free Flower Food sachet to maximize freshness up to 10+ days.</small>
                  </div>
                )}

                {activeTab === "delivery" && (
                  <div className="tab-content-fade">
                    <p>
                      <strong>Morning Slot:</strong> 8:00 AM - 11:00 AM<br />
                      <strong>Afternoon Slot:</strong> 1:00 PM - 4:00 PM<br />
                      <strong>Evening Slot:</strong> 5:00 PM - 9:00 PM<br />
                      <strong>Midnight Special:</strong> 11:30 PM - 12:15 AM
                    </p>
                    <small>All shipments are transported in climate-controlled floristry vehicles to preserve dew freshness.</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= CUSTOMER REVIEWS & SUBMISSION ================= */}
        <section className="product-reviews-section" style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
          <div className="section-title-wrap" style={{ textAlign: "center", marginBottom: "30px" }}>
            <span className="relatable-eyebrow" style={{ color: "#795548", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.85rem" }}>VERIFIED FLORAL REVIEWS</span>
            <h2 style={{ fontFamily: "serif", fontSize: "2rem", margin: "8px 0", color: "#2d3748" }}>Customer Love &amp; Experiences</h2>
            <p style={{ color: "#718096" }}>Read authentic reviews from customers who experienced <strong>{product.name}</strong>.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "40px" }}>
            {/* REVIEWS LIST */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h3 style={{ fontSize: "1.2rem", color: "#2d3748", borderBottom: "2px solid #edf2f7", paddingBottom: "10px" }}>
                Verified Reviews ({reviewsList.length})
              </h3>
              {reviewsList.map((rev, idx) => (
                <div key={rev.id || idx} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <strong style={{ color: "#2d3748", fontSize: "1rem" }}>{rev.authorName || rev.author || "Floral Enthusiast"}</strong>
                    <span style={{ color: "#ecc94b", fontSize: "1.1rem" }}>{"★".repeat(rev.rating || 5)}{"☆".repeat(Math.max(0, 5 - (rev.rating || 5)))}</span>
                  </div>
                  <p style={{ color: "#4a5568", fontSize: "0.95rem", lineHeight: "1.5", margin: "6px 0" }}>"{rev.comment}"</p>
                  {rev.adminReply && (
                    <div style={{ background: "#f7fafc", borderLeft: "3px solid #48bb78", padding: "8px 12px", marginTop: "10px", borderRadius: "4px", fontSize: "0.85rem", color: "#2d3748" }}>
                      <strong>Flowra Concierge:</strong> {rev.adminReply}
                    </div>
                  )}
                  <small style={{ color: "#a0aec0", display: "block", marginTop: "8px", fontSize: "0.8rem" }}>
                    Verified Purchase • {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                  </small>
                </div>
              ))}
            </div>

            {/* WRITE A REVIEW FORM */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "1.2rem", color: "#2d3748", marginBottom: "6px" }}>Write a Floral Review 🌸</h3>
              <p style={{ color: "#718096", fontSize: "0.9rem", marginBottom: "20px" }}>Share your impression with fellow flower lovers.</p>

              <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#4a5568", marginBottom: "6px" }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Patel"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "0.95rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#4a5568", marginBottom: "6px" }}>Rating *</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "0.95rem", background: "#fff" }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Fresh)</option>
                    <option value={3}>⭐⭐⭐ (3 - Good)</option>
                    <option value={2}>⭐⭐ (2 - Average)</option>
                    <option value={1}>⭐ (1 - Needs Improvement)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#4a5568", marginBottom: "6px" }}>Your Thoughts &amp; Petal Freshness *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How did the fragrance, wrapping, and vase life delight you?"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "0.95rem", resize: "vertical" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  style={{
                    background: "#2d3748",
                    color: "#fff",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Verified Review ✨"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ================= RELATABLE ITEMS SECTION ================= */}
        <section className="relatable-products-section" id="relatable-items">
          <div className="section-title-wrap">
            <span className="relatable-eyebrow">CURATED RECOMMENDATIONS</span>
            <h2>Relatable Blooms & Pairings</h2>
            <p>
              Handcrafted stems and bouquets that harmonize delightfully with <strong>{product.name}</strong>.
            </p>
          </div>

          <div className="items">
            {relatedItems.map((item) => (
              <Props
                key={item.id}
                id={item.id}
                image={item.image}
                alter={item.alter}
                name={item.name}
                price={item.price}
                oldPrice={item.oldPrice}
                category={item.category}
                btnText="ORDER NOW"
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetail;
