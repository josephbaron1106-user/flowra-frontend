import { useState } from "react";
import AdminLayout from "./AdminLayout.jsx";
import { useAdminAuth } from "./AdminAuthContext.jsx";

function NotificationsManager() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useAdminAuth();

  const [filterType, setFilterType] = useState("all");

  const filtered = notifications.filter((n) => {
    if (filterType === "unread") return !n.read;
    if (filterType !== "all") return n.type === filterType;
    return true;
  });

  return (
    <AdminLayout pageTitle="Notifications & Operational Alerts">
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          <div className="quick-status-tabs">
            <button
              type="button"
              className={`status-tab-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${filterType === "unread" ? "active" : ""}`}
              onClick={() => setFilterType("unread")}
            >
              Unread ({notifications.filter((n) => !n.read).length})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${filterType === "order" ? "active" : ""}`}
              onClick={() => setFilterType("order")}
            >
              Orders
            </button>
            <button
              type="button"
              className={`status-tab-btn ${filterType === "stock" ? "active" : ""}`}
              onClick={() => setFilterType("stock")}
            >
              Stock
            </button>
            <button
              type="button"
              className={`status-tab-btn ${filterType === "payment" ? "active" : ""}`}
              onClick={() => setFilterType("payment")}
            >
              Payments
            </button>
          </div>

          <button
            type="button"
            className="admin-btn-secondary"
            onClick={markAllNotificationsAsRead}
          >
            ✓ Mark All As Read
          </button>
        </div>
      </section>

      {/* NOTIFICATIONS LIST */}
      <section className="dashboard-table-card">
        <div className="notifications-full-stack">
          {filtered.length === 0 ? (
            <div className="empty-state-box">
              <span>🔔</span>
              <h4>No notifications</h4>
              <p>You’re all caught up with your flower store operations.</p>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className={`notif-card-row ${!n.read ? "unread-bg" : ""}`}
                onClick={() => markNotificationAsRead(n.id)}
              >
                <div className="notif-type-icon">
                  {n.type === "order" && "🛍️"}
                  {n.type === "stock" && "⚠️"}
                  {n.type === "payment" && "💳"}
                  {n.type === "review" && "⭐"}
                  {n.type === "delivery" && "🚚"}
                </div>

                <div className="notif-card-text">
                  <div className="notif-card-title-row">
                    <strong>{n.title}</strong>
                    {!n.read && <span className="new-pill">NEW</span>}
                  </div>
                  <p>{n.desc}</p>
                  <small>{n.time}</small>
                </div>

                <div className="notif-actions">
                  {!n.read && (
                    <button
                      type="button"
                      className="admin-btn-secondary small-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(n.id);
                      }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    type="button"
                    className="action-icon-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    title="Delete Notification"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

export default NotificationsManager;
