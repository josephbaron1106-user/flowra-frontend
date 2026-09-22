import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout.jsx";

const DEFAULT_EXPENSES = [
  {
    id: "EXP-501",
    date: "Sep 07, 2026, 10:30 AM",
    rawDate: "2026-09-07",
    category: "Tea & Coffee",
    icon: "☕",
    desc: "Morning tea & rusk biscuits for florist crew",
    amount: 140,
    paidVia: "Cash from Drawer",
    spentBy: "Aarav (Florist Lead)",
  },
  {
    id: "EXP-502",
    date: "Sep 07, 2026, 09:15 AM",
    rawDate: "2026-09-07",
    category: "Petrol & Delivery",
    icon: "⛽",
    desc: "Van petrol for South Mumbai priority morning delivery slot",
    amount: 550,
    paidVia: "UPI (Google Pay)",
    spentBy: "Ramesh (Delivery Staff)",
  },
  {
    id: "EXP-503",
    date: "Sep 06, 2026, 05:45 PM",
    rawDate: "2026-09-06",
    category: "Snacks & Food",
    icon: "🥪",
    desc: "Evening samosas & tea during peak bouquet rush",
    amount: 220,
    paidVia: "Cash from Drawer",
    spentBy: "Tara (Counter Staff)",
  },
  {
    id: "EXP-504",
    date: "Sep 06, 2026, 02:00 PM",
    rawDate: "2026-09-06",
    category: "Packaging Materials",
    icon: "📦",
    desc: "Gold foil wrapping paper & satin ribbons from local market",
    amount: 850,
    paidVia: "UPI (PhonePe)",
    spentBy: "Eleanor (Admin)",
  },
  {
    id: "EXP-505",
    date: "Sep 05, 2026, 04:30 PM",
    rawDate: "2026-09-05",
    category: "Petrol & Delivery",
    icon: "⛽",
    desc: "Delivery bike petrol refill for Bandra order drop",
    amount: 300,
    paidVia: "Cash from Drawer",
    spentBy: "Sanjay (Delivery Boy)",
  },
  {
    id: "EXP-506",
    date: "Sep 05, 2026, 11:00 AM",
    rawDate: "2026-09-05",
    category: "Shop Maintenance",
    icon: "🧹",
    desc: "Cold room mister spray cleaner & floor disinfectant",
    amount: 380,
    paidVia: "Cash from Drawer",
    spentBy: "Aarav (Florist Lead)",
  },
];

const CATEGORIES = [
  { label: "Tea & Coffee", icon: "☕" },
  { label: "Petrol & Delivery", icon: "⛽" },
  { label: "Snacks & Food", icon: "🥪" },
  { label: "Packaging Materials", icon: "📦" },
  { label: "Shop Maintenance", icon: "🧹" },
  { label: "Other Daily Expenses", icon: "🏷️" },
];

function DailyExpensesManager() {
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem("flowra_shop_expenses");
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch {
      return DEFAULT_EXPENSES;
    }
  });

  const [form, setForm] = useState({
    category: "Tea & Coffee",
    desc: "",
    amount: "",
    paidVia: "Cash from Drawer",
    spentBy: "Counter Staff",
  });

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Sync to backend and localStorage
  useEffect(() => {
    fetch("http://localhost:8080/api/expenses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiExpenses = data.map((exp) => ({
            id: exp.expenseCode || `EXP-${exp.id}`,
            dbId: exp.id,
            date: exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Today",
            rawDate: exp.expenseDate || new Date().toISOString().split("T")[0],
            category: exp.category,
            icon: exp.icon,
            desc: exp.description,
            amount: Number(exp.amount),
            paidVia: exp.paymentMode,
            spentBy: exp.spentBy,
          }));
          setExpenses((prev) => {
            const existingCodes = new Set(apiExpenses.map((e) => e.id));
            return [...apiExpenses, ...prev.filter((p) => !existingCodes.has(p.id))];
          });
        }
      })
      .catch((err) => console.warn("Expenses sync warning:", err));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("flowra_shop_expenses", JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0 || !form.desc.trim()) {
      alert("Please enter a valid expense description and amount.");
      return;
    }

    const catObj = CATEGORIES.find((c) => c.label === form.category) || { icon: "💸" };

    try {
      const res = await fetch("http://localhost:8080/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          icon: catObj.icon,
          description: form.desc.trim(),
          amount: amt,
          paymentMode: form.paidVia,
          spentBy: form.spentBy.trim() || "Staff",
          expenseDate: new Date().toISOString().split("T")[0],
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        const newExpense = {
          id: saved.expenseCode || `EXP-${saved.id}`,
          dbId: saved.id,
          date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          rawDate: saved.expenseDate || new Date().toISOString().split("T")[0],
          category: saved.category,
          icon: saved.icon,
          desc: saved.description,
          amount: Number(saved.amount),
          paidVia: saved.paymentMode,
          spentBy: saved.spentBy,
        };
        setExpenses([newExpense, ...expenses]);
        setForm({
          category: "Tea & Coffee",
          desc: "",
          amount: "",
          paidVia: "Cash from Drawer",
          spentBy: "Counter Staff",
        });
        showToast(`₹${amt} expense recorded for ${newExpense.category}! 💸`);
        return;
      }
    } catch (err) {
      console.warn("Backend expense save warning:", err);
    }

    const newExpense = {
      id: `EXP-${Math.floor(500 + Math.random() * 500)}`,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: new Date().toISOString().split("T")[0],
      category: form.category,
      icon: catObj.icon,
      desc: form.desc.trim(),
      amount: amt,
      paidVia: form.paidVia,
      spentBy: form.spentBy.trim() || "Staff",
    };

    setExpenses([newExpense, ...expenses]);
    setForm({
      category: "Tea & Coffee",
      desc: "",
      amount: "",
      paidVia: "Cash from Drawer",
      spentBy: "Counter Staff",
    });
    showToast(`₹${amt} expense recorded for ${newExpense.category}! 💸`);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm(`Delete expense record #${id}?`)) {
      const target = expenses.find((e) => e.id === id);
      if (target && target.dbId) {
        fetch(`http://localhost:8080/api/expenses/${target.dbId}`, { method: "DELETE" }).catch(console.warn);
      }
      setExpenses(expenses.filter((exp) => exp.id !== id));
      showToast(`Expense #${id} deleted.`);
    }
  };

  // CALCULATIONS
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTotal = expenses
    .filter((e) => e.rawDate === todayStr || e.date.includes("Sep 07"))
    .reduce((sum, e) => sum + e.amount, 0);

  const teaSnacksTotal = expenses
    .filter((e) => e.category === "Tea & Coffee" || e.category === "Snacks & Food")
    .reduce((sum, e) => sum + e.amount, 0);

  const petrolTotal = expenses
    .filter((e) => e.category === "Petrol & Delivery")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalAllExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const cashExpenses = expenses
    .filter((e) => e.paidVia.toLowerCase().includes("cash"))
    .reduce((sum, e) => sum + e.amount, 0);

  const digitalExpenses = expenses
    .filter((e) => !e.paidVia.toLowerCase().includes("cash"))
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesCat = categoryFilter === "All" || exp.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      exp.desc.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q) ||
      exp.paidVia.toLowerCase().includes(q) ||
      exp.spentBy.toLowerCase().includes(q) ||
      exp.id.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <AdminLayout pageTitle="Daily Shop Expenses & Petty Cash">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* SUMMARY KPI CARDS */}
      <div className="expense-kpi-grid">
        <div className="expense-kpi-card highlight-card">
          <span className="exp-icon-bubble">💸</span>
          <div>
            <h3>₹{totalAllExpenses.toLocaleString("en-IN")}</h3>
            <span className="exp-label">Total Shop Expenses</span>
            <small>{expenses.length} entries recorded</small>
          </div>
        </div>

        <div className="expense-kpi-card">
          <span className="exp-icon-bubble">☕</span>
          <div>
            <h3>₹{teaSnacksTotal.toLocaleString("en-IN")}</h3>
            <span className="exp-label">Tea, Coffee &amp; Snacks</span>
            <small>Staff refreshments</small>
          </div>
        </div>

        <div className="expense-kpi-card">
          <span className="exp-icon-bubble">⛽</span>
          <div>
            <h3>₹{petrolTotal.toLocaleString("en-IN")}</h3>
            <span className="exp-label">Petrol &amp; Van Travel</span>
            <small>Delivery &amp; mandi trips</small>
          </div>
        </div>

        <div className="expense-kpi-card">
          <span className="exp-icon-bubble">💵</span>
          <div>
            <h3>₹{cashExpenses.toLocaleString("en-IN")}</h3>
            <span className="exp-label">Cash from Drawer</span>
            <small>Digital: ₹{digitalExpenses.toLocaleString("en-IN")}</small>
          </div>
        </div>
      </div>

      <div className="expense-layout-split">
        {/* EXPENSE ENTRY FORM */}
        <div className="admin-card-panel expense-form-card">
          <div className="card-panel-header">
            <h3>➕ Record Daily Shop Expense</h3>
            <p>Enter tea, petrol, snacks, and daily petty cash spent</p>
          </div>

          <form onSubmit={handleAddExpense} className="expense-form-grid">
            <div className="form-field-group">
              <label>Expense Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label>Amount Spent (₹) *</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 150"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-field-group full-width">
              <label>Expense Description / Reason *</label>
              <input
                type="text"
                placeholder="e.g. Tea & biscuits for helper boys, Van petrol refill"
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                required
              />
            </div>

            <div className="form-field-group">
              <label>Paid Via *</label>
              <select
                value={form.paidVia}
                onChange={(e) => setForm({ ...form, paidVia: e.target.value })}
              >
                <option value="Cash from Drawer">💵 Cash from Drawer</option>
                <option value="UPI (Google Pay)">📱 UPI (Google Pay)</option>
                <option value="UPI (PhonePe / Paytm)">📱 UPI (PhonePe / Paytm)</option>
                <option value="Card / Bank">💳 Card / Bank Transfer</option>
              </select>
            </div>

            <div className="form-field-group">
              <label>Spent By / Handed To</label>
              <input
                type="text"
                placeholder="e.g. Aarav (Florist), Delivery Boy"
                value={form.spentBy}
                onChange={(e) => setForm({ ...form, spentBy: e.target.value })}
              />
            </div>

            <div className="form-actions-row full-width">
              <button type="submit" className="admin-btn-primary">
                ➕ Add Expense Entry
              </button>
            </div>
          </form>
        </div>

        {/* EXPENSE HISTORY TABLE */}
        <div className="admin-card-panel expense-table-card">
          <div className="card-panel-header with-search">
            <div>
              <h3>📜 Daily Expenses Ledger</h3>
              <p>Chronological history of shop petty cash &amp; expenses</p>
            </div>

            <div className="expense-filter-strip">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="category-filter-select"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search expense..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="expense-search-input"
              />
            </div>
          </div>

          <div className="admin-table-wrapper mini-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID &amp; Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Paid Via</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty-row">
                      No expense entries matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <strong>{exp.id}</strong>
                        <small className="table-subtext">{exp.date}</small>
                      </td>
                      <td>
                        <span className="expense-cat-badge">
                          {exp.icon} {exp.category}
                        </span>
                      </td>
                      <td>
                        <strong>{exp.desc}</strong>
                        <small className="table-subtext">By {exp.spentBy}</small>
                      </td>
                      <td>
                        <strong className="expense-amount-tag">
                          -₹{exp.amount.toLocaleString("en-IN")}
                        </strong>
                      </td>
                      <td>
                        <small className="payment-method-tag">{exp.paidVia}</small>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="table-action-btn delete-btn"
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="Delete expense"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default DailyExpensesManager;
