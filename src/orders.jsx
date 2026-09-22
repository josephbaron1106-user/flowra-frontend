import { useState, useEffect, useCallback } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";

import carouselRanunculus from "./assets/pictures/carousel_ranunculus.jpg";
import carouselProtea from "./assets/pictures/carousel_protea.jpg";
import carouselCalla from "./assets/pictures/carousel_calla.jpg";
import flowers1 from "./assets/pictures/flowers1.jpg";
import flowers3 from "./assets/pictures/flowers3.jpg";

const DEFAULT_SAMPLE_ORDERS = [
  {
    orderId: "FLW-839210",
    date: "Today, 2:30 PM",
    status: "Out for Delivery",
    deliveryDate: "Today",
    deliverySlot: "Evening (5:00 PM - 9:00 PM)",
    recipient: "Eleanor Vance",
    address: "Flat 402, Lotus Residency, Bandra West, Mumbai - 400050",
    total: 1299,
    paymentMethod: "Razorpay (Online)",
    paymentStatus: "Paid",
    paymentId: "pay_Q1a89FkWzX82",
    giftMessage: "Happy Birthday! Wishing you warmth, laughter, and fragrant blooms always.",
    items: [
      {
        name: "The Blush Romance Bouquet",
        price: "₹1,299",
        quantity: 1,
        image: carouselRanunculus,
        description: "Artisan peach ranunculus, English garden roses, and silver eucalyptus in luxury kraft wrap.",
      },
    ],
  },
  {
    orderId: "FLW-928401",
    date: "Yesterday, 11:15 AM",
    status: "Processing",
    deliveryDate: "Tomorrow",
    deliverySlot: "Morning (8:00 AM - 11:00 AM)",
    recipient: "Aarav Sharma",
    address: "Villa 12, Palm Meadows, Whitefield, Bengaluru - 560066",
    total: 2499,
    paymentMethod: "Razorpay (Online)",
    paymentStatus: "Paid",
    paymentId: "pay_R8b92NkXyW10",
    giftMessage: "Congratulations on your anniversary! With all our love.",
    items: [
      {
        name: "The Imperial Botanical Luxe",
        price: "₹2,499",
        quantity: 1,
        image: carouselProtea,
        description: "Rare South African white king protea with cascading lilac phalaenopsis orchids on marble styling.",
      },
    ],
  },
  {
    orderId: "FLW-734190",
    date: "Aug 30, 2026",
    status: "Delivered",
    deliveryDate: "Aug 30, 2026",
    deliverySlot: "Afternoon (1:00 PM - 4:00 PM)",
    recipient: "Rhea Kapoor",
    address: "14th Floor, Skyline Towers, Worli, Mumbai - 400018",
    total: 1899,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    paymentId: "COD_FLW-734190",
    giftMessage: "Thank you for being the brightest bloom in my life!",
    items: [
      {
        name: "The Midnight Velvet Symphony",
        price: "₹1,899",
        quantity: 1,
        image: carouselCalla,
        description: "Deep obsidian calla lilies, burgundy dahlias, and frosted dusty blue hydrangeas.",
      },
    ],
  },
];

function Orders() {
  const { showToast } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const formatStatus = (rawStatus) => {
    if (!rawStatus) return "Processing";
    const upper = String(rawStatus).toUpperCase();
    if (upper === "PROCESSING") return "Preparing";
    if (upper === "OUT_FOR_DELIVERY" || upper === "OUT FOR DELIVERY") return "Out for Delivery";
    if (upper === "SHIPPED") return "Shipped";
    if (upper === "DELIVERED") return "Delivered";
    if (upper === "CANCELLED" || upper === "CANCELED") return "Cancelled";
    if (upper === "CONFIRMED") return "Confirmed";
    return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
  };

  const loadAndSyncOrders = useCallback(async () => {
    let localList = [];
    try {
      localList = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
    } catch (e) {
      console.warn("Could not read local orders:", e);
    }

    let backendList = [];
    try {
      const res = await fetch("http://localhost:8080/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          backendList = data;
        }
      }
    } catch (e) {
      // Backend may be temporarily offline
    }

    const mappedBackend = backendList.map((bo) => {
      const paymentObj = bo.payments && bo.payments.length > 0 ? bo.payments[0] : null;
      return {
        orderId: bo.orderNumber || `FLW-${bo.id}`,
        dbId: bo.id,
        date: bo.placedAt
          ? new Date(bo.placedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Today",
        status: formatStatus(bo.status),
        deliveryDate: bo.deliveryDate ? String(bo.deliveryDate) : "Scheduled",
        deliverySlot: bo.deliverySlot || "Standard Delivery",
        recipient: bo.recipientName || "Valued Customer",
        address: bo.deliveryAddress || "Address on file",
        total: Number(bo.totalAmount || 0),
        paymentMethod: paymentObj?.paymentMethod || "Online",
        paymentStatus: paymentObj?.paymentStatus || "Paid",
        paymentId: paymentObj?.razorpayPaymentId || (paymentObj?.id ? `PAY-${paymentObj?.id}` : "COD"),
        giftMessage: bo.giftMessage || "",
        cancellationReason: bo.cancellationReason || null,
        cancelledBy: bo.cancelledBy || null,
        items:
          bo.items && bo.items.length > 0
            ? bo.items.map((it) => ({
                name: it.productName,
                price: `₹${Number(it.unitPrice).toLocaleString("en-IN")}`,
                quantity: it.quantity,
                image: it.productImage || flowers1,
                description: "Fresh handpicked bloom arrangement styled by Flowra florists.",
              }))
            : [
                {
                  name: "Artisanal Bloom Arrangement",
                  price: `₹${Number(bo.totalAmount || 999).toLocaleString("en-IN")}`,
                  quantity: 1,
                  image: flowers1,
                  description: "Signature luxury bloom harvest.",
                },
              ],
      };
    });

    const mergedMap = new Map();

    mappedBackend.forEach((o) => {
      mergedMap.set(o.orderId, o);
    });

    localList.forEach((lo) => {
      const id = lo.orderId || lo.id;
      if (!id) return;
      if (mergedMap.has(id)) {
        const existing = mergedMap.get(id);
        mergedMap.set(id, {
          ...lo,
          ...existing,
          items: lo.items && lo.items.length > 0 ? lo.items : existing.items,
          status: formatStatus(existing.status || lo.status),
          paymentStatus: existing.paymentStatus || lo.paymentStatus || "Paid",
          cancellationReason: existing.cancellationReason || lo.cancellationReason || null,
          cancelledBy: existing.cancelledBy || lo.cancelledBy || null,
        });
      } else {
        mergedMap.set(id, {
          ...lo,
          orderId: id,
          status: formatStatus(lo.status),
          paymentStatus: lo.paymentStatus || "Paid",
          cancellationReason: lo.cancellationReason || null,
          cancelledBy: lo.cancelledBy || null,
        });
      }
    });

    if (mergedMap.size > 0) {
      setOrders(Array.from(mergedMap.values()));
    } else {
      setOrders(DEFAULT_SAMPLE_ORDERS);
    }
  }, []);

  useEffect(() => {
    loadAndSyncOrders();

    // 1. Instant cross-tab real-time sync via BroadcastChannel
    let channel = null;
    try {
      channel = new BroadcastChannel("flowra_orders_channel");
      channel.onmessage = (event) => {
        if (event.data && event.data.type === "ORDER_STATUS_UPDATED") {
          const { orderId, newStatus, paymentStatus, cancellationReason, cancelledBy } = event.data;
          setOrders((prev) =>
            prev.map((o) =>
              o.orderId === orderId || o.id === orderId
                ? {
                    ...o,
                    status: formatStatus(newStatus),
                    paymentStatus: paymentStatus || o.paymentStatus,
                    cancellationReason: cancellationReason !== undefined ? cancellationReason : o.cancellationReason,
                    cancelledBy: cancelledBy !== undefined ? cancelledBy : o.cancelledBy,
                  }
                : o
            )
          );
          loadAndSyncOrders();
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel not available:", e);
    }

    // 2. Custom window event listener
    const handleCustomOrderUpdate = (e) => {
      if (e.detail) {
        const { orderId, newStatus, paymentStatus, cancellationReason, cancelledBy } = e.detail;
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId || o.id === orderId
              ? {
                  ...o,
                  status: formatStatus(newStatus),
                  paymentStatus: paymentStatus || o.paymentStatus,
                  cancellationReason: cancellationReason !== undefined ? cancellationReason : o.cancellationReason,
                  cancelledBy: cancelledBy !== undefined ? cancelledBy : o.cancelledBy,
                }
              : o
          )
        );
        loadAndSyncOrders();
      }
    };
    window.addEventListener("flowra_order_updated", handleCustomOrderUpdate);

    // 3. Storage event listener across tabs
    const handleStorageChange = (e) => {
      if (e.key === "flowra_orders" || e.key === "flowra_order_updated") {
        loadAndSyncOrders();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 4. Tab visibility and focus listener
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadAndSyncOrders();
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);

    // 5. Periodic polling (every 3.5s) for zero-latency sync across external devices
    const pollInterval = setInterval(() => {
      loadAndSyncOrders();
    }, 3500);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("flowra_order_updated", handleCustomOrderUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      clearInterval(pollInterval);
    };
  }, [loadAndSyncOrders]);

  const getItemDescription = (item) => {
    if (item.description) return item.description;
    const nameLower = (item.name || "").toLowerCase();
    if (nameLower.includes("blush") || nameLower.includes("ranunculus")) {
      return "Artisan peach ranunculus, English garden roses, and silver eucalyptus in luxury kraft wrap.";
    }
    if (nameLower.includes("protea") || nameLower.includes("imperial")) {
      return "Rare South African white king protea with cascading lilac phalaenopsis orchids on marble styling.";
    }
    if (nameLower.includes("midnight") || nameLower.includes("calla")) {
      return "Deep obsidian calla lilies, burgundy dahlias, and frosted dusty blue hydrangeas.";
    }
    if (nameLower.includes("rose")) {
      return "Freshly cut long-stem garden roses conditioned with nutrient food for extended bloom life.";
    }
    if (nameLower.includes("tulip")) {
      return "Crisp Holland ruffled tulips hand-tied with silk ribbon and eco-friendly wrap.";
    }
    if (nameLower.includes("jasmine")) {
      return "Freshly plucked aromatic jasmine posy tied with traditional scented craft string.";
    }
    return "Artisanal handpicked floral arrangement conditioned for 100% farm-to-vase freshness guarantee.";
  };

  // Flatten every ordered item into its own standalone card linked to its parent order
  const orderedItemsList = [];
  orders.forEach((order) => {
    const items = order.items && order.items.length > 0
      ? order.items
      : [
          {
            name: "Premium Floral Arrangement",
            price: `₹${order.total || 999}`,
            quantity: 1,
            image: flowers1,
          },
        ];

    items.forEach((item, itemIdx) => {
      orderedItemsList.push({
        uniqueKey: `${order.orderId}-${itemIdx}-${item.name}`,
        order,
        item,
        description: getItemDescription(item),
      });
    });
  });

  // Filter items by search query
  const filteredItems = searchQuery
    ? orderedItemsList.filter(
        ({ order, item, description }) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.recipient?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orderedItemsList;

  const handleCardClick = (order, item) => {
    navigate(`/orders/${order.orderId}`, {
      state: {
        order,
        selectedItem: item,
      },
    });
  };

  return (
    <div className="orders-page-container">
      <Navbar />
      <CartDrawer />
      <Toast />

      {/* HEADER WITH SEARCH BAR & LIVE SYNC BADGE */}
      <section className="orders-hero">
        <div className="orders-hero-content">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.28)", borderRadius: "999px", padding: "5px 14px", fontSize: "11px", fontWeight: "700", color: "#065f46", marginBottom: "12px", letterSpacing: "0.5px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", display: "inline-block" }}></span>
            LIVE ORDER SYNCHRONIZATION ACTIVE
          </div>
          <span className="orders-eyebrow">YOUR FLORAL PURCHASES</span>
          <h1>My Ordered Flowers & Bouquets</h1>
          <p>
            Click any floral item below to view full tracking, delivery updates, recipient details, and customer support.
          </p>

          <div className="order-search-bar">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by flower name, bouquet, Order ID (e.g. FLW-839210)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* BODY: EACH ORDERED ITEM IN A SEPARATE CLICKABLE CARD */}
      <section className="orders-list-section">
        {filteredItems.length === 0 ? (
          <div className="empty-orders-state">
            <div className="empty-icon">🌸</div>
            <h3>No ordered items found</h3>
            <p>You haven’t ordered any blooms matching your search.</p>
            <Link to="/" className="btn-primary">
              Explore Flower Collection 🌸
            </Link>
          </div>
        ) : (
          <div className="ordered-items-cards-grid">
            {filteredItems.map(({ uniqueKey, order, item, description }) => {
              const statusLower = (order.status || "").toLowerCase();
              const isDelivered = statusLower === "delivered";
              const isCancelled = statusLower === "cancelled" || statusLower === "canceled";
              const isOutForDelivery = statusLower === "out for delivery" || statusLower === "shipped";
              const isConfirmed = statusLower === "confirmed";
              const isPaid = (order.paymentStatus || "").toLowerCase() === "paid";

              return (
                <article
                  key={uniqueKey}
                  className="ordered-item-card"
                  onClick={() => handleCardClick(order, item)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCardClick(order, item);
                    }
                  }}
                  aria-label={`View order details for ${item.name}`}
                >
                  {/* ITEM IMAGE */}
                  <div className="item-card-image-wrap">
                    <img
                      src={item.image || flowers1}
                      alt={item.name}
                      loading="lazy"
                    />
                    <span
                      className={`item-status-tag ${
                        isDelivered
                          ? "status-delivered"
                          : isCancelled
                          ? "status-cancelled"
                          : isOutForDelivery
                          ? "status-out"
                          : isConfirmed
                          ? "status-confirmed"
                          : "status-processing"
                      }`}
                    >
                      {isDelivered
                        ? "✓ Delivered"
                        : isCancelled
                        ? "✕ Cancelled"
                        : isOutForDelivery
                        ? "🚚 In Transit"
                        : isConfirmed
                        ? "✓ Confirmed"
                        : "⏳ " + (order.status || "Processing")}
                    </span>
                  </div>

                  {/* ITEM CONTENT & DETAILS */}
                  <div className="item-card-body">
                    <div className="item-card-header-row">
                      <span className="item-order-ref">Order #{order.orderId}</span>
                      <span className="item-order-date">Placed: {order.date}</span>
                    </div>

                    <h3 className="item-card-title">{item.name}</h3>

                    <p className="item-card-desc">{description}</p>

                    <div className="item-card-meta-row">
                      <div className="item-rate-badge">
                        <small>Rate / Price</small>
                        <strong>{item.price}</strong>
                      </div>

                      <div className="item-qty-badge">
                        <small>Quantity</small>
                        <strong>{item.quantity || 1} {Number(item.quantity) > 1 ? "Units" : "Unit"}</strong>
                      </div>

                      <div className="item-recipient-badge">
                        <small>Deliver to</small>
                        <strong>{order.recipient || "Eleanor Vance"}</strong>
                      </div>

                      <div className="item-rate-badge">
                        <small>Payment ({order.paymentMethod || "COD"})</small>
                        <strong style={{ color: isPaid ? "#10b981" : "#d97706" }}>
                          {isPaid ? "✓ Paid" : (order.paymentStatus || "Pending")}
                        </strong>
                      </div>
                    </div>

                    {/* CANCELLATION & 24-HR REFUND NOTICE IF CANCELLED */}
                    {isCancelled && (
                      <div
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          marginBottom: "14px",
                          fontSize: "12px",
                          color: "#991b1b",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: order.cancellationReason ? "4px" : "0", flexWrap: "wrap", gap: "6px" }}>
                          <strong>✕ Order Cancelled {order.cancelledBy ? `(${order.cancelledBy})` : ""}</strong>
                          <span style={{ background: "#10b981", color: "#ffffff", padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700 }}>
                            ✓ 100% Refund within 24 hrs
                          </span>
                        </div>
                        {order.cancellationReason && (
                          <div style={{ color: "#7f1d1d", fontSize: "11.5px", fontStyle: "italic" }}>
                            Reason: "{order.cancellationReason}"
                          </div>
                        )}
                      </div>
                    )}

                    {/* CALLOUT TO CLICK */}
                    <div className="item-card-action-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      {(isConfirmed || (statusLower === "preparing" || statusLower === "processing" || statusLower === "arranging blooms")) && !isCancelled ? (
                        <span style={{ fontSize: "11.5px", color: "#be123c", fontWeight: 700, background: "#fff1f2", padding: "4px 10px", borderRadius: "8px", border: "1px solid #fecdd3" }}>
                          ✕ Cancellation &amp; Refund Eligible
                        </span>
                      ) : <span />}
                      <span className="click-indicator">
                        View Tracking, Order Details & Support <span>→</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

export default Orders;
