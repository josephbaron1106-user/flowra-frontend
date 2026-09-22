import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout.jsx";

function AdminDashboard() {
  const [data, setData] = useState(() => {
    // 1. ONLINE ORDERS
    let onlineRev = 248920;
    let onlineOrdersCount = 428;
    try {
      const userOrders = JSON.parse(localStorage.getItem("flowra_orders") || "[]");
      if (userOrders.length > 0) {
        const extraOnlineRev = userOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        onlineRev += extraOnlineRev;
        onlineOrdersCount += userOrders.length;
      }
    } catch (e) {
      console.error(e);
    }

    // 2. OFFLINE IN-STORE SALES
    let offlineRev = 84600;
    let offlineSalesCount = 95;
    try {
      const storedOffline = JSON.parse(localStorage.getItem("flowra_offline_sales") || "[]");
      if (storedOffline.length > 0) {
        const actualOffline = storedOffline.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
        offlineRev = 84600 + actualOffline;
        offlineSalesCount = 95 + storedOffline.length;
      }
    } catch (e) {
      console.error(e);
    }

    // 3. WHOLESALE STOCK PROCURED (STOCK PURCHASES)
    let stockSpend = 112400;
    let stockStems = 3200;
    try {
      const storedWholesale = JSON.parse(localStorage.getItem("flowra_wholesale_inward") || "[]");
      if (storedWholesale.length > 0) {
        const actualStockSpend = storedWholesale.reduce((sum, w) => sum + (parseFloat(w.totalCost) || 0), 0);
        const actualStems = storedWholesale.reduce((sum, w) => sum + (parseInt(w.quantity) || 0), 0);
        stockSpend = 112400 + actualStockSpend;
        stockStems = 3200 + actualStems;
      }
    } catch (e) {
      console.error(e);
    }

    // 4. DAILY SHOP EXPENSES (TEA, PETROL, SNACKS, ETC.)
    let dailyExpenses = 8450;
    try {
      const storedExpenses = JSON.parse(localStorage.getItem("flowra_shop_expenses") || "[]");
      if (storedExpenses.length > 0) {
        const actualExpenses = storedExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        dailyExpenses = 8450 + actualExpenses;
      }
    } catch (e) {
      console.error(e);
    }

    const totalIncome = onlineRev + offlineRev;
    const totalExpenses = stockSpend + dailyExpenses;
    const netBalance = totalIncome - totalExpenses;

    return {
      onlineRev,
      onlineOrdersCount,
      offlineRev,
      offlineSalesCount,
      stockSpend,
      stockStems,
      dailyExpenses,
      totalIncome,
      totalExpenses,
      netBalance,
    };
  });

  // Recent 6 combined activity items (Online order, In-store sale, Daily expense, Stock inward)
  const recentActivities = [
    {
      id: "ACT-01",
      type: "online",
      title: "Online Order #FLW-94021",
      detail: "Priya Sharma • Blush Romance Bouquet",
      amount: "+₹1,299",
      time: "10 mins ago",
      icon: "🌐",
      badgeClass: "badge-green",
    },
    {
      id: "ACT-02",
      type: "expense",
      title: "Tea & Snacks for Staff",
      detail: "Morning tea & biscuits for florist crew",
      amount: "-₹140",
      time: "25 mins ago",
      icon: "☕",
      badgeClass: "badge-amber",
    },
    {
      id: "ACT-03",
      type: "pos",
      title: "Walk-in Counter Sale #POS-8401",
      detail: "Dr. Vikram Sethi • Pink Rose & Gypsophila",
      amount: "+₹1,650",
      time: "40 mins ago",
      icon: "🏪",
      badgeClass: "badge-green",
    },
    {
      id: "ACT-04",
      type: "expense",
      title: "Delivery Van Petrol",
      detail: "South Mumbai delivery route petrol refill",
      amount: "-₹550",
      time: "1 hour ago",
      icon: "⛽",
      badgeClass: "badge-amber",
    },
    {
      id: "ACT-05",
      type: "stock",
      title: "Wholesale Stock Inward #WS-101",
      detail: "150x Dutch Red Roses from Pune Mandi",
      amount: "-₹2,700",
      time: "2 hours ago",
      icon: "📦",
      badgeClass: "badge-red",
    },
    {
      id: "ACT-06",
      type: "pos",
      title: "Walk-in Counter Sale #POS-8402",
      detail: "Meera Sen • 12x Dutch Red Roses",
      amount: "+₹600",
      time: "3 hours ago",
      icon: "🏪",
      badgeClass: "badge-green",
    },
  ];

  return (
    <AdminLayout pageTitle="Store Accounts & Executive Dashboard">
      {/* ========================================================================= */}
      {/* 1. TOP 6 CLEAN ACCOUNTING CARDS */}
      {/* ========================================================================= */}
      <section className="simple-accounts-grid">
        {/* ONLINE SALES */}
        <div className="account-card card-online">
          <div className="account-card-header">
            <span className="card-icon-tag">🌐</span>
            <span className="card-type-label">Online Website Sales</span>
          </div>
          <h2 className="account-card-amount">₹{data.onlineRev.toLocaleString("en-IN")}</h2>
          <div className="account-card-footer">
            <span>{data.onlineOrdersCount} web orders received</span>
            <Link to="/admin/orders" className="card-quick-link">View Orders →</Link>
          </div>
        </div>

        {/* IN-STORE / OFFLINE SALES */}
        <div className="account-card card-offline">
          <div className="account-card-header">
            <span className="card-icon-tag">🏪</span>
            <span className="card-type-label">In-Store / Offline Sales</span>
          </div>
          <h2 className="account-card-amount">₹{data.offlineRev.toLocaleString("en-IN")}</h2>
          <div className="account-card-footer">
            <span>{data.offlineSalesCount} walk-in counter sales</span>
            <Link to="/admin/wholesale-pos" className="card-quick-link">Counter POS →</Link>
          </div>
        </div>

        {/* TOTAL INCOME */}
        <div className="account-card card-total-income">
          <div className="account-card-header">
            <span className="card-icon-tag">💰</span>
            <span className="card-type-label">Total Revenue (Online + In-Store)</span>
          </div>
          <h2 className="account-card-amount highlight-income">₹{data.totalIncome.toLocaleString("en-IN")}</h2>
          <div className="account-card-footer">
            <span>Total gross revenue collected</span>
            <span className="pill-badge">Gross Sales</span>
          </div>
        </div>

        {/* WHOLESALE STOCK PURCHASES */}
        <div className="account-card card-stock">
          <div className="account-card-header">
            <span className="card-icon-tag">📦</span>
            <span className="card-type-label">Wholesale Stock Procurement</span>
          </div>
          <h2 className="account-card-amount highlight-expense">₹{data.stockSpend.toLocaleString("en-IN")}</h2>
          <div className="account-card-footer">
            <span>{data.stockStems.toLocaleString("en-IN")} stems from growers &amp; mandis</span>
            <Link to="/admin/wholesale-pos" className="card-quick-link">Stock Inward →</Link>
          </div>
        </div>

        {/* DAILY EXPENSES (TEA, PETROL, SNACKS) */}
        <div className="account-card card-expenses">
          <div className="account-card-header">
            <span className="card-icon-tag">☕</span>
            <span className="card-type-label">Daily Shop Expenses (Tea, Petrol, Snacks)</span>
          </div>
          <h2 className="account-card-amount highlight-expense">₹{data.dailyExpenses.toLocaleString("en-IN")}</h2>
          <div className="account-card-footer">
            <span>Tea, delivery fuel, staff refreshments</span>
            <Link to="/admin/expenses" className="card-quick-link">Add Expense →</Link>
          </div>
        </div>

        {/* NET BALANCE */}
        <div className="account-card card-balance">
          <div className="account-card-header">
            <span className="card-icon-tag">💵</span>
            <span className="card-type-label">Net In-Hand Balance (Retained Profit)</span>
          </div>
          <h2 className="account-card-amount highlight-balance">₹{data.netBalance.toLocaleString("en-IN")}</h2>
          <div className="account-card-footer">
            <span>Revenue (₹{data.totalIncome.toLocaleString("en-IN")}) − Total Expenses (₹{data.totalExpenses.toLocaleString("en-IN")})</span>
            <span className="pill-badge profit">Net Profit</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CASH-FLOW BALANCE BREAKDOWN BAR */}
      {/* ========================================================================= */}
      <section className="dashboard-cashflow-panel">
        <div className="cashflow-panel-header">
          <div>
            <h3>📊 Store Cash Flow Equation</h3>
            <p>Total Revenue vs Total Operating Expenses vs Net Retained Profit</p>
          </div>
          <div className="quick-action-strip">
            <Link to="/admin/wholesale-pos" className="admin-btn-secondary">
              ➕ Inward Wholesale Stock
            </Link>
            <Link to="/admin/expenses" className="admin-btn-secondary">
              ➕ Add Daily Expense
            </Link>
          </div>
        </div>

        <div className="cashflow-visual-strip">
          <div className="cashflow-item inflow">
            <small>1. Total Revenue</small>
            <strong>₹{data.totalIncome.toLocaleString("en-IN")}</strong>
            <span>Online (₹{data.onlineRev.toLocaleString("en-IN")}) + In-Store (₹{data.offlineRev.toLocaleString("en-IN")})</span>
          </div>

          <span className="math-operator">−</span>

          <div className="cashflow-item outflow">
            <small>2. Total Expenses</small>
            <strong>₹{data.totalExpenses.toLocaleString("en-IN")}</strong>
            <span>Stock Purchases (₹{data.stockSpend.toLocaleString("en-IN")}) + Daily Expenses (₹{data.dailyExpenses.toLocaleString("en-IN")})</span>
          </div>

          <span className="math-operator">=</span>

          <div className="cashflow-item balance-result">
            <small>3. Net In-Hand Balance</small>
            <strong>₹{data.netBalance.toLocaleString("en-IN")}</strong>
            <span>Net Retained Profit</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. RECENT ACTIVITY & DIRECTORY */}
      {/* ========================================================================= */}
      <section className="dashboard-activity-section">
        <div className="dashboard-table-card">
          <div className="card-top-action-bar">
            <div>
              <h3>📋 Recent Shop Transactions &amp; Activity Log</h3>
              <p>Combined live stream of Online Orders, Walk-in Sales, and Daily Expenses</p>
            </div>
            <div className="dashboard-action-links">
              <Link to="/admin/orders" className="admin-link-btn outline-btn">
                Online Orders
              </Link>
              <Link to="/admin/wholesale-pos" className="admin-link-btn outline-btn">
                In-Store POS
              </Link>
              <Link to="/admin/expenses" className="admin-link-btn outline-btn">
                Expenses
              </Link>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type &amp; Event</th>
                  <th>Details</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Flow</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <div className="activity-title-cell">
                        <span className="activity-icon-bubble">{act.icon}</span>
                        <strong>{act.title}</strong>
                      </div>
                    </td>
                    <td>{act.detail}</td>
                    <td>
                      <small className="table-subtext">{act.time}</small>
                    </td>
                    <td>
                      <strong className={act.amount.startsWith("+") ? "amount-income-green" : "amount-expense-red"}>
                        {act.amount}
                      </strong>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${act.badgeClass}`}>
                        {act.amount.startsWith("+") ? "Inflow (Income)" : "Outflow (Expense)"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
