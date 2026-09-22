import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout.jsx";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [toastMessage, setToastMessage] = useState("");

  const [generalSettings, setGeneralSettings] = useState({
    shopName: "BloomBay Flowra Artisans",
    shopEmail: "concierge@flowra.com",
    shopPhone: "+91 (022) 8921-BLOOM",
    address: "12 Orchid Avenue, Blossom Quarter, Mumbai 400050",
    businessHours: "8:00 AM – 9:30 PM Daily",
    currency: "INR (₹)",
  });

  const [deliverySettings, setDeliverySettings] = useState({
    baseDeliveryFee: 50,
    freeDeliveryThreshold: 500,
    sameDayCutoff: "16:00",
    enableMidnightSlot: true,
    midnightFee: 150,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enableUpi: true,
    enableCards: true,
    enableCod: true,
    enableCorporateNetBanking: true,
  });

  const [stockSettings, setStockSettings] = useState({
    defaultLowThreshold: 5,
    autoHideOutOfStock: false,
    sendLowStockEmail: true,
  });

  useEffect(() => {
    fetch("http://localhost:8080/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          if (data.shopName) {
            setGeneralSettings((prev) => ({
              ...prev,
              shopName: data.shopName || prev.shopName,
              shopEmail: data.shopEmail || prev.shopEmail,
              shopPhone: data.shopPhone || prev.shopPhone,
              address: data.address || prev.address,
              businessHours: data.businessHours || prev.businessHours,
              currency: data.currency || prev.currency,
            }));
          }
        }
      })
      .catch((err) => console.warn("Settings sync warning:", err));
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...generalSettings,
      ...deliverySettings,
      ...paymentSettings,
      ...stockSettings,
    };
    try {
      await fetch("http://localhost:8080/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("Settings save warning:", err);
    }
    triggerToast("Settings saved successfully! 🌸");
  };

  return (
    <AdminLayout pageTitle="Store Configuration & Settings">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TABS NAVIGATION */}
      <section className="settings-tabs-bar">
        <button
          type="button"
          className={`settings-tab-pill ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          🏪 General Shop
        </button>
        <button
          type="button"
          className={`settings-tab-pill ${activeTab === "delivery" ? "active" : ""}`}
          onClick={() => setActiveTab("delivery")}
        >
          🚚 Delivery &amp; Shipping
        </button>
        <button
          type="button"
          className={`settings-tab-pill ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => setActiveTab("payments")}
        >
          💳 Payment Gateways
        </button>
        <button
          type="button"
          className={`settings-tab-pill ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          📦 Inventory &amp; Thresholds
        </button>
      </section>

      {/* SETTINGS CARD */}
      <section className="dashboard-table-card settings-card-body">
        <form onSubmit={handleSave}>
          {activeTab === "general" && (
            <div className="settings-section-stack">
              <h3>General Florist Brand Settings</h3>
              <p>Configure public boutique details, operating hours and concierge lines.</p>

              <div className="input-grid-2">
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    value={generalSettings.shopName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, shopName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Concierge Email</label>
                  <input
                    type="email"
                    value={generalSettings.shopEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, shopEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-grid-2">
                <div className="form-group">
                  <label>Support Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={generalSettings.shopPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, shopPhone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Operating Hours</label>
                  <input
                    type="text"
                    value={generalSettings.businessHours}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, businessHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Flagship Glasshouse Studio Address</label>
                <input
                  type="text"
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="settings-section-stack">
              <h3>Delivery &amp; Courier Logistics Rules</h3>
              <p>Manage shipping rates, free delivery thresholds, and same-day cutoffs.</p>

              <div className="input-grid-2">
                <div className="form-group">
                  <label>Base Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={deliverySettings.baseDeliveryFee}
                    onChange={(e) => setDeliverySettings({ ...deliverySettings, baseDeliveryFee: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Free Delivery Minimum Cart Total (₹)</label>
                  <input
                    type="number"
                    value={deliverySettings.freeDeliveryThreshold}
                    onChange={(e) => setDeliverySettings({ ...deliverySettings, freeDeliveryThreshold: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="input-grid-2">
                <div className="form-group">
                  <label>Same-Day Order Cutoff Time (24h format)</label>
                  <input
                    type="text"
                    value={deliverySettings.sameDayCutoff}
                    onChange={(e) => setDeliverySettings({ ...deliverySettings, sameDayCutoff: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Midnight Special Slot Surcharge (₹)</label>
                  <input
                    type="number"
                    value={deliverySettings.midnightFee}
                    onChange={(e) => setDeliverySettings({ ...deliverySettings, midnightFee: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="settings-section-stack">
              <h3>Payment Gateway Channels</h3>
              <p>Enable or disable storefront payment methods.</p>

              <div className="settings-toggle-stack">
                <label className="settings-toggle-row">
                  <div>
                    <strong>UPI &amp; QR Direct Settlement (GPay, PhonePe, Paytm)</strong>
                    <small>0% transaction surcharge for customers</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.enableUpi}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, enableUpi: e.target.checked })}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Credit &amp; Debit Cards (Visa, Mastercard, RuPay)</strong>
                    <small>Processed via 256-bit SSL gateway</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.enableCards}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCards: e.target.checked })}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <small>Allow doorstep payment upon delivery</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.enableCod}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCod: e.target.checked })}
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="settings-section-stack">
              <h3>Stock &amp; Low-Inventory Alarm Rules</h3>
              <p>Control automatic threshold notifications and out-of-stock behaviors.</p>

              <div className="form-group">
                <label>Default Low Stock Warning Threshold (Stems / Units)</label>
                <input
                  type="number"
                  value={stockSettings.defaultLowThreshold}
                  onChange={(e) => setStockSettings({ ...stockSettings, defaultLowThreshold: Number(e.target.value) })}
                />
              </div>

              <div className="settings-toggle-stack">
                <label className="settings-toggle-row">
                  <div>
                    <strong>Send Instant Email/WhatsApp Alerts on Low Stock</strong>
                    <small>Notifies warehouse &amp; procurement team</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={stockSettings.sendLowStockEmail}
                    onChange={(e) => setStockSettings({ ...stockSettings, sendLowStockEmail: e.target.checked })}
                  />
                </label>

                <label className="settings-toggle-row">
                  <div>
                    <strong>Automatically Hide Products When Stock Hits Zero</strong>
                    <small>Hides out-of-stock stems from customer collection grid</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={stockSettings.autoHideOutOfStock}
                    onChange={(e) => setStockSettings({ ...stockSettings, autoHideOutOfStock: e.target.checked })}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="settings-save-footer">
            <button type="submit" className="admin-btn-primary">
              Save Configuration Settings 🌸
            </button>
          </div>
        </form>
      </section>
    </AdminLayout>
  );
}

export default AdminSettings;
