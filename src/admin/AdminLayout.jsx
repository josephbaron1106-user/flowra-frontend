import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext.jsx";
import "./admin.css";

function AdminLayout({ children, pageTitle = "Dashboard" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    adminUser,
    logoutAdmin,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAdminAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const fetchActiveOrders = () => {
    fetch("https://flowra-backend-1.onrender.com/api/orders")
      .then((r) => r.json())
      .then((apiOrders) => {
        let allOrders = [];
        if (Array.isArray(apiOrders)) {
          allOrders = apiOrders.map((o) => ({
            id: o.orderNumber || `FLW-${o.id}`,
            status: o.status || "CONFIRMED",
          }));
        }

        try {
          const local = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
          const existingIds = new Set(allOrders.map((o) => o.id));
          local.forEach((lo) => {
            const id = lo.orderId || lo.id;
            if (id && !existingIds.has(id)) {
              allOrders.push({ id, status: lo.status || "Processing" });
            }
          });
        } catch (e) {}

        const activeCount = allOrders.filter((o) => {
          const st = (o.status || "").toUpperCase();
          return st !== "DELIVERED" && st !== "CANCELLED" && st !== "CANCELED" && st !== "RETURNED";
        }).length;

        setActiveOrdersCount(activeCount);
      })
      .catch(() => {
        try {
          const local = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
          const activeCount = local.filter((o) => {
            const st = (o.status || "").toUpperCase();
            return st !== "DELIVERED" && st !== "CANCELLED" && st !== "CANCELED" && st !== "RETURNED";
          }).length;
          setActiveOrdersCount(activeCount);
        } catch (e) {}
      });
  };

  useEffect(() => {
    fetchActiveOrders();

    let channel;
    try {
      channel = new BroadcastChannel("flowra_orders_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "ORDER_STATUS_UPDATED" || event.data?.type === "ORDER_CREATED") {
          fetchActiveOrders();
        }
      };
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === "flowra_orders" || e.key === "flowra_order_updated") {
        fetchActiveOrders();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("flowra_order_updated", fetchActiveOrders);

    const interval = setInterval(fetchActiveOrders, 4000);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("flowra_order_updated", fetchActiveOrders);
    };
  }, []);

  const menuItems = [
    { label: "Dashboard & Analytics", path: "/admin/dashboard", icon: "📊" },
    {
      label: "Online Orders",
      path: "/admin/orders",
      icon: "🌐",
      badge: activeOrdersCount > 0 ? String(activeOrdersCount) : null,
    },
    { label: "In-Store & Wholesale Stock", path: "/admin/wholesale-pos", icon: "🏪" },
    { label: "Daily Expenses", path: "/admin/expenses", icon: "💸" },
    { label: "Inventory & Stock", path: "/admin/inventory", icon: "📦", alertBadge: "5" },
    {
      label: "Notifications",
      path: "/admin/notifications",
      icon: "🔔",
      badge: unreadNotificationCount > 0 ? String(unreadNotificationCount) : null,
    },
    { label: "Store Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logoutAdmin();
    navigate("/admin/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`admin-app-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* SIDEBAR BACKDROP FOR MOBILE */}
      {mobileSidebarOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-sidebar-brand">
            <span className="brand-flower-icon">🌸</span>
            {!sidebarCollapsed && (
              <div className="brand-text-group">
                <span className="brand-title">BloomBay</span>
                <small className="brand-tag">FLOWRA ADMIN</small>
              </div>
            )}
          </Link>
          <button
            type="button"
            className="sidebar-toggle-btn desktop-only"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
          <button
            type="button"
            className="sidebar-close-btn mobile-only"
            onClick={() => setMobileSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="admin-sidebar-scroll">
          <nav className="admin-nav-group">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => setMobileSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : ""}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {!sidebarCollapsed && item.alertBadge && (
                  <span className="nav-alert-badge">{item.alertBadge}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="admin-main-wrapper">
        {/* TOP HEADER */}
        <header className="admin-top-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Sidebar"
            >
              ☰
            </button>
            <div className="admin-global-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search orders, flowers, customers, SKU..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="header-right">
            <Link to="/" target="_blank" rel="noreferrer" className="view-store-btn" title="Open Customer Storefront">
              🛍️ <span>Live Store</span>
            </Link>

            {/* PROFILE DROPDOWN */}
            <div className="profile-dropdown-wrapper">
              <button
                type="button"
                className="admin-profile-pill"
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                }}
              >
                <span className="admin-avatar-bubble">{adminUser.avatar}</span>
                <div className="admin-pill-text desktop-only">
                  <strong>{adminUser.name}</strong>
                  <small>Administrator</small>
                </div>
                <span className="dropdown-caret">▾</span>
              </button>

              {showProfileDropdown && (
                <div className="admin-profile-menu">
                  <div className="profile-menu-header">
                    <strong>{adminUser.name}</strong>
                    <small>{adminUser.email}</small>
                  </div>
                  <div className="profile-menu-links">
                    <Link
                      to="/admin/profile"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      👤 Admin Profile
                    </Link>
                  </div>
                  <div className="profile-menu-footer">
                    <button
                      type="button"
                      className="menu-logout-btn"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowLogoutModal(true);
                      }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="admin-content-body">
          <div className="admin-page-title-row">
            <div>
              <span className="admin-breadcrumb">BloomBay Admin / {pageTitle}</span>
              <h1 className="admin-main-heading">{pageTitle}</h1>
            </div>
            <div className="admin-date-badge">
              📅 {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>

          {children}
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-header">🚪</div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to end your active administrative session?</p>
            <div className="modal-actions-row">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={handleLogoutConfirm}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
