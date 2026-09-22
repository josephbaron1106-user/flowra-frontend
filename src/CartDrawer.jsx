import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useState } from "react";

function CartDrawer() {
  const {
    cart,
    wishlist,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    toggleWishlist,
    addToCart,
    requireAuth,
  } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cart"); // "cart" | "wishlist"

  if (!isCartOpen) return null;

  const freeShippingThreshold = 500;
  const progressPercent = Math.min(100, (cartTotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);

  const handleCheckout = () => {
    requireAuth(() => {
      setIsCartOpen(false);
      navigate("/purchase");
    });
  };

  return (
    <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div className="cart-tabs">
            <button
              className={`cart-tab-btn ${activeTab === "cart" ? "active" : ""}`}
              onClick={() => setActiveTab("cart")}
            >
              Shopping Cart ({cart.length})
            </button>
            <button
              className={`cart-tab-btn ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => setActiveTab("wishlist")}
            >
              Wishlist ({wishlist.length})
            </button>
          </div>
          <button
            className="cart-drawer-close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Drawer"
          >
            ✕
          </button>
        </div>

        {activeTab === "cart" ? (
          <>
            {/* Free shipping progress */}
            <div className="free-shipping-box">
              {remainingForFreeShipping === 0 ? (
                <span className="free-ship-msg success">🎉 You unlocked FREE Same-Day Delivery!</span>
              ) : (
                <span className="free-ship-msg">
                  Add <strong>₹{remainingForFreeShipping.toFixed(0)}</strong> more for <strong>FREE Delivery</strong>!
                </span>
              )}
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="cart-drawer-body">
              {cart.length === 0 ? (
                <div className="empty-cart-state">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Your garden cart is empty</h3>
                  <p>Explore our fresh seasonal blooms and bring nature into your home.</p>
                  <button
                    className="explore-flowers-btn"
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate("/#products");
                    }}
                  >
                    Explore Flowers 🌸
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map((item, index) => (
                    <div className="cart-item-row" key={`${item.id || item.name}-${index}`}>
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <span className="cart-item-price">{item.price}</span>
                        <div className="cart-qty-ctrls">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id || item.name, (item.quantity || 1) - 1)}
                          >
                            -
                          </button>
                          <span>{item.quantity || 1}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id || item.name, (item.quantity || 1) + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id || item.name)}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-subtotal-row">
                  <span>Subtotal</span>
                  <span className="cart-subtotal-amount">₹{cartTotal.toFixed(2)}</span>
                </div>
                <p className="cart-tax-notice">Taxes and delivery calculated at checkout.</p>
                <button className="cart-checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </>
        ) : (
          /* Wishlist Tab */
          <div className="cart-drawer-body">
            {wishlist.length === 0 ? (
              <div className="empty-cart-state">
                <div className="empty-cart-icon">♡</div>
                <h3>Your wishlist is empty</h3>
                <p>Click the heart icon on any bouquet or bloom to save your favorites for later.</p>
              </div>
            ) : (
              <div className="cart-items-list">
                {wishlist.map((item, index) => (
                  <div className="cart-item-row" key={`${item.name}-${index}`}>
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <span className="cart-item-price">{item.price}</span>
                      <button
                        className="wishlist-add-btn"
                        onClick={() => {
                          addToCart(item, 1);
                        }}
                      >
                        Add to Cart 🛒
                      </button>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => toggleWishlist(item)}
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
