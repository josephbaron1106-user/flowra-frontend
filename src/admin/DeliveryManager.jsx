import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout.jsx";

function DeliveryManager() {
  const initialDeliveries = [
    {
      id: "DEL-401",
      orderId: "FLW-94021",
      customer: "Priya Sharma",
      address: "Worli, Mumbai - 400018",
      partner: "Flowra Express Fleet (Van #4)",
      driver: "Karan Singh (+91 98111 22334)",
      slot: "Evening (5:00 PM - 9:00 PM)",
      status: "Preparing",
      temperature: "14°C (Climate-Controlled)",
    },
    {
      id: "DEL-400",
      orderId: "FLW-94020",
      customer: "Rahul Mehta",
      address: "Bandra West, Mumbai - 400050",
      partner: "Shadowfax Priority",
      driver: "Sunil Patil (+91 97222 33445)",
      slot: "Afternoon (1:00 PM - 4:00 PM)",
      status: "Out for Delivery",
      temperature: "16°C",
    },
    {
      id: "DEL-399",
      orderId: "FLW-94019",
      customer: "Ananya Iyer",
      address: "Juhu Tara Road, Mumbai - 400049",
      partner: "Flowra Express Fleet (Van #2)",
      driver: "Amit Desai (+91 98333 44556)",
      slot: "Morning (8:00 AM - 11:00 AM)",
      status: "Assigned",
      temperature: "13°C",
    },
    {
      id: "DEL-398",
      orderId: "FLW-94018",
      customer: "Vikram Sen",
      address: "Mahalaxmi, Mumbai - 400011",
      partner: "Flowra VIP White-Glove",
      driver: "Rajesh Rao (+91 99444 55667)",
      slot: "Morning (8:00 AM - 11:00 AM)",
      status: "Delivered",
      temperature: "15°C",
    },
  ];

  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/deliveries")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiDeliveries = data.map((d) => ({
            id: d.deliveryCode || `DEL-${d.id}`,
            dbId: d.id,
            orderId: d.orderNumber || "FLW-94021",
            customer: d.customerName || "Customer",
            address: d.deliveryAddress || "Address",
            partner: d.deliveryPartner || "Flowra Express Fleet",
            driver: d.driverName + (d.driverPhone ? ` (${d.driverPhone})` : ""),
            slot: d.deliverySlot || "Morning Slot",
            status: d.status || "Assigned",
            temperature: d.temperatureLog || "15°C",
          }));
          setDeliveries((prev) => {
            const existingCodes = new Set(apiDeliveries.map((ad) => ad.id));
            return [...apiDeliveries, ...prev.filter((p) => !existingCodes.has(p.id))];
          });
        }
      })
      .catch((err) => console.warn("Deliveries sync warning:", err));
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleStatusChange = (id, newStatus) => {
    const target = deliveries.find((d) => d.id === id);
    if (target && target.dbId) {
      fetch(`http://localhost:8080/api/deliveries/${target.dbId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }).catch(console.warn);
    }
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
    triggerToast(`Delivery #${id} updated to "${newStatus}"! 🚚`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered": return "badge-green";
      case "Out for Delivery": return "badge-blue";
      case "Assigned": return "badge-indigo";
      case "Preparing": return "badge-amber";
      default: return "badge-gray";
    }
  };

  return (
    <AdminLayout pageTitle="Logistics & Dispatch Management">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* DISPATCH OVERVIEW */}
      <section className="payment-summary-strip">
        <div className="pay-stat-box">
          <span>Active Dispatches Today</span>
          <strong>{deliveries.length} Deliveries</strong>
          <small>4 temperature-controlled vehicles active</small>
        </div>
        <div className="pay-stat-box">
          <span>On-Time Arrival Rate</span>
          <strong className="text-success">98.4% On-Time</strong>
          <small>Average transit 42 minutes</small>
        </div>
        <div className="pay-stat-box">
          <span>Cold-Chain Assurance</span>
          <strong className="text-success">14°C - 16°C Optimal</strong>
          <small>Zero petal wilt reported</small>
        </div>
      </section>

      {/* TABLE */}
      <section className="dashboard-table-card">
        <div className="card-top-action-bar">
          <div>
            <h3>Live Flower Dispatch Queue</h3>
            <p>Assign courier partners, monitor van temperatures &amp; track customer handoffs</p>
          </div>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => triggerToast("Opening GPS live tracking map...")}
          >
            🗺️ Live Fleet Radar
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Order Ref</th>
                <th>Recipient &amp; Zone</th>
                <th>Assigned Courier Partner</th>
                <th>Time Slot</th>
                <th>Van Temp</th>
                <th>Dispatch Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((del) => (
                <tr key={del.id}>
                  <td>
                    <strong>{del.id}</strong>
                  </td>
                  <td>
                    <span className="order-badge">{del.orderId}</span>
                  </td>
                  <td>
                    <strong>{del.customer}</strong>
                    <small className="table-subtext">{del.address}</small>
                  </td>
                  <td>
                    <strong>{del.partner}</strong>
                    <small className="table-subtext">{del.driver}</small>
                  </td>
                  <td>
                    <small>{del.slot}</small>
                  </td>
                  <td>
                    <span className="temp-badge">❄️ {del.temperature}</span>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${getStatusBadgeClass(del.status)}`}>
                      {del.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select-inline"
                      value={del.status}
                      onChange={(e) => handleStatusChange(del.id, e.target.value)}
                    >
                      <option value="Preparing">Preparing</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
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

export default DeliveryManager;
