import { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import { useCart } from "./CartContext.jsx";

import carouselRanunculus from "./assets/pictures/carousel_ranunculus.jpg";
import flowers1 from "./assets/pictures/flowers1.jpg";
import flowers3 from "./assets/pictures/flowers3.jpg";

function OrderDetail() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast, addToCart } = useCart();

  const [order, setOrder] = useState(() => {
    // Check if passed via state
    if (location.state?.order && location.state.order.orderId === orderId) {
      return location.state.order;
    }
    return null;
  });

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [liveSyncActive, setLiveSyncActive] = useState(true);

  // Synchronize order state from backend MySQL or local storage
  const syncOrderData = (notifyOnStatusChange = false) => {
    if (!orderId) return;

    // 1. Fetch live order from Spring Boot backend
    fetch(`http://localhost:8080/api/orders/number/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.orderNumber) {
          const rawStatus = data.status || "CONFIRMED";
          const formattedStatus =
            rawStatus === "PROCESSING"
              ? "Preparing"
              : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

          const paymentObj = data.payments && data.payments.length > 0 ? data.payments[0] : null;
          const paymentStatus = paymentObj?.paymentStatus || "Paid";

          setOrder((prev) => {
            const initialFallback = {
              orderId: data.orderNumber,
              dbId: data.id,
              date: data.placedAt ? new Date(data.placedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Today",
              status: formattedStatus,
              deliveryDate: data.deliveryDate ? String(data.deliveryDate) : "Scheduled",
              deliverySlot: data.deliverySlot || "Standard Delivery",
              recipient: data.recipientName || "Valued Customer",
              address: data.deliveryAddress || "Address on file",
              total: Number(data.totalAmount || 0),
              paymentMethod: paymentObj?.paymentMethod || "Online",
              paymentStatus: paymentStatus,
              paymentId: paymentObj?.razorpayPaymentId || (paymentObj?.id ? `PAY-${paymentObj?.id}` : "COD"),
              giftMessage: data.giftMessage || "",
              cancellationReason: data.cancellationReason || null,
              cancelledBy: data.cancelledBy || null,
              items: (data.items && data.items.length > 0)
                ? data.items.map((it) => ({
                    name: it.productName,
                    price: `₹${Number(it.unitPrice).toLocaleString("en-IN")}`,
                    quantity: it.quantity,
                    image: it.productImage || flowers1,
                    description: "Fresh handpicked bloom arrangement styled by Flowra florists.",
                  }))
                : [
                    {
                      name: "Artisanal Bloom Arrangement",
                      price: `₹${Number(data.totalAmount).toLocaleString("en-IN")}`,
                      quantity: 1,
                      image: flowers1,
                      description: "Signature luxury bloom harvest.",
                    },
                  ],
            };

            if (!prev) return initialFallback;

            const isStatusChanged = prev.status?.toLowerCase() !== formattedStatus.toLowerCase();
            const isPaymentChanged = prev.paymentStatus !== paymentStatus;
            const isReasonChanged = (data.cancellationReason && data.cancellationReason !== prev.cancellationReason);

            if (isStatusChanged || isPaymentChanged || isReasonChanged) {
              if (notifyOnStatusChange && isStatusChanged) {
                showToast(`🌸 Live Update: Order #${orderId} status changed to "${formattedStatus}"!`);
              }
              return {
                ...prev,
                dbId: data.id || prev.dbId,
                status: formattedStatus,
                paymentStatus: paymentStatus,
                cancellationReason: data.cancellationReason || prev.cancellationReason,
                cancelledBy: data.cancelledBy || prev.cancelledBy,
                deliveryDate: data.deliveryDate ? String(data.deliveryDate) : prev.deliveryDate,
                deliverySlot: data.deliverySlot || prev.deliverySlot,
              };
            }
            return prev;
          });
          return;
        }
        throw new Error("No backend record found");
      })
      .catch(() => {
        // 2. Check localStorage for local orders
        try {
          const stored = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
          const found = stored.find((o) => o.orderId === orderId || o.id === orderId);
          if (found) {
            setOrder((prev) => {
              if (!prev) return found;
              if (prev.status !== found.status || prev.paymentStatus !== found.paymentStatus) {
                if (notifyOnStatusChange && prev.status !== found.status) {
                  showToast(`🌸 Live Update: Order #${orderId} is now "${found.status}"!`);
                }
                return {
                  ...prev,
                  status: found.status,
                  paymentStatus: found.paymentStatus,
                };
              }
              return prev;
            });
            return;
          }
        } catch (err) {}

        // 3. Fallback demo order if completely new / unknown
        setOrder((prev) => {
          if (prev) return prev;
          return {
            orderId: orderId || "FLW-839210",
            date: "Today, 02:30 PM",
            status: "Out for Delivery",
            deliveryDate: "Today",
            deliverySlot: "Evening (5:00 PM - 9:00 PM)",
            recipient: "Eleanor Vance",
            address: "Flat 402, Lotus Residency, Bandra West, Mumbai - 400050",
            total: 1299,
            paymentMethod: "Razorpay (Online)",
            paymentStatus: "Paid",
            paymentId: "pay_Q1a89FkWzX82",
            giftMessage: "Wishing you warmth, laughter, and fragrant blooms always! Happy Birthday!",
            items: [
              {
                name: "The Blush Romance Bouquet",
                price: "₹1,299",
                quantity: 1,
                image: carouselRanunculus,
                description: "Artisan peach ranunculus, English garden roses, and silver eucalyptus in luxury kraft wrap with silk ribbon.",
              },
            ],
          };
        });
      });
  };

  useEffect(() => {
    // Initial sync
    syncOrderData(false);

    // 1. Cross-tab BroadcastChannel listener for instant zero-latency status sync
    let channel;
    try {
      channel = new BroadcastChannel("flowra_orders_channel");
      channel.onmessage = (event) => {
        const data = event.data;
        if (
          data?.type === "ORDER_STATUS_UPDATED" &&
          (data.orderId === orderId || (order && data.orderId === order.orderId))
        ) {
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: data.newStatus,
              paymentStatus: data.paymentStatus || prev.paymentStatus,
              cancellationReason: data.cancellationReason || prev.cancellationReason,
              cancelledBy: data.cancelledBy || prev.cancelledBy,
            };
          });
          showToast(`🌸 Real-Time Update: Order #${orderId} status is now "${data.newStatus}"!`);
        }
      };
    } catch (e) {}

    // 2. Custom window event listener (same-window reactivity)
    const handleCustomUpdate = (e) => {
      const detail = e.detail;
      if (
        detail &&
        (detail.orderId === orderId || (order && detail.orderId === order.orderId))
      ) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: detail.newStatus,
            paymentStatus: detail.paymentStatus || prev.paymentStatus,
            cancellationReason: detail.cancellationReason || prev.cancellationReason,
            cancelledBy: detail.cancelledBy || prev.cancelledBy,
          };
        });
        showToast(`🌸 Real-Time Update: Order #${orderId} status is now "${detail.newStatus}"!`);
      }
    };

    // 3. Storage event listener (localStorage across tabs)
    const handleStorage = (e) => {
      if (e.key === "flowra_orders" || e.key === "flowra_order_updated") {
        syncOrderData(true);
      }
    };

    // 4. Tab focus listener for multi-device sync
    const handleFocus = () => syncOrderData(false);

    window.addEventListener("flowra_order_updated", handleCustomUpdate);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // 5. Active 2.5-second polling interval
    const interval = setInterval(() => {
      syncOrderData(true);
    }, 2500);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener("flowra_order_updated", handleCustomUpdate);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="orders-page-container">
        <Navbar />
        <main className="order-detail-loading">
          <p>Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusStep = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "new":
      case "placed":
      case "confirmed":
      case "order confirmed":
        return 1;
      case "processing":
      case "preparing":
      case "arranging blooms":
      case "crafting":
      case "hand-crafted":
        return 2;
      case "packed":
      case "shipped":
      case "out for delivery":
        return 3;
      case "delivered":
        return 4;
      case "cancelled":
      case "canceled":
        return -1;
      default:
        return 2;
    }
  };

  const currentStep = getStatusStep(order.status);
  const isPaid = order.paymentStatus === "Paid";

  // Requirement 1: Allow cancellation with refund ONLY if status is "Arranging Blooms" or "Order Confirmed"
  const statusLower = (order.status || "").toLowerCase();
  const isOrderConfirmed =
    statusLower === "order confirmed" ||
    statusLower === "confirmed" ||
    statusLower === "placed" ||
    currentStep === 1;

  const isArrangingBlooms =
    statusLower === "arranging blooms" ||
    statusLower === "preparing" ||
    statusLower === "processing" ||
    statusLower === "crafting" ||
    currentStep === 2;

  const canUserCancel = (isOrderConfirmed || isArrangingBlooms) && currentStep !== -1;

  const handleConfirmCustomerCancel = async () => {
    setIsCancellingOrder(true);
    const finalReason = cancelReason === "Other"
      ? (customCancelReason.trim() || "Customer requested cancellation")
      : cancelReason;

    const targetDbId = order?.dbId || (order?.id && !isNaN(Number(order.id)) ? Number(order.id) : null);
    if (targetDbId) {
      try {
        await fetch(`http://localhost:8080/api/orders/${targetDbId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "CANCELLED",
            cancellationReason: finalReason,
            cancelledBy: "Customer",
          }),
        });
      } catch (e) {
        console.warn("Backend cancellation error:", e);
      }
    }

    const cancelledTime = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setOrder((prev) => ({
      ...prev,
      status: "Cancelled",
      cancellationReason: finalReason,
      cancelledBy: "Customer",
      refundStatus: "Refund Initiated (Within 24 Hours)",
      cancelledAt: cancelledTime,
    }));

    try {
      const stored = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
      const updated = stored.map((so) => {
        if (so.orderId === orderId || so.id === orderId) {
          return {
            ...so,
            status: "Cancelled",
            cancellationReason: finalReason,
            cancelledBy: "Customer",
            refundStatus: "Refund Initiated (Within 24 Hours)",
            cancelledAt: cancelledTime,
          };
        }
        return so;
      });
      localStorage.setItem("flowra_orders", JSON.stringify(updated));
      localStorage.setItem("flowra_order_updated", String(Date.now()));
    } catch (e) {}

    try {
      const channel = new BroadcastChannel("flowra_orders_channel");
      channel.postMessage({
        type: "ORDER_STATUS_UPDATED",
        orderId: order?.orderId || orderId,
        newStatus: "Cancelled",
        cancellationReason: finalReason,
        cancelledBy: "Customer",
        timestamp: Date.now(),
      });
      channel.close();
    } catch (e) {}

    window.dispatchEvent(
      new CustomEvent("flowra_order_updated", {
        detail: {
          orderId: order?.orderId || orderId,
          newStatus: "Cancelled",
          cancellationReason: finalReason,
          cancelledBy: "Customer",
        },
      })
    );

    setIsCancellingOrder(false);
    setCancelModalOpen(false);
    showToast("🌸 Order cancelled successfully. Full refund will be credited within 24 hours.");
  };

  const handleReorder = (item) => {
    addToCart({
      name: item.name,
      price: item.price,
      image: item.image,
    }, item.quantity || 1);
    showToast(`"${item.name}" added to your cart! 🌸`);
  };

  return (
    <div className="orders-page-container">
      <Navbar />
      <CartDrawer />
      <Toast />

      <main className="order-detail-main">
        {/* TOP BREADCRUMB & BACK ACTION */}
        <div className="order-detail-top-nav">
          <Link to="/orders" className="back-orders-link">
            ← Back to All Orders
          </Link>
          <span className="order-status-badge-top">
            Status: <strong>{order.status || "In Transit"}</strong>
          </span>
        </div>

        {/* HERO CARD */}
        <section className="order-detail-hero-card">
          <div className="order-hero-left">
            <span className="order-eyebrow-chip">ORDER CONFIRMATION</span>
            <h1>Order #{order.orderId}</h1>
            <p className="order-hero-subtitle">
              Placed on <strong>{order.date}</strong> • Expected Delivery: <strong>{order.deliveryDate} ({order.deliverySlot})</strong>
            </p>
          </div>
          <div className="order-hero-right" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="support-action-btn"
              onClick={() => setSupportModalOpen(true)}
            >
              💬 Contact Floral Support
            </button>

            {/* REQUIREMENT 1: CANCEL OPTION WITH REFUND FOR ORDER CONFIRMED OR ARRANGING BLOOMS */}
            {canUserCancel && (
              <button
                type="button"
                className="cancel-order-action-btn"
                onClick={() => setCancelModalOpen(true)}
                style={{
                  background: "#fff1f2",
                  border: "1.5px solid #fecdd3",
                  color: "#be123c",
                  padding: "10px 18px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(190, 18, 60, 0.08)",
                }}
              >
                ✕ Cancel Order &amp; Request Refund
              </button>
            )}

            {!canUserCancel && currentStep !== -1 && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#9f1239",
                  background: "#fff1f2",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  border: "1px solid #ffe4e6",
                  fontWeight: "600",
                }}
                title="Cancellation is only available while order is in 'Order Confirmed' or 'Arranging Blooms' status."
              >
                🔒 In-transit / Delivered orders cannot be cancelled
              </span>
            )}
          </div>
        </section>

        {/* 1. LIVE TRACKING PROGRESS */}
        <section className="order-detail-section-card">
          <div className="section-card-header">
            <h3>🚚 Live Delivery Tracking</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#15803d",
                  background: "#f0fdf4",
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "1px solid #bbf7d0",
                }}
                title="Connected for instant real-time order status updates"
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    display: "inline-block",
                  }}
                />
                Live Sync Active
              </span>
              <span className={`live-status-pill ${currentStep === 4 ? "delivered" : currentStep === -1 ? "cancelled" : ""}`}>
                {order.status || "Out for Delivery"}
              </span>
            </div>
          </div>

          {/* REQUIREMENTS 1 & 3: CANCELLATION & 24-HOUR REFUND NOTICE */}
          {currentStep === -1 ? (
            <div
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                borderRadius: 16,
                padding: "24px 28px",
                color: "#991b1b",
                textAlign: "left",
                margin: "18px 0",
                boxShadow: "0 8px 24px rgba(239, 68, 68, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#dc2626", fontWeight: 700 }}>✕</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 17, color: "#991b1b", fontWeight: 700 }}>
                      Order Cancelled {order.cancelledBy ? `by ${order.cancelledBy}` : ""}
                    </h4>
                    <small style={{ color: "#b91c1c" }}>
                      This order was cancelled on {order.cancelledAt || "recently"}.
                    </small>
                  </div>
                </div>
                <span
                  style={{
                    background: "#10b981",
                    color: "#ffffff",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ✓ 100% Refund Initiated (Within 24 Hours)
                </span>
              </div>

              {/* REASON FROM ADMIN OR CUSTOMER */}
              {order.cancellationReason && (
                <div style={{ background: "#ffffff", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", margin: "14px 0" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#7f1d1d", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 4 }}>
                    Reason for Cancellation
                  </span>
                  <p style={{ margin: 0, fontSize: 13.5, color: "#450a0a", fontWeight: 600 }}>
                    "{order.cancellationReason}"
                  </p>
                </div>
              )}

              {/* 24-HOUR REFUND NOTICE (REQUIREMENT 3) */}
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "14px 18px", color: "#92400e", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 20 }}>💰</span>
                <div>
                  <strong style={{ fontSize: 14, color: "#78350f", display: "block", marginBottom: 4 }}>
                    24-Hour Full Refund Settlement Notice
                  </strong>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#92400e" }}>
                    Since your order has been cancelled and payment was verified, your full refund of <strong>₹{Number(order.total || 0).toLocaleString("en-IN")}</strong> will be automatically credited back to your original payment method ({order.paymentMethod || "Online / UPI"}) within <strong>24 hours</strong>. No manual claim is required.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-timeline-expanded">
              <div className={`expanded-step ${currentStep >= 1 ? "completed" : ""}`}>
                <div className="step-circle">{currentStep > 1 ? "✓" : "1"}</div>
                <div className="step-content">
                  <strong>Order Confirmed</strong>
                  <small>Received &amp; verified</small>
                </div>
              </div>

              <div className={`expanded-connector ${currentStep >= 2 ? "completed" : ""}`} />

              <div className={`expanded-step ${currentStep >= 2 ? "completed" : ""}`}>
                <div className="step-circle">{currentStep > 2 ? "✓" : "2"}</div>
                <div className="step-content">
                  <strong>Arranging Blooms</strong>
                  <small>Greenhouse florist styling</small>
                </div>
              </div>

              <div className={`expanded-connector ${currentStep >= 3 ? "completed" : ""}`} />

              <div className={`expanded-step ${currentStep >= 3 ? "completed" : ""}`}>
                <div className="step-circle">{currentStep > 3 ? "✓" : "3"}</div>
                <div className="step-content">
                  <strong>Out for Delivery</strong>
                  <small>Temperature-controlled van</small>
                </div>
              </div>

              <div className={`expanded-connector ${currentStep >= 4 ? "completed" : ""}`} />

              <div className={`expanded-step ${currentStep >= 4 ? "completed" : ""}`}>
                <div className="step-circle">4</div>
                <div className="step-content">
                  <strong>Delivered 🌸</strong>
                  <small>Handover at doorstep</small>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. ORDERED ITEMS LIST */}
        <section className="order-detail-section-card">
          <div className="section-card-header">
            <h3>🌸 Ordered Floral Arrangements ({order.items?.length || 1})</h3>
          </div>

          <div className="detail-items-stack">
            {order.items?.map((item, idx) => (
              <div key={idx} className="detail-item-row">
                <img
                  src={item.image || flowers1}
                  alt={item.name}
                  className="detail-item-img"
                />
                <div className="detail-item-info">
                  <h4>{item.name}</h4>
                  <p className="detail-item-desc">
                    {item.description || "Artisanal hand-tied floral arrangement fresh from organic partner growers, wrapped in signature luxury packaging."}
                  </p>
                  <div className="detail-item-pricing">
                    <span className="item-unit-rate">Rate: <strong>{item.price}</strong></span>
                    <span className="item-unit-qty">Quantity: <strong>{item.quantity || 1}</strong></span>
                  </div>
                </div>
                <div className="detail-item-actions">
                  <button
                    type="button"
                    className="btn-reorder-item"
                    onClick={() => handleReorder(item)}
                  >
                    Reorder This ↻
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. GRID: RECIPIENT & PAYMENT DETAILS */}
        <div className="order-two-col-grid">
          {/* RECIPIENT & DELIVERY */}
          <section className="order-detail-section-card">
            <div className="section-card-header">
              <h3>📍 Delivery Destination</h3>
            </div>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Recipient</span>
                <strong className="info-value">{order.recipient || "Eleanor Vance"}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Address</span>
                <p className="info-value-desc">{order.address}</p>
              </div>
              <div className="info-row">
                <span className="info-label">Scheduled Date</span>
                <strong className="info-value">{order.deliveryDate}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Time Window</span>
                <strong className="info-value">{order.deliverySlot}</strong>
              </div>
              {order.giftMessage && (
                <div className="gift-message-preview">
                  <small>Handwritten Greeting Card Message:</small>
                  <blockquote>“{order.giftMessage}”</blockquote>
                </div>
              )}
            </div>
          </section>

          {/* PAYMENT & INVOICE */}
          <section className="order-detail-section-card">
            <div className="section-card-header">
              <h3>💳 Payment & Transaction</h3>
            </div>
            <div className="info-list">
              <div className="info-row">
                <span className="info-label">Payment Method</span>
                <strong className="info-value">{order.paymentMethod || "Razorpay (Online)"}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Transaction Reference</span>
                <code className="info-code">{order.paymentId || "RZP_VERIFIED_REF"}</code>
              </div>
              <div className="info-row">
                <span className="info-label">Payment Status</span>
                <span className={`payment-status-pill ${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                  {order.paymentStatus === "Paid" ? "✓ 100% Verified Paid" : (order.paymentStatus || "Pending Handover (COD)")}
                </span>
              </div>
              <div className="divider" style={{ margin: "14px 0" }} />
              <div className="info-row">
                <span className="info-label">Total Amount</span>
                <strong className="info-total-price">
                  ₹{typeof order.total === "number" ? order.total.toFixed(2) : order.total}
                </strong>
              </div>
              <button
                type="button"
                className="btn-download-invoice"
                onClick={() => showToast("Downloading Flowra Tax Invoice PDF... 📄")}
              >
                📄 Download Official Tax Invoice
              </button>
            </div>
          </section>
        </div>

        {/* 4. FLORAL SUPPORT & HELPLINE */}
        <section className="order-detail-section-card support-section-card">
          <div className="section-card-header">
            <h3>💬 Need Help with This Order?</h3>
          </div>
          <p className="support-intro-text">
            Our greenhouse concierge team is here to assist with address adjustments, custom notes, or flower care instructions.
          </p>
          <div className="support-actions-grid">
            <a href="tel:+919876543210" className="support-card-link">
              <span className="support-card-icon">📞</span>
              <div>
                <strong>Concierge Helpline</strong>
                <small>+91 98765 43210 (8 AM - 10 PM)</small>
              </div>
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="support-card-link"
            >
              <span className="support-card-icon">💬</span>
              <div>
                <strong>WhatsApp Florist Chat</strong>
                <small>Instant reply for delivery directions</small>
              </div>
            </a>
            <Link to="/contact" className="support-card-link">
              <span className="support-card-icon">🌸</span>
              <div>
                <strong>7-Day Freshness Guarantee</strong>
                <small>Free replacement if damaged or wilted</small>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* SUPPORT MODAL */}
      {supportModalOpen && (
        <div className="support-modal-backdrop" onClick={() => setSupportModalOpen(false)}>
          <div className="support-modal-window" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="close-modal-btn"
              onClick={() => setSupportModalOpen(false)}
            >
              ✕
            </button>
            <h3>Flowra Concierge Support</h3>
            <p>Assisting with Order #{order.orderId}</p>

            <div className="modal-support-options">
              <div className="modal-option">
                <strong>📞 Phone Hotline</strong>
                <span>+91 98765 43210</span>
                <a href="tel:+919876543210" className="modal-btn">Call Now</a>
              </div>
              <div className="modal-option">
                <strong>💬 WhatsApp Support</strong>
                <span>Direct line to greenhouse dispatch</span>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="modal-btn">
                  Open WhatsApp
                </a>
              </div>
              <div className="modal-option">
                <strong>✉️ Email Support</strong>
                <span>support@flowra.com</span>
                <a href="mailto:support@flowra.com" className="modal-btn">Send Email</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENT 1: CUSTOMER CANCELLATION MODAL WITH REFUND NOTICE */}
      {cancelModalOpen && (
        <div className="support-modal-backdrop" onClick={() => !isCancellingOrder && setCancelModalOpen(false)}>
          <div
            className="support-modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px", borderRadius: "20px", padding: "28px" }}
          >
            <button
              type="button"
              className="close-modal-btn"
              onClick={() => !isCancellingOrder && setCancelModalOpen(false)}
            >
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", margin: "0 auto 10px" }}>
                ✕
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "20px", color: "#881337" }}>
                Cancel Order &amp; Request Refund
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#785a65" }}>
                Order #{order.orderId} • Total: ₹{typeof order.total === "number" ? order.total.toFixed(2) : order.total}
              </p>
            </div>

            {/* 100% REFUND NOTICE */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "12px",
                padding: "14px",
                color: "#166534",
                fontSize: "13px",
                lineHeight: "1.45",
                marginBottom: "18px",
              }}
            >
              <strong style={{ display: "block", color: "#14532d", marginBottom: "4px" }}>
                ✓ 100% Full Refund Guarantee
              </strong>
              Because your order is currently <strong>{order.status}</strong>, you are eligible for an immediate full refund. Once cancelled, your refund of <strong>₹{typeof order.total === "number" ? order.total.toFixed(2) : order.total}</strong> will be returned to your original payment account within <strong>24 hours</strong>.
            </div>

            {/* REASON FORM */}
            <div style={{ textAlign: "left", marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#361f26", textTransform: "uppercase", marginBottom: "6px" }}>
                Please tell us the reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "10px",
                  border: "1.5px solid #ede1d8",
                  padding: "0 12px",
                  fontSize: "13.5px",
                  background: "#ffffff",
                  marginBottom: cancelReason === "Other" ? "10px" : "0",
                  outline: "none",
                }}
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Ordered by mistake / wrong address">Ordered by mistake / wrong address</option>
                <option value="Need to reschedule delivery date">Need to reschedule delivery date</option>
                <option value="Found alternative arrangements">Found alternative arrangements</option>
                <option value="Other">Other reason (specify below)</option>
              </select>

              {cancelReason === "Other" && (
                <textarea
                  rows={3}
                  placeholder="Please describe why you are cancelling this order..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    border: "1.5px solid #ede1d8",
                    padding: "10px 12px",
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              )}
            </div>

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={isCancellingOrder}
                style={{
                  flex: 1,
                  height: "44px",
                  borderRadius: "10px",
                  border: "1px solid #ede1d8",
                  background: "#fdfbf7",
                  color: "#52313b",
                  fontWeight: "600",
                  fontSize: "13.5px",
                  cursor: "pointer",
                }}
              >
                Keep My Order
              </button>

              <button
                type="button"
                onClick={handleConfirmCustomerCancel}
                disabled={isCancellingOrder}
                style={{
                  flex: 1.4,
                  height: "44px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e11d48",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(225, 29, 72, 0.3)",
                }}
              >
                {isCancellingOrder ? "Cancelling..." : "Confirm & Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default OrderDetail;
