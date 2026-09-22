import { useState } from "react";
import AdminLayout from "./AdminLayout.jsx";

function CustomersManager() {
  const initialCustomers = [
    {
      id: "CUST-001",
      name: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      phone: "+91 98201 44820",
      avatar: "P",
      tier: "VIP Floral Club",
      totalOrders: 8,
      totalSpent: 12450,
      lastOrder: "Sep 01, 2026",
      status: "Active",
      address: "Flat 702, Sea View Towers, Worli, Mumbai - 400018",
      joined: "Jan 14, 2026",
      notes: "Loves peach ranunculus and garden roses. Always requests calligraphy card.",
    },
    {
      id: "CUST-002",
      name: "Rahul Mehta",
      email: "rahul.mehta@yahoo.com",
      phone: "+91 97690 12345",
      avatar: "R",
      tier: "Gold Patron",
      totalOrders: 5,
      totalSpent: 6890,
      lastOrder: "Sep 01, 2026",
      status: "Active",
      address: "B-403, Palm Grove, Bandra West, Mumbai - 400050",
      joined: "Feb 02, 2026",
      notes: "Prefers morning deliveries between 8-10 AM.",
    },
    {
      id: "CUST-003",
      name: "Ananya Iyer",
      email: "ananya.iyer@outlook.com",
      phone: "+91 99302 88441",
      avatar: "A",
      tier: "VIP Floral Club",
      totalOrders: 11,
      totalSpent: 28400,
      lastOrder: "Sep 01, 2026",
      status: "Active",
      address: "14, Heritage Bunglow, Juhu Tara Road, Mumbai - 400049",
      joined: "Nov 19, 2025",
      notes: "Frequent buyer of exotic white king proteas and orchid installations.",
    },
    {
      id: "CUST-004",
      name: "Vikram Sen",
      email: "vikram.sen@techcorp.in",
      phone: "+91 98190 77332",
      avatar: "V",
      tier: "Corporate Account",
      totalOrders: 14,
      totalSpent: 42300,
      lastOrder: "Sep 01, 2026",
      status: "Active",
      address: "Tower 3, Penthouse 22, Lodha Bellissimo, Mahalaxmi, Mumbai - 400011",
      joined: "Aug 10, 2025",
      notes: "Corporate client for VIP client gifts and office reception florals.",
    },
    {
      id: "CUST-005",
      name: "Neha Kapoor",
      email: "neha.kapoor@gmail.com",
      phone: "+91 98211 55667",
      avatar: "N",
      tier: "Silver Bloom",
      totalOrders: 3,
      totalSpent: 3450,
      lastOrder: "Aug 31, 2026",
      status: "Active",
      address: "A-12, Green Acres, Powai, Mumbai - 400076",
      joined: "Mar 11, 2026",
      notes: "Prefers pastel Holland tulips and seasonal sweet peas.",
    },
    {
      id: "CUST-006",
      name: "Deepak Verma",
      email: "deepak.verma@hotmail.com",
      phone: "+91 97731 22990",
      avatar: "D",
      tier: "Silver Bloom",
      totalOrders: 2,
      totalSpent: 1850,
      lastOrder: "Sep 01, 2026",
      status: "Active",
      address: "502, Orchid Heights, Chembur, Mumbai - 400071",
      joined: "Apr 22, 2026",
      notes: "Loves Indian fragrant jasmine posies.",
    },
  ];

  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleToggleAccount = (id) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === "Active" ? "Suspended" : "Active";
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
    triggerToast("Customer account status updated.");
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <AdminLayout pageTitle="Customer Relationship Management">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TOP BAR */}
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          <div className="admin-search-input-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search customer by name, email, phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => triggerToast("Customer directory CSV exported!")}
          >
            📥 Export Customer List
          </button>
        </div>
      </section>

      {/* CUSTOMERS TABLE */}
      <section className="dashboard-table-card">
        <div className="card-top-action-bar">
          <div>
            <h3>Registered Customers &amp; VIP Members ({filteredCustomers.length})</h3>
            <p>Track purchase frequencies, lifetime values, and VIP status tiers</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Information</th>
                <th>Membership Tier</th>
                <th>Total Orders</th>
                <th>Lifetime Spent</th>
                <th>Last Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr key={cust.id}>
                  <td>
                    <div className="table-item-cell">
                      <span className="customer-avatar-badge">{cust.avatar}</span>
                      <div>
                        <strong>{cust.name}</strong>
                        <small className="table-subtext">Joined: {cust.joined}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>✉️ {cust.email}</div>
                    <small className="table-subtext">📞 {cust.phone}</small>
                  </td>

                  <td>
                    <span className="tier-badge-pill">{cust.tier}</span>
                  </td>

                  <td>
                    <strong>{cust.totalOrders} orders</strong>
                  </td>

                  <td>
                    <strong className="amount-highlight">₹{cust.totalSpent.toLocaleString("en-IN")}</strong>
                  </td>

                  <td>
                    <strong>{cust.lastOrder}</strong>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={`status-pill-toggle ${cust.status.toLowerCase()}`}
                      onClick={() => handleToggleAccount(cust.id)}
                    >
                      {cust.status}
                    </button>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="admin-btn-secondary small-btn"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      View Profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-eyebrow">CUSTOMER DOSSIER</span>
                <h2>{selectedCustomer.name}</h2>
                <small className="tier-badge-pill">{selectedCustomer.tier}</small>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedCustomer(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-form-scroll">
              <div className="drawer-grid-2">
                <div className="drawer-info-block">
                  <h4>Contact Details</h4>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                  <p><strong>Member Since:</strong> {selectedCustomer.joined}</p>
                </div>
                <div className="drawer-info-block">
                  <h4>Saved Delivery Address</h4>
                  <p>{selectedCustomer.address}</p>
                </div>
              </div>

              <div className="customer-stats-strip">
                <div className="cust-stat">
                  <span>Total Purchases</span>
                  <strong>{selectedCustomer.totalOrders} Orders</strong>
                </div>
                <div className="cust-stat">
                  <span>Total Spent</span>
                  <strong>₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}</strong>
                </div>
                <div className="cust-stat">
                  <span>Account Status</span>
                  <strong>{selectedCustomer.status}</strong>
                </div>
              </div>

              <div className="customer-notes-card">
                <h4>Florist Styling Preferences</h4>
                <p>{selectedCustomer.notes}</p>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => handleToggleAccount(selectedCustomer.id)}
                >
                  {selectedCustomer.status === "Active" ? "Suspend Account" : "Activate Account"}
                </button>
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => {
                    triggerToast(`Promo gift coupon sent to ${selectedCustomer.name}! 💌`);
                    setSelectedCustomer(null);
                  }}
                >
                  Send Exclusive Bloom Voucher 🌸
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CustomersManager;
