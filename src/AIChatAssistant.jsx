import { useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext.jsx";
import { API_BASE_URL } from "./config/api.js";
import { allProducts } from "./productsData.js";
import "./AIChatAssistant.css";

function AIChatAssistant() {
  const { addToCart, showToast, setIsCartOpen } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: "initial",
      role: "assistant",
      text: "Hello Bloom Lover! 🌸 I am your **Flowra AI Stylist**.\n\nTell me about your occasion, preferred flowers, or budget (e.g. *\"Birthday flowers under ₹1,000\"* or *\"What are your delivery slots?\"*), and I will search our live boutique inventory to find the perfect arrangement for you!",
      products: [],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "🌸 Birthday flowers under ₹1,000",
    "🌹 Romantic Anniversary Bouquets",
    "🚚 What are your delivery time slots?",
    "🌿 Flower care & freshness guide",
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Client-Side Intelligent Flowra Florist Engine (Instant Fallback if Render Backend is waking up)
  const processLocalQuery = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 1. Check for Store Policies
    if (q.includes("delivery") || q.includes("slot") || q.includes("timing") || q.includes("time") || q.includes("shipping") || q.includes("fee")) {
      return {
        reply: "🚚 **FLOWRA Delivery Schedule & Guidelines:**\n\n• **Same-Day Delivery:** Available for orders placed before 4:00 PM IST.\n• **4 Delivery Slots:** Morning (8:00 AM – 11:00 AM), Afternoon (12:00 PM – 3:00 PM), Evening (4:00 PM – 7:00 PM), Night (8:00 PM – 11:00 PM).\n• **Free Shipping:** FREE delivery on all orders above ₹500! (A flat ₹99 fee applies below ₹500).\n• **Stem Preservation:** Packed in cold-chain hydration wraps to ensure garden freshness upon arrival.",
        products: [],
        suggestedPrompts: ["Show flowers under ₹1,000", "Romantic Anniversary Bouquets", "Care instructions"],
      };
    }

    if (q.includes("care") || q.includes("fresh") || q.includes("water") || q.includes("vase")) {
      return {
        reply: "🌿 **Artisanal Flower Care Guide:**\n\n• **Stem Trimming:** Snip stems diagonally at a 45° angle under cool water before placing into a clean vase.\n• **Water Changes:** Replace vase water every 48 hours with fresh cold water to prevent bacteria.\n• **Placement:** Keep away from direct sunlight, air conditioners, and ripening fruits (which release ethylene gas).",
        products: [],
        suggestedPrompts: ["Flowers for Birthday", "Anniversary Roses", "Delivery slots"],
      };
    }

    if (q.includes("payment") || q.includes("upi") || q.includes("cod") || q.includes("card")) {
      return {
        reply: "💳 **Payment Methods Accepted:**\n\n• **Online via Razorpay:** Instant UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking with 256-bit encryption.\n• **Cash on Delivery (COD):** Available for selected standard floral deliveries.",
        products: [],
        suggestedPrompts: ["Browse Bouquets", "Flowers under ₹1,000", "Delivery slots"],
      };
    }

    // 2. Extract Budget
    let budget = null;
    const budgetMatch = q.match(/(?:under|below|within|upto|budget of|max|less than)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d{3})*)/i) ||
                        q.match(/(?:rs\.?|inr|₹)\s*(\d+(?:,\d{3})*)/i);
    if (budgetMatch) {
      budget = parseFloat(budgetMatch[1].replace(/,/g, ""));
    }

    // 3. Extract Occasion
    const occasions = ["birthday", "anniversary", "wedding", "romance", "love", "valentine", "sympathy", "condolence", "get well", "housewarming"];
    const matchedOccasion = occasions.find((occ) => q.includes(occ));

    // 4. Extract Flower Species
    const species = ["rose", "tulip", "orchid", "lily", "lilies", "jasmine", "lotus", "protea", "ranunculus", "hibiscus", "marigold", "carnation"];
    const matchedSpecies = species.find((s) => q.includes(s));

    // 5. Filter Catalog from allProducts
    let filtered = allProducts.filter((p) => {
      const priceVal = typeof p.rawPrice === "number" ? p.rawPrice : parseFloat(String(p.price).replace(/[^\d.]/g, "")) || 0;
      if (budget && priceVal > budget) return false;
      return true;
    });

    if (matchedSpecies) {
      const bySpecies = filtered.filter((p) =>
        p.name.toLowerCase().includes(matchedSpecies) ||
        (p.category && p.category.toLowerCase().includes(matchedSpecies)) ||
        (p.description && p.description.toLowerCase().includes(matchedSpecies))
      );
      if (bySpecies.length > 0) filtered = bySpecies;
    } else if (matchedOccasion) {
      if (matchedOccasion === "romance" || matchedOccasion === "anniversary" || matchedOccasion === "love") {
        const romantic = filtered.filter((p) => p.name.toLowerCase().includes("rose") || p.name.toLowerCase().includes("tulip") || p.name.toLowerCase().includes("ranunculus"));
        if (romantic.length > 0) filtered = romantic;
      }
    }

    if (filtered.length === 0) {
      filtered = allProducts.slice(0, 4);
    }

    // Format results to matching DTO structure
    const mappedProducts = filtered.slice(0, 4).map((p) => ({
      id: p.id,
      name: p.name,
      price: typeof p.rawPrice === "number" ? p.rawPrice : parseFloat(String(p.price).replace(/[^\d.]/g, "")) || 0,
      primaryImage: p.image,
      currentStock: p.popularity ? Math.min(25, Math.max(3, Math.round(p.popularity / 5))) : 12,
      categoryName: p.category || "Bouquet",
      description: p.description,
    }));

    let reply = "🌸 Here are our finest handpicked arrangements tailored for you:";
    if (matchedOccasion && budget) {
      reply = `🌸 Here are exquisite bouquets for **${matchedOccasion.charAt(0).toUpperCase() + matchedOccasion.slice(1)}** within your budget of **₹${budget}**:`;
    } else if (budget) {
      reply = `🌸 Here are beautiful fresh bouquets currently in bloom under **₹${budget}**:`;
    } else if (matchedOccasion) {
      reply = `🌸 For a memorable **${matchedOccasion.charAt(0).toUpperCase() + matchedOccasion.slice(1)}**, here are customer favorites styled by our florists:`;
    } else if (matchedSpecies) {
      reply = `🌸 Here are our freshest **${matchedSpecies.charAt(0).toUpperCase() + matchedSpecies.slice(1)}** arrangements currently in stock:`;
    }

    return {
      reply,
      products: mappedProducts,
      suggestedPrompts: [
        "🌸 Birthday flowers under ₹1,000",
        "🌹 Romantic Anniversary Roses",
        "🚚 What are your delivery time slots?",
        "🌿 How to care for flowers?",
      ],
    };
  };

  // Send message to backend AI Assistant with fast timeout and instant local fallback
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText("");

    const userMessageId = "user-" + Date.now();
    const newMsg = {
      id: userMessageId,
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("flowra_user") || "null");
      const userId = storedUser?.id || 1;

      // Extract conversation history
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.text || "",
      }));

      // AbortController with 4.5 second timeout so user is NEVER left hanging if Render is cold-starting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      let data = null;

      try {
        const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: query,
            userId: userId,
            history: history,
          }),
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          data = await res.json();
        }
      } catch (networkErr) {
        // Network timeout, cold start, or Render building new container: run instant local engine!
        clearTimeout(timeoutId);
        console.info("Backend taking time to wake up, running instant client-side AI stylist:", networkErr.message);
      }

      // If backend didn't respond in 4.5s or returned non-200, use instant intelligent engine
      if (!data || !data.reply) {
        data = processLocalQuery(query);
      }

      const assistantMsg = {
        id: "ai-" + Date.now(),
        role: "assistant",
        text: data.reply || "Here are matching arrangements from our boutique:",
        products: data.products || [],
        cartAction: data.cartAction || null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If cart action requires confirmation, open confirmation card
      if (data.cartAction && data.cartAction.requiresConfirmation) {
        setPendingConfirmation(data.cartAction);
      }

      if (data.suggestedPrompts && data.suggestedPrompts.length > 0) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
    } catch (err) {
      console.warn("AI Assistant fallback execution error:", err);
      // Even in the worst edge case, return local catalog recommendations
      const localFallback = processLocalQuery(query);
      setMessages((prev) => [
        ...prev,
        {
          id: "local-" + Date.now(),
          role: "assistant",
          text: localFallback.reply,
          products: localFallback.products,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Open confirmation card for a specific product
  const handleSelectProductForCart = (product) => {
    const numericPrice = typeof product.price === "string" ? parseFloat(product.price.replace(/[^\d.]/g, "")) : Number(product.price || 0);

    setPendingConfirmation({
      productId: product.id,
      productName: product.name,
      productImage: product.primaryImage || (product.images && product.images[0]) || product.image || "",
      unitPrice: numericPrice,
      quantity: 1,
      totalAmount: numericPrice,
      availableStock: product.currentStock || 10,
    });
  };

  // Execute explicit user confirmation to add to existing cart
  const handleConfirmAddToCart = async () => {
    if (!pendingConfirmation) return;

    const { productId, productName, productImage, unitPrice, quantity, totalAmount } = pendingConfirmation;

    // Call existing Flowra Cart Context
    const productItem = {
      id: productId,
      name: productName,
      price: unitPrice,
      image: productImage,
      quantity: quantity,
    };

    addToCart(productItem, quantity);
    showToast(`🌸 Added "${productName}" to your cart!`);

    // Sync to backend AI confirm endpoint (non-blocking)
    try {
      const storedUser = JSON.parse(localStorage.getItem("flowra_user") || "null");
      const userId = storedUser?.id || 1;

      fetch(`${API_BASE_URL}/api/ai/confirm-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          productId: productId,
          quantity: quantity,
        }),
      }).catch(console.warn);
    } catch (e) {}

    // Add confirmation message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: "confirm-" + Date.now(),
        role: "assistant",
        text: `✅ **Added to Cart!**\n\n'${productName}' (Qty: ${quantity}, Total: ₹${totalAmount}) is now in your shopping cart. You can review your cart anytime or proceed to checkout!`,
        isCartConfirmed: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    setPendingConfirmation(null);
  };

  const handleCancelConfirmation = () => {
    setPendingConfirmation(null);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "initial-reset-" + Date.now(),
        role: "assistant",
        text: "Conversation refreshed! 🌸 What kind of flowers are you searching for today?",
        products: [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setPendingConfirmation(null);
  };

  return (
    <div className="flowra-ai-fab-container">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="flowra-ai-window" role="dialog" aria-label="Flowra AI Assistant">
          {/* Header */}
          <div className="flowra-ai-header">
            <div className="flowra-ai-brand">
              <div className="flowra-ai-avatar">
                🌸
                <span className="flowra-ai-status-dot" title="Online" />
              </div>
              <div className="flowra-ai-title-wrap">
                <h4>Flowra AI Stylist</h4>
                <p>Artisanal Concierge • Instant Recommendations</p>
              </div>
            </div>
            <div className="flowra-ai-header-actions">
              <button
                className="flowra-ai-tool-btn"
                onClick={handleResetChat}
                title="Restart conversation"
                aria-label="Restart chat"
              >
                🔄
              </button>
              <button
                className="flowra-ai-tool-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flowra-ai-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`flowra-ai-msg ${msg.role}`}>
                <div className="flowra-ai-msg-text">
                  {msg.text.split("\n").map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>

                {/* Real Product Cards from MySQL / Boutique Catalogue */}
                {msg.products && msg.products.length > 0 && (
                  <div className="flowra-ai-products-grid">
                    {msg.products.map((prod) => (
                      <div key={prod.id} className="flowra-ai-product-card">
                        <img
                          src={
                            prod.primaryImage ||
                            prod.image ||
                            (prod.images && prod.images[0]) ||
                            "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=300&q=80"
                          }
                          alt={prod.name}
                          className="flowra-ai-product-img"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=300&q=80";
                          }}
                        />
                        <div className="flowra-ai-product-info">
                          <h5 className="flowra-ai-product-name" title={prod.name}>
                            {prod.name}
                          </h5>
                          <div className="flowra-ai-product-meta">
                            <span className="flowra-ai-product-price">
                              ₹{typeof prod.price === "number" ? prod.price.toFixed(0) : prod.price}
                            </span>
                            <span
                              className={`flowra-ai-product-stock ${
                                prod.currentStock <= 5 ? "low-stock" : "in-stock"
                              }`}
                            >
                              {prod.currentStock <= 5
                                ? `Only ${prod.currentStock} left`
                                : `In Stock (${prod.currentStock})`}
                            </span>
                          </div>
                          <button
                            className="flowra-ai-add-btn"
                            onClick={() => handleSelectProductForCart(prod)}
                            title="Add to your cart"
                          >
                            <span>Add to Cart</span> 🛒
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View Cart Shortcut Button on confirmation */}
                {msg.isCartConfirmed && (
                  <button
                    className="flowra-ai-btn-confirm"
                    style={{ marginTop: "10px", width: "100%" }}
                    onClick={() => {
                      setIsOpen(false);
                      setIsCartOpen(true);
                    }}
                  >
                    🛍️ View Cart & Checkout
                  </button>
                )}

                <span className="flowra-ai-msg-time">{msg.timestamp}</span>
              </div>
            ))}

            {/* Explicit Confirmation Dialog inside Chat */}
            {pendingConfirmation && (
              <div className="flowra-ai-confirm-card">
                <div className="flowra-ai-confirm-header">
                  <span>🌸 Confirm Cart Addition</span>
                </div>
                <div className="flowra-ai-confirm-item">
                  {pendingConfirmation.productImage && (
                    <img
                      src={pendingConfirmation.productImage}
                      alt={pendingConfirmation.productName}
                      className="flowra-ai-confirm-thumb"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                  )}
                  <div className="flowra-ai-confirm-details">
                    <p className="flowra-ai-confirm-name">{pendingConfirmation.productName}</p>
                    <span className="flowra-ai-confirm-price">
                      Qty: {pendingConfirmation.quantity} • Total: ₹{pendingConfirmation.totalAmount}
                    </span>
                  </div>
                </div>
                <div className="flowra-ai-confirm-actions">
                  <button className="flowra-ai-btn-confirm" onClick={handleConfirmAddToCart}>
                    Confirm & Add to Cart
                  </button>
                  <button className="flowra-ai-btn-cancel" onClick={handleCancelConfirmation}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flowra-ai-typing">
                <span>Styling recommendations</span>
                <div className="flowra-ai-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Prompts */}
          {messages.length < 5 && (
            <div style={{ padding: "0 14px 8px" }}>
              <div className="flowra-ai-starters">
                {suggestedPrompts.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    className="flowra-ai-starter-pill"
                    onClick={() => handleSendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer */}
          <div className="flowra-ai-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className="flowra-ai-input"
              placeholder="Ask about budget, occasion, flowers..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              className="flowra-ai-send-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputText.trim()}
              title="Send query"
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        className="flowra-ai-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Chat with Flowra AI Stylist"
        aria-label="Open AI Flower Assistant"
      >
        <span className="flowra-ai-fab-icon">🌸</span>
        <span>Ask Flowra AI</span>
        {hasUnread && !isOpen && <span className="flowra-ai-fab-badge">New</span>}
      </button>
    </div>
  );
}

export default AIChatAssistant;
