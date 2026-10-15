import { createContext, useContext, useState, useEffect } from "react";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem("flowra_admin_auth") === "true";
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("flowra_admin_user");
      return saved
        ? JSON.parse(saved)
        : {
            name: "Eleanor Vance",
            email: "admin@flowra.com",
            role: "Head Floral Curator & Admin",
            avatar: "🌸",
            phone: "+91 98765 43210",
          };
    } catch {
      return {
        name: "Eleanor Vance",
        email: "admin@flowra.com",
        role: "Head Floral Curator & Admin",
        avatar: "🌸",
        phone: "+91 98765 43210",
      };
    }
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      title: "New Order #FLW-94021",
      desc: "Silk Ranunculus & Garden Roses by Priya S.",
      time: "5 mins ago",
      read: false,
      amount: "₹1,299",
    },
    {
      id: 2,
      type: "stock",
      title: "Low Stock Alert",
      desc: "White King Protea Stems (Only 3 left in stock)",
      time: "25 mins ago",
      read: false,
    },
    {
      id: 3,
      type: "payment",
      title: "Payment Received",
      desc: "₹2,499 via UPI for Order #FLW-94018",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 4,
      type: "review",
      title: "New 5-Star Review",
      desc: "Sophia R. reviewed 'The Blush Romance Bouquet'",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 5,
      type: "delivery",
      title: "Order Delivered",
      desc: "Order #FLW-93998 successfully delivered to Bandra",
      time: "3 hours ago",
      read: true,
    },
  ]);

  useEffect(() => {
    try {
      localStorage.setItem("flowra_admin_auth", String(isAdminAuthenticated));
      localStorage.setItem("flowra_admin_user", JSON.stringify(adminUser));
    } catch (e) {
      console.error(e);
    }
  }, [isAdminAuthenticated, adminUser]);

  useEffect(() => {
    fetch("https://flowra-backend-1.onrender.com/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiNotifs = data.map((n) => ({
            id: n.id,
            dbId: n.id,
            type: n.notificationType || "order",
            title: n.title,
            desc: n.message,
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
            read: !!n.isRead,
          }));
          setNotifications((prev) => {
            const existingIds = new Set(apiNotifs.map((an) => an.id));
            return [...apiNotifs, ...prev.filter((pn) => !existingIds.has(pn.id))];
          });
        }
      })
      .catch((err) => console.warn("Notifications sync warning:", err));
  }, []);

  const loginAdmin = (email, password) => {
    // Valid for admin@flowra.com / admin123 or demo accounts
    if (
      (email === "admin@flowra.com" && password === "admin123") ||
      (email === "admin" && password === "admin") ||
      email.includes("admin")
    ) {
      setIsAdminAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: "Invalid credentials. Use admin@flowra.com / admin123" };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
  };

  const updateAdminProfile = (updates) => {
    setAdminUser((prev) => ({ ...prev, ...updates }));
  };

  const markNotificationAsRead = (id) => {
    const target = notifications.find((n) => n.id === id);
    if (target && target.dbId) {
      fetch(`https://flowra-backend-1.onrender.com/api/notifications/${target.dbId}/read`, { method: "PUT" }).catch(console.warn);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    fetch("https://flowra-backend-1.onrender.com/api/notifications/read-all", { method: "PUT" }).catch(console.warn);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminUser,
        loginAdmin,
        logoutAdmin,
        updateAdminProfile,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
