import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import flowers1 from "./assets/pictures/flowers1.jpg";
import { initiateRazorpayPayment } from "./razorpay.js";

function Purchase() {
  const location = useLocation();
  const { cart, clearCart, showToast } = useCart();

  // If a single product was bought directly, use that, else use cart items
  const singleProduct = location.state?.product;
  const initialItems = singleProduct
    ? [singleProduct]
    : cart.length > 0
    ? cart
    : [
        {
          id: "1",
          name: "Premium Red Rose",
          price: "₹50",
          quantity: 1,
          image: flowers1,
          category: "Rose",
        },
      ];

  const [items] = useState(initialItems);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "Mumbai",
    pincode: "",
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    deliverySlot: "Morning (8:00 AM - 11:00 AM)",
    giftMessage: "",
    occasion: "Birthday",
    paymentMethod: "razorpay", // Default to Razorpay
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [confirmedPaymentDetails, setConfirmedPaymentDetails] = useState(null);

  const subtotal = items.reduce((acc, item) => {
    const numeric = typeof item.price === "string" ? parseFloat(item.price.replace(/[^\d.]/g, "")) : item.price;
    return acc + (numeric || 0) * (item.quantity || 1);
  }, 0);

  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    if (promoCode.trim().toUpperCase() === "FLOWRA10") {
      const discountAmount = subtotal * 0.1;
      setDiscount(discountAmount);
      setPromoSuccess("10% discount coupon applied successfully! 🎉");
    } else if (promoCode.trim().toUpperCase() === "BLOOM50") {
      setDiscount(50);
      setPromoSuccess("₹50 discount coupon applied successfully! 🌸");
    } else {
      setPromoError("Invalid promo code. Try 'FLOWRA10' or 'BLOOM50'");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const finalizeOrder = (orderId, paymentData = null) => {
    const isRazorpay = formData.paymentMethod === "razorpay";
    const newOrder = {
      orderId,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: items,
      total: finalTotal,
      status: "Processing",
      deliveryDate: formData.deliveryDate,
      deliverySlot: formData.deliverySlot,
      recipient: formData.fullName,
      address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
      paymentMethod: isRazorpay ? "Razorpay (Online)" : "Cash on Delivery",
      paymentStatus: isRazorpay ? "Paid" : "Pending COD",
      paymentId: paymentData?.paymentId || (isRazorpay ? "RZP_DEMO_OK" : "COD"),
      razorpayOrderId: paymentData?.razorpayOrderId || null,
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
      localStorage.setItem("flowra_orders", JSON.stringify([newOrder, ...existingOrders]));
    } catch (err) {
      console.error("Failed to save order to localStorage:", err);
    }

    // Persist to MySQL flowra_db backend
    try {
      const storedUser = JSON.parse(localStorage.getItem("flowra_user") || "null");
      const apiOrderPayload = {
        userId: storedUser?.id || null,
        recipientName: formData.fullName,
        recipientPhone: formData.phone,
        deliveryAddress: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        deliveryDate: formData.deliveryDate,
        deliverySlot: formData.deliverySlot,
        giftMessage: formData.giftMessage,
        occasion: formData.occasion,
        promoCode: promoCode || null,
        discountAmount: discount || 0,
        deliveryFee: 0,
        paymentMethod: isRazorpay ? "razorpay" : "cod",
        paymentId: paymentData?.paymentId || (isRazorpay ? "RZP_DEMO_OK" : null),
        razorpayOrderId: paymentData?.razorpayOrderId || null,
        items: items.map((itm) => {
          const numericPrice = typeof itm.price === "string" ? parseFloat(itm.price.replace(/[^\d.]/g, "")) : itm.price;
          return {
            productId: itm.id && !isNaN(Number(itm.id)) ? Number(itm.id) : null,
            productName: itm.name || "Flowra Bloom",
            unitPrice: numericPrice || 50,
            quantity: itm.quantity || 1,
            productImage: typeof itm.image === "string" ? itm.image : null,
          };
        }),
      };

      fetch("https://flowra-backend-1.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiOrderPayload),
      })
        .then((res) => res.json())
        .then((savedOrder) => {
          if (savedOrder && savedOrder.orderNumber) {
            console.log("Order saved to MySQL database:", savedOrder.orderNumber);
          }
        })
        .catch((err) => {
          console.warn("Could not sync order to backend MySQL:", err);
        });

      // Persist shipping address to addresses table
      const userIdForAddress = storedUser?.id || 1;
      fetch("https://flowra-backend-1.onrender.com/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdForAddress,
          recipientName: formData.fullName,
          recipientPhone: formData.phone,
          addressLine1: formData.address,
          addressLine2: formData.city,
          city: formData.city,
          state: "Maharashtra",
          pincode: formData.pincode,
          country: "India",
          addressType: "Home",
          isDefault: true,
        }),
      }).catch((err) => console.warn("Could not sync address to backend:", err));
    } catch (dbErr) {
      console.warn("Order DB persistence warning:", dbErr);
    }

    if (!singleProduct) {
      clearCart();
    }

    setConfirmedOrderId(orderId);
    setConfirmedPaymentDetails(paymentData || {
      method: isRazorpay ? "Razorpay (Online)" : "Cash on Delivery",
      paymentId: isRazorpay ? paymentData?.paymentId : null,
    });
    setOrderSubmitted(true);
    showToast(isRazorpay ? "Payment verified! Order placed successfully! 🌸" : "Order placed successfully! 🌸");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.email || !formData.address || !formData.pincode) {
      showToast("Please fill in all mandatory delivery details.");
      return;
    }

    if (formData.paymentMethod === "razorpay") {
      setIsProcessingPayment(true);

      try {
        await initiateRazorpayPayment({
          items,
          promoCode,
          totalAmount: finalTotal,
          customer: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            deliveryDate: formData.deliveryDate,
            deliverySlot: formData.deliverySlot,
          },
          onSuccess: (paymentData) => {
            setIsProcessingPayment(false);
            const orderId = paymentData.appOrderId || ("FLW-" + Math.floor(100000 + Math.random() * 900000));
            finalizeOrder(orderId, paymentData);
          },
          onFailure: (errorData) => {
            setIsProcessingPayment(false);
            const reason = errorData?.description || errorData?.message || "Payment was declined or cancelled.";
            showToast(`Payment failed: ${reason}`);
          },
          onDismiss: () => {
            setIsProcessingPayment(false);
            showToast("Razorpay Checkout closed. Your items are safe in your cart.");
          },
        });
      } catch (error) {
        setIsProcessingPayment(false);
        console.error("Razorpay error:", error);
        showToast(error.message || "Failed to launch Razorpay Checkout. Check network connection.");
      }
    } else {
      // Cash on Delivery
      const orderId = "FLW-" + Math.floor(100000 + Math.random() * 900000);
      finalizeOrder(orderId);
    }
  };

  return (
    <div className="purchase-page-container">
      <Navbar />
      <CartDrawer />
      <Toast />

      <main className="purchase-main">
        {orderSubmitted ? (
          <section className="order-success-screen" aria-label="Order Confirmation">
            <div className="success-icon-badge">✓</div>
            <span className="success-eyebrow">ORDER CONFIRMED</span>
            <h1>Thank you for your order!</h1>
            <p className="success-desc">
              Your blooms are being freshly handpicked and styled by our florists. We have sent confirmation details to{" "}
              <strong>{formData.email || "your email"}</strong>.
            </p>

            <div className="order-summary-card">
              <div className="order-card-header">
                <div>
                  <small>Order Number</small>
                  <h3>{confirmedOrderId}</h3>
                </div>
                <div>
                  <small>Estimated Delivery</small>
                  <h3>{formData.deliveryDate}</h3>
                </div>
              </div>

              {confirmedPaymentDetails?.paymentId && (
                <div className="confirmed-payment-badge-row">
                  <span className="payment-secure-icon">🛡️</span>
                  <span>
                    Razorpay Reference: <strong>{confirmedPaymentDetails.paymentId}</strong>
                  </span>
                  <span className="badge-payment-status">Verified Paid</span>
                </div>
              )}

              <div className="confirmed-items-list">
                {items.map((item, idx) => (
                  <div key={idx} className="confirmed-item-row">
                    <img src={item.image} alt={item.name} />
                    <div className="confirmed-item-meta">
                      <h4>{item.name}</h4>
                      <span>Qty: {item.quantity || 1} • {item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="confirmed-total-row">
                <span>
                  Payment via{" "}
                  <strong>
                    {formData.paymentMethod === "razorpay" ? "Razorpay (UPI / Card / NetBanking)" : "Cash on Delivery"}
                  </strong>
                  :
                </span>
                <strong>₹{finalTotal.toFixed(2)}</strong>
              </div>
            </div>

            <div className="success-actions">
              <Link to="/orders" className="btn-primary">
                Track Your Order 🚚
              </Link>
              <Link to="/" className="btn-secondary">
                Continue Browsing 🌸
              </Link>
            </div>
          </section>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-header-banner">
              <Link to="/" className="back-to-shop-link">
                ← Back to Shop
              </Link>
              <h1>Complete Your Floral Order</h1>
              <p>Fresh handpicked flowers, temperature-controlled delivery.</p>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-grid">
              {/* LEFT: DELIVERY & PAYMENT FORMS */}
              <div className="checkout-forms-col">
                {/* 1. Recipient Info */}
                <section className="form-card">
                  <div className="form-card-title">
                    <span className="step-num">1</span>
                    <h3>Recipient & Delivery Details</h3>
                  </div>

                  <div className="input-grid-2">
                    <div className="form-group">
                      <label htmlFor="fullName">Recipient Full Name *</label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="e.g. Eleanor Vance"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Contact Number (10 digits) *</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Your Email Address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="receipt@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Delivery Street Address *</label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Apartment, Studio, Flat, Street Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="input-grid-2">
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pincode">Pincode *</label>
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        placeholder="400001"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* 2. Schedule Delivery */}
                <section className="form-card">
                  <div className="form-card-title">
                    <span className="step-num">2</span>
                    <h3>Delivery Schedule & Gift Message</h3>
                  </div>

                  <div className="input-grid-2">
                    <div className="form-group">
                      <label htmlFor="deliveryDate">Select Delivery Date *</label>
                      <input
                        id="deliveryDate"
                        name="deliveryDate"
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="deliverySlot">Preferred Time Slot</label>
                      <select
                        id="deliverySlot"
                        name="deliverySlot"
                        value={formData.deliverySlot}
                        onChange={handleInputChange}
                      >
                        <option value="Morning (8:00 AM - 11:00 AM)">Morning (8:00 AM - 11:00 AM)</option>
                        <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                        <option value="Evening (5:00 PM - 9:00 PM)">Evening (5:00 PM - 9:00 PM)</option>
                        <option value="Midnight Surprise (11:30 PM - 12:15 AM)">Midnight Special (+₹150)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="giftMessage">Personal Greeting Card Message (Optional)</label>
                    <textarea
                      id="giftMessage"
                      name="giftMessage"
                      rows="3"
                      placeholder="Write your heart out... e.g. 'Happy Birthday! Wishing you warmth and laughter today and always.'"
                      value={formData.giftMessage}
                      onChange={handleInputChange}
                    />
                  </div>
                </section>

                {/* 3. Payment Method */}
                <section className="form-card">
                  <div className="form-card-title">
                    <span className="step-num">3</span>
                    <h3>Select Payment Method</h3>
                  </div>

                  <div className="payment-options-grid">
                    {/* RAZORPAY OPTION */}
                    <label className={`payment-option ${formData.paymentMethod === "razorpay" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === "razorpay"}
                        onChange={handleInputChange}
                      />
                      <span className="payment-icon">⚡</span>
                      <div className="payment-option-body">
                        <div className="payment-option-title-row">
                          <strong>Razorpay Secure Checkout</strong>
                          <span className="payment-badge-recommended">RECOMMENDED</span>
                        </div>
                        <small>Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), NetBanking & Wallets</small>
                      </div>
                    </label>

                    {/* CASH ON DELIVERY OPTION */}
                    <label className={`payment-option ${formData.paymentMethod === "cod" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleInputChange}
                      />
                      <span className="payment-icon">💵</span>
                      <div className="payment-option-body">
                        <strong>Cash on Delivery (COD)</strong>
                        <small>Pay at your doorstep with Cash or UPI upon handover</small>
                      </div>
                    </label>
                  </div>

                  {formData.paymentMethod === "razorpay" ? (
                    <div className="razorpay-feature-banner">
                      <div className="razorpay-badge-icons">
                        <span className="pay-chip">Google Pay</span>
                        <span className="pay-chip">PhonePe</span>
                        <span className="pay-chip">Paytm</span>
                        <span className="pay-chip">BHIM UPI</span>
                        <span className="pay-chip">Cards</span>
                        <span className="pay-chip">NetBanking</span>
                      </div>
                      <p className="razorpay-notice-text">
                        🔒 Safe & 256-bit encrypted checkout. Clicking <strong>"Pay with Razorpay"</strong> will open the official Razorpay modal.
                      </p>
                    </div>
                  ) : (
                    <div className="cod-notice-banner">
                      <p>
                        🌸 Please have exact cash or your UPI app ready when our delivery specialist arrives with your blooms.
                      </p>
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT: ORDER SUMMARY */}
              <div className="checkout-summary-col">
                <div className="sticky-summary-box">
                  <h3>Order Summary ({items.length} {items.length === 1 ? "item" : "items"})</h3>

                  <div className="checkout-items-list">
                    {items.map((item, idx) => (
                      <div key={idx} className="checkout-item-card">
                        <img src={item.image} alt={item.name} />
                        <div className="checkout-item-meta">
                          <h4>{item.name}</h4>
                          <small>Quantity: {item.quantity || 1}</small>
                          <span className="price-tag">{item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Box */}
                  <div className="promo-box">
                    <label htmlFor="promoCode">Have a coupon code?</label>
                    <div className="promo-input-row">
                      <input
                        id="promoCode"
                        type="text"
                        placeholder="FLOWRA10"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <button type="button" onClick={handleApplyPromo}>
                        Apply
                      </button>
                    </div>
                    {promoSuccess && <small className="promo-success">{promoSuccess}</small>}
                    {promoError && <small className="promo-error">{promoError}</small>}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="price-row discount-row">
                        <span>Discount Applied</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="price-row">
                      <span>Eco-Packaging & Box</span>
                      <span className="free-text">FREE</span>
                    </div>
                    <div className="price-row">
                      <span>Delivery Fee</span>
                      <span>{deliveryFee === 0 ? <span className="free-text">FREE</span> : `₹${deliveryFee}`}</span>
                    </div>
                    <div className="divider" />
                    <div className="price-row grand-total-row">
                      <span>Grand Total</span>
                      <span>₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="place-order-btn"
                    disabled={isProcessingPayment}
                    style={{ opacity: isProcessingPayment ? 0.75 : 1 }}
                  >
                    {isProcessingPayment ? (
                      <span>Opening Razorpay Secure Checkout... ⏳</span>
                    ) : formData.paymentMethod === "razorpay" ? (
                      <span>Pay with Razorpay (₹{finalTotal.toFixed(2)}) →</span>
                    ) : (
                      <span>Place Order (₹{finalTotal.toFixed(2)}) →</span>
                    )}
                  </button>

                  <div className="guarantee-badges">
                    <span>🔒 Razorpay 256-Bit Encrypted</span>
                    <span>🌿 100% Farm-Fresh Guarantee</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Purchase;
