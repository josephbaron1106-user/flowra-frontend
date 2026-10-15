import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout.jsx";

function ReviewsManager() {
  const initialReviews = [
    { id: 1, author: "Sophia Reynolds", rating: 5, date: "Sep 01, 2026", product: "The Blush Romance Bouquet", comment: "The King Protea and orchid bouquet was beyond breathtaking! It arrived in pristine condition and stayed fresh for over 10 days.", status: "Approved" },
    { id: 2, author: "Arjun Mehta", rating: 5, date: "Aug 31, 2026", product: "Premium Long Stem Red Roses", comment: "Same-day delivery was right on time for my mother’s birthday. The packaging and handwritten note made it feel so personal and luxurious.", status: "Approved" },
    { id: 3, author: "Nisha & Kabir", rating: 5, date: "Aug 30, 2026", product: "Event Floral Styling", comment: "Flowra styled our intimate engagement dinner and every single guest asked who did the floral arrangements. Absolute floral artistry!", status: "Approved" },
    { id: 4, author: "Rohan Kapoor", rating: 4, date: "Aug 29, 2026", product: "Pastel Holland Tulips", comment: "Very fresh blooms. Delivery was 15 mins late due to evening rain, but customer concierge kept me informed.", status: "Approved" },
    { id: 5, author: "Meera Sen", rating: 5, date: "Aug 28, 2026", product: "Midnight Velvet Symphony", comment: "Stunning moody aesthetics. Looks straight out of an Italian design editorial!", status: "Approved" },
  ];

  const [reviews, setReviews] = useState(initialReviews);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetch("https://flowra-backend-1.onrender.com/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiRevs = data.map((rv) => ({
            id: rv.id,
            dbId: rv.id,
            author: rv.authorName || "Customer",
            rating: rv.rating || 5,
            date: rv.createdAt ? new Date(rv.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Recent",
            product: rv.productName || "Flowra Bouquet",
            comment: rv.comment || "",
            status: rv.status || "Approved",
            adminReply: rv.adminReply,
          }));
          setReviews((prev) => {
            const existingIds = new Set(apiRevs.map((a) => a.id));
            return [...apiRevs, ...prev.filter((p) => !existingIds.has(p.id))];
          });
        }
      })
      .catch((err) => console.warn("Reviews sync warning:", err));
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleToggleStatus = (id) => {
    const target = reviews.find((r) => r.id === id);
    if (target && target.dbId) {
      fetch(`https://flowra-backend-1.onrender.com/api/reviews/${target.dbId}/toggle`, { method: "PUT" }).catch(console.warn);
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === "Approved" ? "Hidden" : "Approved" } : r))
    );
    triggerToast("Review visibility status updated.");
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this review permanently?")) {
      const target = reviews.find((r) => r.id === id);
      if (target && target.dbId) {
        fetch(`https://flowra-backend-1.onrender.com/api/reviews/${target.dbId}`, { method: "DELETE" }).catch(console.warn);
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      triggerToast("Review deleted.");
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (replyingTo && replyingTo.dbId) {
      fetch(`https://flowra-backend-1.onrender.com/api/reviews/${replyingTo.dbId}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: replyText }),
      }).catch(console.warn);
    }
    triggerToast(`Replied to ${replyingTo.author}! "Thank you from Flowra Team 🌸"`);
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <AdminLayout pageTitle="Reviews & Ratings Moderation">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* RATING BREAKDOWN STRIP */}
      <section className="payment-summary-strip">
        <div className="pay-stat-box">
          <span>Average Customer Rating</span>
          <strong className="text-success">⭐ 4.92 / 5.0</strong>
          <small>Based on 248 verified purchases</small>
        </div>
        <div className="pay-stat-box">
          <span>5-Star Percentage</span>
          <strong>92% (228 Reviews)</strong>
          <small>Highest in florist category</small>
        </div>
        <div className="pay-stat-box">
          <span>Response Rate</span>
          <strong className="text-success">100% Replied</strong>
          <small>Within 2 business hours</small>
        </div>
      </section>

      {/* REVIEWS TABLE */}
      <section className="dashboard-table-card">
        <div className="card-top-action-bar">
          <div>
            <h3>Customer Feedback &amp; Testimonials</h3>
            <p>Approve, moderate, hide or reply to verified customer feedback</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev.id}>
                  <td>
                    <strong>{rev.author}</strong>
                  </td>
                  <td>
                    <span className="category-tag-pill">{rev.product}</span>
                  </td>
                  <td>
                    <span className="stars-pill">{"★".repeat(rev.rating)}</span>
                  </td>
                  <td className="text-truncate-cell">"{rev.comment}"</td>
                  <td>
                    <small>{rev.date}</small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`status-pill-toggle ${rev.status.toLowerCase()}`}
                      onClick={() => handleToggleStatus(rev.id)}
                    >
                      {rev.status}
                    </button>
                  </td>
                  <td>
                    <div className="table-actions-group">
                      <button
                        type="button"
                        className="admin-btn-secondary small-btn"
                        onClick={() => setReplyingTo(rev)}
                      >
                        Reply 💬
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn danger"
                        onClick={() => handleDelete(rev.id)}
                        title="Delete Review"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* REPLY MODAL */}
      {replyingTo && (
        <div className="admin-modal-backdrop" onClick={() => setReplyingTo(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-eyebrow">FLORIST RESPONSE</span>
                <h2>Reply to {replyingTo.author}</h2>
                <small>"{replyingTo.comment}"</small>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setReplyingTo(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendReply} className="modal-form-scroll">
              <div className="form-group">
                <label>Official Store Response</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Thank you for your kind words! We are thrilled our fresh stems brought joy to your celebration..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  Publish Response 🌸
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ReviewsManager;
