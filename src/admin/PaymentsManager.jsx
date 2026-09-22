import { useState } from "react";
import AdminLayout from "./AdminLayout.jsx";

function PaymentsManager() {
  const initialPayments = [
    { id: "PAY-84920", orderId: "FLW-94021", customer: "Priya Sharma", amount: 1299, method: "UPI (GPay)", status: "Paid", date: "Sep 01, 2026, 02:45 PM", txId: "TXN_UPI_9492104" },
    { id: "PAY-84919", orderId: "FLW-94020", customer: "Rahul Mehta", amount: 999, method: "Credit Card (Visa)", status: "Paid", date: "Sep 01, 2026, 01:15 PM", txId: "TXN_CARD_8410294" },
    { id: "PAY-84918", orderId: "FLW-94019", customer: "Ananya Iyer", amount: 2499, method: "UPI (PhonePe)", status: "Paid", date: "Sep 01, 2026, 12:30 PM", txId: "TXN_UPI_7719203" },
    { id: "PAY-84917", orderId: "FLW-94018", customer: "Vikram Sen", amount: 1899, method: "Corporate Net Banking", status: "Paid", date: "Sep 01, 2026, 10:10 AM", txId: "TXN_NB_3819200" },
    { id: "PAY-84916", orderId: "FLW-94017", customer: "Neha Kapoor", amount: 899, method: "Cash on Delivery", status: "Paid", date: "Aug 31, 2026, 06:20 PM", txId: "COD_REC_93810" },
    { id: "PAY-84915", orderId: "FLW-94012", customer: "Aditi Rao", amount: 1450, method: "Credit Card (Mastercard)", status: "Refunded", date: "Aug 30, 2026, 03:10 PM", txId: "REF_TXN_49201" },
  ];

  const [payments, setPayments] = useState(() => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
      if (storedOrders.length > 0) {
        const livePayments = storedOrders.map((ord, idx) => ({
          id: `PAY-${ord.paymentId ? ord.paymentId.replace(/^pay_/, "RZP_") : `LIVE-${idx + 1}`}`,
          orderId: ord.orderId,
          customer: ord.recipient || "Floral Customer",
          amount: typeof ord.total === "number" ? ord.total : parseFloat(String(ord.total).replace(/[^\d.]/g, "")) || 0,
          method: ord.paymentMethod || "Razorpay (Online)",
          status: ord.paymentStatus || "Paid",
          date: ord.date || "Today",
          txId: ord.paymentId || (ord.paymentMethod?.includes("Cash") ? `COD_${ord.orderId}` : `TXN_RZP_${ord.orderId}`),
        }));
        return [...livePayments, ...initialPayments];
      }
    } catch (e) {
      console.error("Failed to load stored orders for payments", e);
    }
    return initialPayments;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRefund = (id, amount, customer) => {
    if (window.confirm(`Issue a refund of ₹${amount} for transaction ${id} (${customer})?`)) {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "Refunded" } : p))
      );
      triggerToast(`Refund processed successfully for ${customer}! 💸`);
    }
  };

  const totalCollected = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.txId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout pageTitle="Payment & Transaction Gateway">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <section className="payment-summary-strip">
        <div className="pay-stat-box">
          <span>Total Settled Revenue</span>
          <strong>₹{totalCollected.toLocaleString("en-IN")}</strong>
          <small>100% verified settlement</small>
        </div>
        <div className="pay-stat-box">
          <span>Total Transactions</span>
          <strong>{payments.length} Settlements</strong>
          <small>Avg ₹1,507 per order</small>
        </div>
        <div className="pay-stat-box">
          <span>Refund Rate</span>
          <strong className="text-success">0.8% (Healthy)</strong>
          <small>Only 1 refund this week</small>
        </div>
      </section>

      {/* SEARCH AND CONTROLS */}
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          <div className="admin-search-input-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by Payment ID, Order ID, customer, or Transaction Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => triggerToast("Downloading Settlement Statement PDF...")}
          >
            📄 Download Bank Settlement Report
          </button>
        </div>
      </section>

      {/* TABLE */}
      <section className="dashboard-table-card">
        <div className="card-top-action-bar">
          <div>
            <h3>Recent Gateway Settlements</h3>
            <p>Direct integrated logs from Razorpay, Stripe, UPI &amp; Cash collections</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Gateway Method</th>
                <th>Status</th>
                <th>Date &amp; Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((pay) => (
                <tr key={pay.id}>
                  <td>
                    <strong>{pay.id}</strong>
                    <small className="table-subtext">{pay.txId}</small>
                  </td>

                  <td>
                    <span className="order-badge">{pay.orderId}</span>
                  </td>

                  <td>
                    <strong>{pay.customer}</strong>
                  </td>

                  <td>
                    <strong className="amount-highlight">₹{pay.amount.toFixed(2)}</strong>
                  </td>

                  <td>
                    <span>{pay.method}</span>
                  </td>

                  <td>
                    <span className={`payment-status-badge ${pay.status.toLowerCase()}`}>
                      {pay.status}
                    </span>
                  </td>

                  <td>
                    <small>{pay.date}</small>
                  </td>

                  <td>
                    <div className="table-actions-group">
                      <button
                        type="button"
                        className="admin-btn-secondary small-btn"
                        onClick={() => triggerToast(`Receipt #${pay.id} downloaded!`)}
                      >
                        Receipt 🧾
                      </button>
                      {pay.status === "Paid" && (
                        <button
                          type="button"
                          className="admin-btn-danger small-btn"
                          onClick={() => handleRefund(pay.id, pay.amount, pay.customer)}
                        >
                          Refund 💸
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

export default PaymentsManager;
