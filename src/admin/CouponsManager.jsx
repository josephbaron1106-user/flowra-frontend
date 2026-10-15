import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout.jsx";

function CouponsManager() {
  const initialCoupons = [
    { id: "CPN-01", code: "FLOWRA10", discountType: "Percentage", value: "10%", minOrder: 500, maxDiscount: 250, uses: 142, limit: 500, status: "Active", expiry: "Dec 31, 2026" },
    { id: "CPN-02", code: "BLOOM50", discountType: "Fixed Amount", value: "₹50", minOrder: 400, maxDiscount: 50, uses: 89, limit: 200, status: "Active", expiry: "Nov 30, 2026" },
    { id: "CPN-03", code: "WELCOME20", discountType: "Percentage", value: "20%", minOrder: 800, maxDiscount: 400, uses: 310, limit: 1000, status: "Active", expiry: "Oct 15, 2026" },
    { id: "CPN-04", code: "VIPFESTIVE", discountType: "Fixed Amount", value: "₹200", minOrder: 1500, maxDiscount: 200, uses: 45, limit: 100, status: "Active", expiry: "Sep 30, 2026" },
  ];

  const [coupons, setCoupons] = useState(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "Percentage",
    value: "15%",
    minOrder: 500,
    maxDiscount: 300,
    limit: 100,
    expiry: "2026-12-31",
  });

  useEffect(() => {
    fetch("https://flowra-backend-1.onrender.com/api/coupons")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiCoupons = data.map((c) => ({
            id: c.id,
            dbId: c.id,
            code: c.code,
            discountType: c.discountType,
            value: c.discountType === "Percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`,
            minOrder: c.minOrderAmount,
            maxDiscount: c.maxDiscountAmount,
            uses: c.usageCount || 0,
            limit: c.usageLimit || 100,
            status: c.status || "Active",
            expiry: c.expiryDate || "Dec 31, 2026",
          }));
          setCoupons((prev) => {
            const existingCodes = new Set(apiCoupons.map((ac) => ac.code));
            return [...apiCoupons, ...prev.filter((p) => !existingCodes.has(p.code))];
          });
        }
      })
      .catch((err) => console.warn("Coupons sync warning:", err));
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const cleanCode = newCoupon.code.toUpperCase().trim();
    const discountVal = parseFloat(String(newCoupon.value).replace(/[^\d.]/g, "")) || 10;

    try {
      const res = await fetch("https://flowra-backend-1.onrender.com/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          discountType: newCoupon.discountType,
          discountValue: discountVal,
          minOrderAmount: Number(newCoupon.minOrder) || 0,
          maxDiscountAmount: Number(newCoupon.maxDiscount) || 200,
          usageLimit: Number(newCoupon.limit) || 100,
          expiryDate: newCoupon.expiry,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        const created = {
          ...newCoupon,
          id: saved.id,
          dbId: saved.id,
          code: saved.code || cleanCode,
          uses: saved.usageCount || 0,
          status: saved.status || "Active",
        };
        setCoupons((prev) => [created, ...prev.filter((c) => c.code !== cleanCode)]);
        setIsModalOpen(false);
        triggerToast(`Promo code "${created.code}" is now live! 🎟️`);
        return;
      }
    } catch (err) {
      console.warn("Backend coupon save error:", err);
    }

    const created = {
      ...newCoupon,
      id: "CPN-0" + (coupons.length + 1),
      code: cleanCode,
      uses: 0,
      status: "Active",
    };
    setCoupons((prev) => [created, ...prev]);
    setIsModalOpen(false);
    triggerToast(`Promo code "${created.code}" is now live! 🎟️`);
  };

  const handleToggleStatus = (id) => {
    const coupon = coupons.find((c) => c.id === id);
    if (coupon && coupon.dbId) {
      fetch(`https://flowra-backend-1.onrender.com/api/coupons/${coupon.dbId}/toggle`, { method: "PUT" }).catch(console.warn);
    }
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "Active" ? "Disabled" : "Active" } : c))
    );
    triggerToast("Coupon status updated.");
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      const coupon = coupons.find((c) => c.id === id);
      if (coupon && coupon.dbId) {
        fetch(`https://flowra-backend-1.onrender.com/api/coupons/${coupon.dbId}`, { method: "DELETE" }).catch(console.warn);
      }
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      triggerToast(`Coupon "${code}" deleted.`);
    }
  };

  return (
    <AdminLayout pageTitle="Promotions & Coupons Management">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TOP CONTROL */}
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          <div>
            <h3>Active Seasonal Promo Campaigns</h3>
            <p>Discount rules, redemption limits, and voucher validity dates</p>
          </div>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            + Create New Promo Coupon
          </button>
        </div>
      </section>

      {/* TABLE */}
      <section className="dashboard-table-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Voucher Code</th>
                <th>Discount Value</th>
                <th>Minimum Order</th>
                <th>Max Cap</th>
                <th>Redemptions</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((cpn) => (
                <tr key={cpn.id}>
                  <td>
                    <span className="coupon-code-pill">🎟️ {cpn.code}</span>
                  </td>
                  <td>
                    <strong className="amount-highlight">{cpn.value}</strong>
                    <small className="table-subtext">{cpn.discountType}</small>
                  </td>
                  <td>
                    <span>₹{cpn.minOrder}</span>
                  </td>
                  <td>
                    <span>₹{cpn.maxDiscount}</span>
                  </td>
                  <td>
                    <strong>{cpn.uses}</strong> / {cpn.limit}
                  </td>
                  <td>
                    <small>{cpn.expiry}</small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`status-pill-toggle ${cpn.status.toLowerCase()}`}
                      onClick={() => handleToggleStatus(cpn.id)}
                    >
                      {cpn.status}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="action-icon-btn danger"
                      onClick={() => handleDelete(cpn.id, cpn.code)}
                      title="Delete Coupon"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-eyebrow">COUPON CREATOR</span>
                <h2>New Promo Voucher</h2>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="modal-form-scroll">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE25"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </div>

              <div className="input-grid-2">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="15% or ₹100"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-grid-2">
                <div className="form-group">
                  <label>Min Order (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrder}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Usage Limit</label>
                  <input
                    type="number"
                    value={newCoupon.limit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, limit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={newCoupon.expiry}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  Launch Coupon 🎟️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CouponsManager;
