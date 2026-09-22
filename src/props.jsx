import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";

function Props({
  id,
  image,
  alter,
  name,
  price,
  oldPrice,
  category,
  btnText = "BUY NOW"
}) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, requireAuth } = useCart();
  const [quantity, setQuantity] = useState(1);
  const isHeartActive = isWishlisted(name);

  // Clicking the card opens the dedicated Product Detail Page
  const handleCardClick = () => {
    navigate(`/product/${id}`, {
      state: {
        product: {
          id,
          image,
          alter,
          name,
          price,
          oldPrice,
          category,
          quantity: Number(quantity) || 1,
        },
      },
    });
  };

  // Direct checkout purchase with reconfirmed auth
  const handleBuy = (e) => {
    e?.stopPropagation();
    requireAuth(() => {
      navigate("/purchase", {
        state: {
          product: {
            id,
            image,
            name,
            price,
            category,
            quantity: Number(quantity) || 1,
          },
        },
      });
    });
  };

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    addToCart(
      {
        id,
        image,
        name,
        price,
        category,
      },
      Number(quantity) || 1
    );
  };

  return (
    <div
      className="card gold-frame-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View product details for ${name}`}
      title={`Click to view details of ${name}`}
    >
      {/* IMAGE */}
      <div className="image-box">
        <img
          src={image}
          alt={alter || name}
          loading="lazy"
        />

        <span className="fresh-badge">
          ✨ FRESH
        </span>

        <button
          className={`heart ${isHeartActive ? "active-heart" : ""}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist({ id, image, name, price, category });
          }}
          aria-label={isHeartActive ? "Remove from wishlist" : "Add to wishlist"}
          title={isHeartActive ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isHeartActive ? "♥" : "♡"}
        </button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="card-details">
        <span className="flower-type">
          {category ? `${category.toUpperCase()} • FRESH BLOOM` : "PREMIUM FLOWER"}
        </span>

        <h3>
          {name}
        </h3>

        <div className="rating">
          ★★★★★
          <span> 4.9 (120+ reviews)</span>
        </div>

        <div className="product-bottom">
          <div>
            <span className="price">
              {price}
            </span>

            {oldPrice && (
              <span className="old-price">
                {oldPrice}
              </span>
            )}
          </div>

          {/* MOBILE-FRIENDLY QUANTITY STEPPER */}
          <div
            className="qty-stepper"
            role="group"
            aria-label={`Quantity for ${name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="qty-step-btn minus"
              onClick={(e) => {
                e.stopPropagation();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              title="Decrease quantity"
            >
              −
            </button>
            <span className="qty-display" aria-live="polite" title={`Quantity: ${quantity}`}>
              {quantity}
            </span>
            <button
              type="button"
              className="qty-step-btn plus"
              onClick={(e) => {
                e.stopPropagation();
                setQuantity((q) => Math.min(50, q + 1));
              }}
              disabled={quantity >= 50}
              aria-label="Increase quantity"
              title="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* BUTTON GROUP: QUICK ADD & BUY NOW */}
        <div className="card-action-group">
          <button
            className="quick-cart-btn"
            type="button"
            onClick={handleAddToCart}
            title="Add to Cart"
          >
            🛒
          </button>

          <button
            className="buy-btn"
            type="button"
            onClick={handleBuy}
          >
            {btnText}
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Props;
