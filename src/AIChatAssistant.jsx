import { useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext.jsx";
import { API_BASE_URL } from "./config/api.js";
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

  // Send message to backend AI Assistant
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

      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          userId: userId,
          history: history,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI service responded with status: ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg = {
        id: "ai-" + Date.now(),
        role: "assistant",
        text: data.reply || "Here are matching arrangements from our boutique:",
        products: data.products || [],
        cartAction: data.cartAction || null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If backend returned a cart action that requires confirmation, set it
      if (data.cartAction && data.cartAction.requiresConfirmation) {
        setPendingConfirmation(data.cartAction);
      }

      if (data.suggestedPrompts && data.suggestedPrompts.length > 0) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
    } catch (err) {
      console.warn("AI Assistant fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          text: "I am having a brief moment reconnecting with our boutique catalogue 🌸. Meanwhile, you can explore our complete artisanal bouquets from the top menu, or try asking about your budget or occasion again!",
          products: [],
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
      productImage: product.primaryImage || (product.images && product.images[0]) || "",
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
                <p>Artisanal Concierge • Live Inventory</p>
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

                {/* Real Product Cards from MySQL Catalogue */}
                {msg.products && msg.products.length > 0 && (
                  <div className="flowra-ai-products-grid">
                    {msg.products.map((prod) => (
                      <div key={prod.id} className="flowra-ai-product-card">
                        <img
                          src={
                            prod.primaryImage ||
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
