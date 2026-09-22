import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("flowra_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("flowra_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState(null);

  const requireAuth = (onSuccessAction) => {
    try {
      const user = JSON.parse(localStorage.getItem("flowra_user") || "null");
      if (user && (user.id || user.email)) {
        if (typeof onSuccessAction === "function") {
          onSuccessAction();
        }
        return true;
      }
    } catch (e) {
      console.warn("Auth parse error:", e);
    }

    // User is not logged in: pop the login modal
    setPendingAuthAction(() => onSuccessAction);
    setIsAuthModalOpen(true);
    return false;
  };

  const handleAuthSuccess = (userData) => {
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${userData?.fullName || "Bloom Lover"}! 🌸`);
    if (typeof pendingAuthAction === "function") {
      const actionToExecute = pendingAuthAction;
      setPendingAuthAction(null);
      actionToExecute();
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("flowra_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("flowra_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }, [wishlist]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === product.id || item.name === product.name);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += Number(quantity);
        return updated;
      }
      return [...prevCart, { ...product, quantity: Number(quantity) }];
    });

    try {
      const storedUser = JSON.parse(localStorage.getItem("flowra_user") || "null");
      const userId = storedUser?.id || 1;
      const prodId = (product.id && !isNaN(Number(product.id))) ? Number(product.id) : 1;
      fetch("http://localhost:8080/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          productId: prodId,
          quantity: Number(quantity) || 1,
        }),
      }).catch((err) => console.warn("Cart backend sync:", err));
    } catch (e) {
      console.warn("Cart backend sync error:", e);
    }

    showToast(`Added "${product.name}" to cart! 🌸`);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id || item.name === id ? { ...item, quantity: Number(quantity) } : item))
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id && item.name !== id));
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("flowra_user") || "null");
      const userId = storedUser?.id || 1;
      fetch(`http://localhost:8080/api/cart/user/${userId}`, { method: "DELETE" }).catch(console.warn);
    } catch (e) {}
    setCart([]);
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item.name === product.name);
    try {
      const storedUser = JSON.parse(localStorage.getItem("flowra_user") || "null");
      const userId = storedUser?.id || 1;
      const prodId = (product.id && !isNaN(Number(product.id))) ? Number(product.id) : 1;
      if (!exists) {
        fetch("http://localhost:8080/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            productId: prodId,
          }),
        }).catch((err) => console.warn("Wishlist backend sync:", err));
      }
    } catch (e) {
      console.warn("Wishlist backend sync error:", e);
    }

    setWishlist((prev) => {
      if (exists) {
        showToast(`Removed "${product.name}" from wishlist`);
        return prev.filter((item) => item.name !== product.name);
      } else {
        showToast(`Saved "${product.name}" to wishlist ❤️`);
        return [...prev, product];
      }
    });
  };

  const isWishlisted = (productName) => {
    return wishlist.some((item) => item.name === productName);
  };

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartTotal = cart.reduce((total, item) => {
    const numericPrice = typeof item.price === "string" ? parseFloat(item.price.replace(/[^\d.]/g, "")) : item.price;
    return total + (numericPrice || 0) * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        cartTotal,
        toastMessage,
        showToast,
        isAuthModalOpen,
        setIsAuthModalOpen,
        requireAuth,
        handleAuthSuccess,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
