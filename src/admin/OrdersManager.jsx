import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout.jsx";

import carouselRanunculus from "../assets/pictures/carousel_ranunculus.jpg";
import carouselProtea from "../assets/pictures/carousel_protea.jpg";
import carouselCalla from "../assets/pictures/carousel_calla.jpg";
import flowers1 from "../assets/pictures/flowers1.jpg";
import flowers2 from "../assets/pictures/flowers2.jpg";
import flowers3 from "../assets/pictures/flowers3.jpg";
import flower4 from "../assets/pictures/flower4.jpg";

const CANCELLATION_PRESETS = {
  inventory: [
    "Fresh flower inventory unavailable / damaged stems during conditioning",
    "Specific exotic flower variety out of stock from wholesale auction",
    "Failed floral freshness quality inspection prior to bouquet styling",
    "Seasonal bloom supply shortage from local/international growers",
  ],
  logistics: [
    "Delivery address outside standard coverage radius or unserviceable zone",
    "Extreme adverse weather / severe transit disruption preventing safe transit",
    "Customer requested delivery time slot cannot be accommodated",
    "Incomplete recipient address or unreachable recipient contact number",
  ],
  customer: [
    "Customer requested order cancellation via concierge telephone / chat",
    "Duplicate order placed accidentally by customer",
    "Customer requested delivery reschedule beyond maximum holding window",
    "Customer changed occasion or flower choice preference",
  ],
};

function OrdersManager() {
  const initialOrders = [
    {
      id: "FLW-94021",
      customer: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      phone: "+91 98201 44820",
      address: "Flat 702, Sea View Towers, Worli, Mumbai - 400018",
      items: [
        { name: "The Blush Romance Bouquet", image: carouselRanunculus, price: 1299, qty: 1 },
      ],
      amount: 1299,
      discount: 0,
      deliveryFee: 0,
      paymentMethod: "UPI (Google Pay)",
      paymentStatus: "Paid",
      orderStatus: "Preparing",
      orderDate: "Sep 01, 2026, 02:45 PM",
      deliveryDate: "Today, Sep 01",
      deliverySlot: "Evening (5:00 PM - 9:00 PM)",
      giftMessage: "Happy Anniversary my love! Forever blooming with you. - Rohan",
    },
    {
      id: "FLW-94020",
      customer: "Rahul Mehta",
      email: "rahul.mehta@yahoo.com",
      phone: "+91 97690 12345",
      address: "B-403, Palm Grove, Bandra West, Mumbai - 400050",
      items: [
        { name: "24x Premium Long Stem Red Roses", image: flowers1, price: 999, qty: 1 },
      ],
      amount: 999,
      discount: 100,
      deliveryFee: 0,
      paymentMethod: "Credit Card (Visa)",
      paymentStatus: "Paid",
      orderStatus: "Out for Delivery",
      orderDate: "Sep 01, 2026, 01:15 PM",
      deliveryDate: "Today, Sep 01",
      deliverySlot: "Afternoon (1:00 PM - 4:00 PM)",
      giftMessage: "Happy Birthday Mom! Wishing you radiant joy always.",
    },
    {
      id: "FLW-94019",
      customer: "Ananya Iyer",
      email: "ananya.iyer@outlook.com",
      phone: "+91 99302 88441",
      address: "14, Heritage Bunglow, Juhu Tara Road, Mumbai - 400049",
      items: [
        { name: "The Imperial Botanical Luxe", image: carouselProtea, price: 2499, qty: 1 },
      ],
      amount: 2499,
      discount: 0,
      deliveryFee: 0,
      paymentMethod: "UPI (PhonePe)",
      paymentStatus: "Paid",
      orderStatus: "Confirmed",
      orderDate: "Sep 01, 2026, 12:30 PM",
      deliveryDate: "Tomorrow, Sep 02",
      deliverySlot: "Morning (8:00 AM - 11:00 AM)",
      giftMessage: "Congratulations on the new studio launch!",
    },
    {
      id: "FLW-94018",
      customer: "Vikram Sen",
      email: "vikram.sen@techcorp.in",
      phone: "+91 98190 77332",
      address: "Tower 3, Penthouse 22, Lodha Bellissimo, Mahalaxmi, Mumbai - 400011",
      items: [
        { name: "The Midnight Velvet Symphony", image: carouselCalla, price: 1899, qty: 1 },
      ],
      amount: 1899,
      discount: 0,
      deliveryFee: 0,
      paymentMethod: "Corporate Net Banking",
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      orderDate: "Sep 01, 2026, 10:10 AM",
      deliveryDate: "Today, Sep 01",
      deliverySlot: "Morning (8:00 AM - 11:00 AM)",
      giftMessage: "Warmest congratulations on your partnership milestone.",
    },
    {
      id: "FLW-94017",
      customer: "Neha Kapoor",
      email: "neha.kapoor@gmail.com",
      phone: "+91 98211 55667",
      address: "A-12, Green Acres, Powai, Mumbai - 400076",
      items: [
        { name: "Pastel Springtime Dream", image: flowers3, price: 899, qty: 1 },
      ],
      amount: 899,
      discount: 0,
      deliveryFee: 50,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Paid",
      orderStatus: "Delivered",
      orderDate: "Aug 31, 2026, 06:20 PM",
      deliveryDate: "Aug 31",
      deliverySlot: "Evening (5:00 PM - 9:00 PM)",
      giftMessage: "Get well soon dearest! Thinking of you.",
    },
    {
      id: "FLW-94016",
      customer: "Deepak Verma",
      email: "deepak.verma@hotmail.com",
      phone: "+91 97731 22990",
      address: "502, Orchid Heights, Chembur, Mumbai - 400071",
      items: [
        { name: "Fresh Jasmine Harmony & Hibiscus", image: flowers2, price: 749, qty: 1 },
        { name: "Crimson Red Hibiscus Stem", image: flower4, price: 60, qty: 4 },
      ],
      amount: 989,
      discount: 50,
      deliveryFee: 0,
      paymentMethod: "UPI (Paytm)",
      paymentStatus: "Paid",
      orderStatus: "Packed",
      orderDate: "Sep 01, 2026, 09:00 AM",
      deliveryDate: "Today, Sep 01",
      deliverySlot: "Evening (5:00 PM - 9:00 PM)",
      giftMessage: "Pure prayers and auspicious wishes for the new house!",
    },
  ];

  const [orders, setOrders] = useState(() => {
    try {
      const userOrders = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
      if (userOrders.length > 0) {
        const formattedUserOrders = userOrders.map((uo) => ({
          id: uo.id || `FLW-${Math.floor(10000 + Math.random() * 90000)}`,
          customer: uo.recipient || uo.customer || "Valued Customer",
          email: uo.email || "customer@flowra.com",
          phone: uo.phone || "+91 98765 00000",
          address: uo.address || "Address not provided",
          items: uo.items || [{ name: "Artisanal Bloom Arrangement", price: uo.total || 999, qty: 1 }],
          amount: uo.total || 999,
          discount: uo.discount || 0,
          deliveryFee: 0,
          paymentMethod: uo.paymentMethod || "Online",
          paymentStatus: uo.paymentStatus || "Paid",
          orderStatus: uo.status === "Processing" ? "Preparing" : (uo.status || "Confirmed"),
          orderDate: uo.orderDate || "Recently placed",
          deliveryDate: uo.deliveryDate || "Scheduled",
          deliverySlot: uo.deliverySlot || "Standard Delivery",
          giftMessage: uo.giftMessage || "",
          cancellationReason: uo.cancellationReason || null,
          cancelledBy: uo.cancelledBy || null,
        }));
        return [...formattedUserOrders, ...initialOrders];
      }
    } catch (e) {
      console.error(e);
    }
    return initialOrders;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Requirement 3: Admin Cancellation Reason Tab & Modal State
  const [cancelModalData, setCancelModalData] = useState(null); // { orderId, targetOrder }
  const [selectedReasonTab, setSelectedReasonTab] = useState("inventory");
  const [selectedPresetReason, setSelectedPresetReason] = useState("Fresh flower inventory unavailable / damaged stems during conditioning");
  const [customReasonText, setCustomReasonText] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  useEffect(() => {
    fetch("https://flowra-backend-1.onrender.com/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiOrders = data.map((o) => ({
            id: o.orderNumber || `FLW-${o.id}`,
            dbId: o.id,
            customer: o.recipientName || "Customer",
            email: "customer@flowra.com",
            phone: o.recipientPhone || "+91 98765 00000",
            address: o.deliveryAddress || "Address not provided",
            items: (o.items && o.items.length > 0)
              ? o.items.map((it) => ({ name: it.productName, price: Number(it.unitPrice), qty: it.quantity }))
              : [{ name: "Artisanal Blooms", price: Number(o.totalAmount), qty: 1 }],
            amount: Number(o.totalAmount),
            discount: Number(o.discountAmount || 0),
            deliveryFee: Number(o.deliveryFee || 0),
            paymentMethod: o.payments && o.payments.length > 0 ? o.payments[0].paymentMethod : "Online",
            paymentStatus: o.payments && o.payments.length > 0 ? o.payments[0].paymentStatus : "Paid",
            orderStatus: o.status === "PROCESSING" ? "Preparing" : (o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase() : "Confirmed"),
            orderDate: o.placedAt ? new Date(o.placedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Today",
            deliveryDate: o.deliveryDate || "Scheduled",
            deliverySlot: o.deliverySlot || "Standard Delivery",
            giftMessage: o.giftMessage || "",
            cancellationReason: o.cancellationReason || null,
            cancelledBy: o.cancelledBy || null,
          }));
          setOrders((prev) => {
            const existingIds = new Set(apiOrders.map((ao) => ao.id));
            return [...apiOrders, ...prev.filter((pr) => !existingIds.has(pr.id))];
          });
        }
      })
      .catch((err) => console.warn("Orders sync warning:", err));
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const target = orders.find((o) => o.id === orderId);

    // Requirement 3: If admin selects Cancelled, trigger the Cancellation Reason Modal
    if (newStatus === "Cancelled") {
      setSelectedReasonTab("inventory");
      setSelectedPresetReason(CANCELLATION_PRESETS.inventory[0]);
      setCustomReasonText("");
      setCancelModalData({ orderId, targetOrder: target });
      return;
    }

    const isCod = target && (
      (target.paymentMethod || "").toLowerCase().includes("cod") ||
      (target.paymentMethod || "").toLowerCase().includes("cash")
    );
    const updatedPaymentStatus = (newStatus === "Delivered" && isCod) ? "Paid" : target?.paymentStatus || "Paid";

    if (target && target.dbId) {
      fetch(`https://flowra-backend-1.onrender.com/api/orders/${target.dbId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.payments && res.payments.length > 0) {
            const serverPaymentStatus = res.payments[0].paymentStatus;
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: serverPaymentStatus } : o))
            );
            if (selectedOrder && selectedOrder.id === orderId) {
              setSelectedOrder((prev) => ({ ...prev, paymentStatus: serverPaymentStatus }));
            }
          }
        })
        .catch(console.warn);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, orderStatus: newStatus, paymentStatus: updatedPaymentStatus } : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus, paymentStatus: updatedPaymentStatus }));
    }

    // Update localStorage so user-facing storefront tracking stays in sync
    try {
      const stored = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
      const updated = stored.map((so) => {
        if (so.orderId === orderId || so.id === orderId) {
          return {
            ...so,
            status: newStatus,
            paymentStatus: (newStatus === "Delivered" && isCod) ? "Paid" : so.paymentStatus,
          };
        }
        return so;
      });
      localStorage.setItem("flowra_orders", JSON.stringify(updated));
      localStorage.setItem("flowra_order_updated", String(Date.now()));
    } catch (e) {
      console.warn("Storage sync warning:", e);
    }

    // Broadcast across all open tabs (Real-Time Synchronization)
    try {
      const channel = new BroadcastChannel("flowra_orders_channel");
      channel.postMessage({
        type: "ORDER_STATUS_UPDATED",
        orderId,
        newStatus,
        paymentStatus: updatedPaymentStatus,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("flowra_order_updated", { detail: { orderId, newStatus, paymentStatus: updatedPaymentStatus } }));

    if (newStatus === "Delivered" && isCod) {
      triggerToast(`Order #${orderId} marked Delivered & COD payment updated to Paid! 🌸`);
    } else {
      triggerToast(`Order #${orderId} status updated to "${newStatus}"! 🌸`);
    }
  };

  const handleCancelOrder = (orderId) => {
    const target = orders.find((o) => o.id === orderId);
    setSelectedReasonTab("inventory");
    setSelectedPresetReason(CANCELLATION_PRESETS.inventory[0]);
    setCustomReasonText("");
    setCancelModalData({ orderId, targetOrder: target });
  };

  const executeAdminCancellation = (orderId, reason) => {
    setIsSubmittingCancel(true);
    const target = orders.find((o) => o.id === orderId);
    if (!target) {
      setIsSubmittingCancel(false);
      return;
    }

    const orderDbId = target.dbId || (!isNaN(target.id) ? Number(target.id) : null);
    if (orderDbId) {
      fetch(`https://flowra-backend-1.onrender.com/api/orders/${orderDbId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          cancellationReason: reason,
          cancelledBy: "Admin",
        }),
      }).catch(console.warn);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: "Cancelled",
              cancellationReason: reason,
              cancelledBy: "Admin",
              refundStatus: "Refund Initiated (Within 24 Hours)",
            }
          : o
      )
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({
        ...prev,
        orderStatus: "Cancelled",
        cancellationReason: reason,
        cancelledBy: "Admin",
        refundStatus: "Refund Initiated (Within 24 Hours)",
      }));
    }

    try {
      const stored = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
      const updated = stored.map((so) => {
        if (so.orderId === orderId || so.id === orderId) {
          return {
            ...so,
            status: "Cancelled",
            cancellationReason: reason,
            cancelledBy: "Admin",
            refundStatus: "Refund Initiated (Within 24 Hours)",
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
        orderId,
        newStatus: "Cancelled",
        cancellationReason: reason,
        cancelledBy: "Admin",
        refundNote: `Refund of ₹${target.amount} will be credited to your account within 24 hours.`,
        timestamp: Date.now(),
      });
      channel.close();
    } catch (e) {}

    window.dispatchEvent(
      new CustomEvent("flowra_order_updated", {
        detail: {
          orderId,
          newStatus: "Cancelled",
          cancellationReason: reason,
          cancelledBy: "Admin",
        },
      })
    );

    setIsSubmittingCancel(false);
    setCancelModalData(null);
    triggerToast(`Order #${orderId} cancelled. Reason & 24-hr refund notice sent to customer! 🌸`);
  };

  const handlePrintInvoice = (order) => {
    alert(`Generating printable PDF invoice for Order #${order.id} (${order.customer})...`);
    triggerToast(`Invoice for #${order.id} downloaded!`);
  };

  const activeOrders = orders.filter(
    (o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled" && o.orderStatus !== "Returned"
  );

  const filteredOrders = orders.filter((ord) => {
    let matchesStatus = true;
    if (statusFilter === "Active") {
      matchesStatus = ord.orderStatus !== "Delivered" && ord.orderStatus !== "Cancelled" && ord.orderStatus !== "Returned";
    } else if (statusFilter !== "All") {
      matchesStatus = ord.orderStatus === statusFilter;
    }
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ord.id.toLowerCase().includes(q) ||
      ord.customer.toLowerCase().includes(q) ||
      (ord.email && ord.email.toLowerCase().includes(q)) ||
      (ord.phone && ord.phone.toLowerCase().includes(q)) ||
      (ord.address && ord.address.toLowerCase().includes(q)) ||
      ord.items.some((i) => i.name && i.name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "New": return "badge-purple";
      case "Pending": return "badge-amber";
      case "Confirmed": return "badge-indigo";
      case "Preparing": return "badge-amber";
      case "Packed": return "badge-orange";
      case "Out for Delivery": return "badge-blue";
      case "Delivered": return "badge-green";
      case "Cancelled": return "badge-red";
      case "Returned": return "badge-gray";
      default: return "badge-gray";
    }
  };

  const statusList = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Packed",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
    "Returned",
  ];

  return (
    <AdminLayout pageTitle="Orders Management">
      {/* TOAST */}
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* FILTER & CONTROL BAR */}
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          {/* SEARCH */}
          <div className="admin-search-input-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by Order ID, Customer name, email, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>

          {/* STATUS SELECT */}
          <div className="filter-select-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses ({orders.length})</option>
              <option value="Active">Active Pending ({activeOrders.length})</option>
              {statusList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* QUICK COUNTS */}
          <div className="quick-status-tabs">
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === "All" ? "active" : ""}`}
              onClick={() => setStatusFilter("All")}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === "Active" ? "active" : ""}`}
              onClick={() => setStatusFilter("Active")}
              style={{ fontWeight: 700 }}
            >
              Active Pending ({activeOrders.length})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === "Preparing" ? "active" : ""}`}
              onClick={() => setStatusFilter("Preparing")}
            >
              Preparing ({orders.filter((o) => o.orderStatus === "Preparing").length})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === "Out for Delivery" ? "active" : ""}`}
              onClick={() => setStatusFilter("Out for Delivery")}
            >
              Out for Delivery ({orders.filter((o) => o.orderStatus === "Out for Delivery").length})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${statusFilter === "Delivered" ? "active" : ""}`}
              onClick={() => setStatusFilter("Delivered")}
            >
              Delivered ({orders.filter((o) => o.orderStatus === "Delivered").length})
            </button>
          </div>
        </div>
      </section>

      {/* ORDERS TABLE */}
      <section className="dashboard-table-card">
        <div className="card-top-action-bar">
          <div>
            <h3>Orders Directory</h3>
            <p>Showing {filteredOrders.length} orders matching your criteria</p>
          </div>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => triggerToast("Exporting Orders CSV Report...")}
          >
            📥 Export Orders CSV
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID &amp; Date</th>
                <th>Customer Details &amp; Address</th>
                <th>Items Ordered</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Delivery Slot</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty-row">
                    <div className="empty-state-box">
                      <span>🥀</span>
                      <h4>No orders found</h4>
                      <p>No customer orders match the selected filters or query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <button
                        type="button"
                        className="order-id-button"
                        onClick={() => setSelectedOrder(ord)}
                      >
                        {ord.id}
                      </button>
                      <small className="table-subtext">{ord.orderDate}</small>
                    </td>

                    <td className="customer-cell-with-address">
                      <div className="customer-info-box">
                        <strong className="customer-name-heading">{ord.customer}</strong>
                        <div className="customer-sub-contacts">
                          <span>📞 {ord.phone}</span>
                          {ord.email && <span>✉️ {ord.email}</span>}
                        </div>
                        <div className="customer-address-pill" title={ord.address}>
                          <span className="addr-pin-icon">📍</span>
                          <span className="addr-text">{ord.address}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="table-item-cell">
                        <img
                          src={ord.items[0]?.image}
                          alt={ord.items[0]?.name}
                          className="table-item-thumb"
                        />
                        <div>
                          <strong>{ord.items[0]?.name}</strong>
                          {ord.items.length > 1 && (
                            <small className="item-plus-tag">+{ord.items.length - 1} more items</small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong className="amount-highlight">₹{ord.amount.toFixed(2)}</strong>
                    </td>

                    <td>
                      <span className={`payment-status-badge ${ord.paymentStatus.toLowerCase()}`}>
                        {ord.paymentStatus}
                      </span>
                      <small className="table-subtext">{ord.paymentMethod.split(" ")[0]}</small>
                    </td>

                    <td>
                      <select
                        className={`status-select-inline ${getStatusBadgeClass(ord.orderStatus)}`}
                        value={ord.orderStatus}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      >
                        {statusList.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <strong>{ord.deliveryDate}</strong>
                      <small className="table-subtext">{ord.deliverySlot}</small>
                    </td>

                    <td>
                      <div className="table-actions-group">
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="View Order Details"
                          onClick={() => setSelectedOrder(ord)}
                        >
                          👁️
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Print Invoice"
                          onClick={() => handlePrintInvoice(ord)}
                        >
                          🖨️
                        </button>
                        {ord.orderStatus !== "Cancelled" && (
                          <button
                            type="button"
                            className="action-icon-btn danger"
                            title="Cancel Order"
                            onClick={() => handleCancelOrder(ord.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ORDER DETAILS DRAWER / MODAL */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="admin-drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-eyebrow">ORDER DETAILS</span>
                <h2>{selectedOrder.id}</h2>
                <small className="drawer-time">Placed on {selectedOrder.orderDate}</small>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="drawer-body-scroll">
              {/* STATUS TIMELINE PROGRESS */}
              <div className="order-timeline-card">
                <h4>Order Progress Timeline</h4>
                <div className="drawer-timeline-stepper">
                  {["Confirmed", "Preparing", "Packed", "Out for Delivery", "Delivered"].map(
                    (step, sidx) => {
                      const stages = ["Confirmed", "Preparing", "Packed", "Out for Delivery", "Delivered"];
                      const currentIdx = stages.indexOf(selectedOrder.orderStatus);
                      const isCompleted = currentIdx >= sidx;
                      const isCurrent = selectedOrder.orderStatus === step;

                      return (
                        <div
                          key={step}
                          className={`stepper-node ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}
                        >
                          <div className="stepper-dot">
                            {isCompleted ? "✓" : sidx + 1}
                          </div>
                          <span>{step}</span>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* UPDATE STATUS CONTROLS */}
                <div className="timeline-update-bar">
                  <label>Change Status to:</label>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  >
                    {statusList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CANCELLATION DETAILS IF CANCELLED */}
              {selectedOrder.orderStatus === "Cancelled" && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                    border: "1.5px solid #fca5a5",
                    borderRadius: "16px",
                    padding: "18px 22px",
                    marginBottom: "22px",
                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "22px", lineHeight: 1 }}>🚫</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "16px", color: "#991b1b", fontWeight: 700 }}>
                          Order Cancelled {selectedOrder.cancelledBy ? `by ${selectedOrder.cancelledBy}` : ""}
                        </h4>
                        <small style={{ color: "#b91c1c", fontSize: "12px" }}>
                          Status synchronized with customer storefront
                        </small>
                      </div>
                    </div>
                    <span
                      style={{
                        background: "#10b981",
                        color: "#ffffff",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
                      }}
                    >
                      ✓ 24-Hr Refund Guarantee Active
                    </span>
                  </div>

                  {selectedOrder.cancellationReason && (
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #fecaca",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        marginTop: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#7f1d1d",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "block",
                          marginBottom: "3px",
                        }}
                      >
                        Cancellation Reason:
                      </span>
                      <p style={{ margin: 0, fontSize: "13.5px", color: "#450a0a", fontWeight: 600 }}>
                        "{selectedOrder.cancellationReason}"
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "12.5px",
                      color: "#92400e",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>💰</span>
                    <span>
                      Customer notification note: <strong>100% refund of ₹{selectedOrder.amount?.toFixed(2)}</strong> will be credited to original payment source ({selectedOrder.paymentMethod || "Online"}) within <strong>24 hours</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* CUSTOMER & DELIVERY INFO */}
              <div className="drawer-grid-2">
                <div className="drawer-info-block">
                  <h4>👤 Customer Information</h4>
                  <p><strong>{selectedOrder.customer}</strong></p>
                  <p>✉️ {selectedOrder.email}</p>
                  <p>📞 {selectedOrder.phone}</p>
                </div>

                <div className="drawer-info-block">
                  <h4>🚚 Delivery Address &amp; Slot</h4>
                  <p>{selectedOrder.address}</p>
                  <p><strong>Scheduled:</strong> {selectedOrder.deliveryDate}</p>
                  <p><strong>Slot:</strong> {selectedOrder.deliverySlot}</p>
                </div>
              </div>

              {/* GIFT MESSAGE */}
              {selectedOrder.giftMessage && (
                <div className="gift-message-box">
                  <strong>💌 Handwritten Greeting Card Message:</strong>
                  <p>"{selectedOrder.giftMessage}"</p>
                </div>
              )}

              {/* ORDERED ITEMS */}
              <div className="drawer-items-section">
                <h4>Ordered Blooms &amp; Arrangements</h4>
                <div className="drawer-items-list">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="drawer-item-row">
                      <img src={it.image} alt={it.name} />
                      <div className="drawer-item-meta">
                        <strong>{it.name}</strong>
                        <span>Qty: {it.qty} × ₹{it.price}</span>
                      </div>
                      <strong className="item-subtotal">₹{(it.qty * it.price).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINANCIAL BREAKDOWN */}
              <div className="drawer-pricing-card">
                <div className="pricing-line">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.amount.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="pricing-line discount">
                    <span>Discount Applied</span>
                    <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pricing-line">
                  <span>Delivery Charge</span>
                  <span>{selectedOrder.deliveryFee === 0 ? "FREE" : `₹${selectedOrder.deliveryFee}`}</span>
                </div>
                <div className="pricing-line grand">
                  <span>Grand Total</span>
                  <span>₹{(selectedOrder.amount - selectedOrder.discount + selectedOrder.deliveryFee).toFixed(2)}</span>
                </div>
                <div className="payment-receipt-tag">
                  💳 Paid via {selectedOrder.paymentMethod} • Status: <strong>{selectedOrder.paymentStatus}</strong>
                </div>
              </div>
            </div>

            {/* DRAWER ACTIONS FOOTER */}
            <div className="drawer-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => handlePrintInvoice(selectedOrder)}
              >
                🖨️ Print Invoice
              </button>
              {selectedOrder.orderStatus !== "Cancelled" && (
                <button
                  type="button"
                  className="admin-btn-danger"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENT 3: ADMIN CANCELLATION REASON MODAL WITH 24-HOUR REFUND NOTICE */}
      {cancelModalData && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isSubmittingCancel && setCancelModalData(null)}
        >
          <div
            className="admin-modal-card wide-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "680px" }}
          >
            <div
              className="drawer-header"
              style={{ padding: "0 0 16px 0", borderBottom: "1px solid var(--admin-line)" }}
            >
              <div>
                <span className="drawer-eyebrow" style={{ color: "#c93b54" }}>
                  ORDER CANCELLATION &amp; 24-HR REFUND
                </span>
                <h2 style={{ fontSize: "20px", marginTop: "4px" }}>
                  Cancel Order #{cancelModalData.orderId}
                </h2>
                <small style={{ color: "var(--admin-text-muted)", fontSize: "12px" }}>
                  Customer: <strong>{cancelModalData.targetOrder?.customer}</strong> • Total: <strong>₹{cancelModalData.targetOrder?.amount?.toFixed(2)}</strong>
                </small>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => !isSubmittingCancel && setCancelModalData(null)}
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-form-scroll" style={{ padding: "16px 0", maxHeight: "65vh" }}>
              {/* REFUND NOTICE BANNER */}
              {cancelModalData.targetOrder?.paymentStatus === "Paid" ||
              (cancelModalData.targetOrder?.paymentMethod &&
                !cancelModalData.targetOrder.paymentMethod.toLowerCase().includes("cod")) ? (
                <div
                  style={{
                    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                    border: "1.5px solid #86efac",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "24px", lineHeight: 1 }}>💳</span>
                  <div>
                    <div style={{ color: "#166534", fontWeight: 700, fontSize: "14px" }}>
                      Customer Paid Online — 24-Hour 100% Refund Note Enabled
                    </div>
                    <p style={{ margin: "4px 0 0 0", color: "#14532d", fontSize: "12px", lineHeight: 1.5 }}>
                      The customer has paid <strong>₹{cancelModalData.targetOrder?.amount?.toFixed(2)}</strong> via <strong>{cancelModalData.targetOrder?.paymentMethod || "Online"}</strong>.
                      Upon cancellation, a note will appear on the customer's order page stating that their refund of <strong>₹{cancelModalData.targetOrder?.amount?.toFixed(2)}</strong> will be credited to their account within <strong>24 hours</strong> along with your cancellation reason below.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1.5px solid #fde68a",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>💵</span>
                  <div>
                    <div style={{ color: "#92400e", fontWeight: 700, fontSize: "13px" }}>
                      Cash on Delivery (Unpaid)
                    </div>
                    <p style={{ margin: "2px 0 0 0", color: "#78350f", fontSize: "12px" }}>
                      This order has not been paid. No refund settlement required. The cancellation reason will be recorded and shown to the customer.
                    </p>
                  </div>
                </div>
              )}

              {/* REASON TABS */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--admin-text-main)",
                    marginBottom: "8px",
                  }}
                >
                  Select Reason Tab / Category:
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    { id: "inventory", label: "🌸 Blooms / Inventory" },
                    { id: "logistics", label: "🚚 Logistics / Zone" },
                    { id: "customer", label: "📞 Customer Request" },
                    { id: "custom", label: "✍️ Custom Reason" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setSelectedReasonTab(tab.id);
                        if (tab.id !== "custom" && CANCELLATION_PRESETS[tab.id]) {
                          setSelectedPresetReason(CANCELLATION_PRESETS[tab.id][0]);
                        }
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border:
                          selectedReasonTab === tab.id
                            ? "1.5px solid var(--admin-rose)"
                            : "1px solid var(--admin-line)",
                        background:
                          selectedReasonTab === tab.id
                            ? "var(--admin-blush)"
                            : "#ffffff",
                        color:
                          selectedReasonTab === tab.id
                            ? "var(--admin-wine)"
                            : "var(--admin-text-muted)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRESETS LIST OR CUSTOM TEXTAREA */}
              {selectedReasonTab !== "custom" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--admin-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Select explanation to display on user's order:
                  </label>
                  {CANCELLATION_PRESETS[selectedReasonTab]?.map((reasonOption, rIdx) => (
                    <label
                      key={rIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border:
                          selectedPresetReason === reasonOption
                            ? "1.5px solid var(--admin-rose)"
                            : "1px solid #f0e6e4",
                        background:
                          selectedPresetReason === reasonOption ? "#fff7f9" : "#ffffff",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: "#334155",
                        transition: "0.15s ease",
                      }}
                    >
                      <input
                        type="radio"
                        name="admin_cancel_preset"
                        checked={selectedPresetReason === reasonOption}
                        onChange={() => setSelectedPresetReason(reasonOption)}
                        style={{ accentColor: "var(--admin-rose)" }}
                      />
                      <span>{reasonOption}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: "12px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--admin-text-main)",
                      marginBottom: "6px",
                    }}
                  >
                    Specify Detailed Custom Reason:
                  </label>
                  <textarea
                    rows={4}
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    placeholder="Enter reason to be displayed to the customer on their tracking page..."
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: "1.5px solid var(--admin-line)",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none",
                      background: "#fafafa",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}
            </div>

            <div
              className="modal-actions-row"
              style={{
                paddingTop: "14px",
                borderTop: "1px solid var(--admin-line)",
                marginTop: "10px",
              }}
            >
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => !isSubmittingCancel && setCancelModalData(null)}
                disabled={isSubmittingCancel}
              >
                Keep Order Active
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #991b1b)",
                  padding: "9px 22px",
                  fontSize: "12px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: isSubmittingCancel ? "not-allowed" : "pointer",
                }}
                disabled={
                  isSubmittingCancel ||
                  (selectedReasonTab === "custom" && !customReasonText.trim())
                }
                onClick={() => {
                  const finalReason =
                    selectedReasonTab === "custom"
                      ? customReasonText.trim()
                      : selectedPresetReason;
                  executeAdminCancellation(cancelModalData.orderId, finalReason);
                }}
              >
                {isSubmittingCancel
                  ? "Processing..."
                  : "Confirm Cancellation & 24h Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default OrdersManager;
