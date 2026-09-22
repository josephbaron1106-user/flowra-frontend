import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout.jsx";

import carouselRanunculus from "../assets/pictures/carousel_ranunculus.jpg";
import carouselProtea from "../assets/pictures/carousel_protea.jpg";
import carouselCalla from "../assets/pictures/carousel_calla.jpg";
import flowers1 from "../assets/pictures/flowers1.jpg";
import flowers2 from "../assets/pictures/flowers2.jpg";
import flowers3 from "../assets/pictures/flowers3.jpg";
import flower4 from "../assets/pictures/flower4.jpg";
import flowers5 from "../assets/pictures/flowers5.jpeg";

const fallbackImages = {
  "ROS-RED-01": flowers1,
  "JAS-WHT-01": flowers2,
  "TUL-PNK-05": flowers3,
  "HIB-RED-08": flower4,
  "LOT-PNK-02": flowers5,
  "RAN-PNK-03": carouselRanunculus,
  "PROT-WHT-01": carouselProtea,
  "CAL-BLK-04": carouselCalla,
  "BQ-RAN-01": carouselRanunculus,
  "ORC-PRP-03": flowers1,
  "LIL-STR-02": flowers2,
  "FOL-EUC-01": flower4,
};

function InventoryManager() {
  const [stockList, setStockList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "in" | "low" | "out"
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load real-time stock dashboard from backend
  const loadStockData = () => {
    setIsLoading(true);
    fetch("http://localhost:8080/api/stock")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stock");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setStockList(data);
        }
      })
      .catch((err) => {
        console.warn("Stock sync warning:", err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleUpdateThreshold = (flowerId, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    fetch(`http://localhost:8080/api/stock/${flowerId}/threshold`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minThreshold: num }),
    })
      .then((r) => r.json())
      .then((updated) => {
        setStockList((prev) =>
          prev.map((item) =>
            item.flowerId === flowerId
              ? { ...item, minThreshold: updated.minThreshold, status: updated.status, statusLabel: updated.statusLabel }
              : item
          )
        );
        triggerToast("Safety threshold updated in database! 🌿");
      })
      .catch(console.warn);
  };

  const getBadgeClass = (status) => {
    if (status === "OUT_OF_STOCK") return "badge-red";
    if (status === "LOW_STOCK") return "badge-amber";
    return "badge-green";
  };

  const getImageSrc = (item) => {
    if (item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("data:image"))) {
      return item.imageUrl;
    }
    if (fallbackImages[item.flowerSku]) {
      return fallbackImages[item.flowerSku];
    }
    return flowers1;
  };

  const lowStockCount = stockList.filter((i) => i.status === "LOW_STOCK").length;
  const outOfStockCount = stockList.filter((i) => i.status === "OUT_OF_STOCK").length;
  const inStockCount = stockList.filter((i) => i.status === "IN_STOCK").length;

  const filteredStock = stockList.filter((item) => {
    const matchesSearch =
      (item.flowerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.flowerSku || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === "low") return matchesSearch && item.status === "LOW_STOCK";
    if (filterType === "out") return matchesSearch && item.status === "OUT_OF_STOCK";
    if (filterType === "in") return matchesSearch && item.status === "IN_STOCK";
    return matchesSearch;
  });

  return (
    <AdminLayout pageTitle="Inventory & Stock Dashboard">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* ALERT BANNER IF LOW OR OUT OF STOCK */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="inventory-warning-banner">
          <span className="warn-icon">⚠️</span>
          <div>
            <strong>
              Attention: {outOfStockCount > 0 ? `${outOfStockCount} Out of Stock` : ""}{" "}
              {outOfStockCount > 0 && lowStockCount > 0 ? "•" : ""}{" "}
              {lowStockCount > 0 ? `${lowStockCount} Below Minimum Safety Threshold` : ""}
            </strong>
            <p>Inward new batches on the Wholesale Purchase Entry screen to replenish inventory.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {outOfStockCount > 0 && (
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ borderColor: "#dc2626", color: "#dc2626" }}
                onClick={() => setFilterType("out")}
              >
                View Out of Stock ({outOfStockCount})
              </button>
            )}
            {lowStockCount > 0 && (
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setFilterType("low")}
              >
                View Low Stock ({lowStockCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* SEARCH AND QUICK FILTERS */}
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          <div className="admin-search-input-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by flower name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="quick-status-tabs">
            <button
              type="button"
              className={`status-tab-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All Flowers ({stockList.length})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${filterType === "in" ? "active" : ""}`}
              onClick={() => setFilterType("in")}
            >
              In Stock ({inStockCount})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${filterType === "low" ? "active" : ""}`}
              onClick={() => setFilterType("low")}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              type="button"
              className={`status-tab-btn ${filterType === "out" ? "active" : ""}`}
              onClick={() => setFilterType("out")}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>
      </section>

      {/* REAL-TIME STOCK DASHBOARD TABLE */}
      <section className="dashboard-table-card">
        <div className="card-top-action-bar">
          <div>
            <h3>Real-Time Live Flower Inventory</h3>
            <p>Populated from wholesale purchase inflows minus in-person sales &amp; online orders</p>
          </div>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => {
              loadStockData();
              triggerToast("Live stock refreshed from MySQL database!");
            }}
          >
            🔄 Refresh Live Stock
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Flower</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Wholesale Inflow</th>
                <th>Total Sold</th>
                <th>Available Count</th>
                <th>Min Threshold</th>
                <th>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                    Loading real-time stock from database...
                  </td>
                </tr>
              ) : filteredStock.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty-row">
                    No flower stock records found.
                  </td>
                </tr>
              ) : (
                filteredStock.map((item) => {
                  const badgeClass = getBadgeClass(item.status);
                  const isZero = item.currentStock === 0;

                  return (
                    <tr key={item.id || item.flowerId}>
                      <td>
                        <div className="table-item-cell">
                          <img
                            src={getImageSrc(item)}
                            alt={item.flowerName}
                            className="table-item-thumb"
                          />
                          <div>
                            <strong>{item.flowerName}</strong>
                            <small style={{ color: "#785a65", display: "block" }}>
                              Selling Rate: ₹{Number(item.retailPrice || 0).toFixed(2)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <code>{item.flowerSku}</code>
                      </td>

                      <td>
                        <span className="category-tag-pill">{item.categoryName}</span>
                      </td>

                      <td>
                        <strong className="text-success">+{item.totalInflow} stems</strong>
                      </td>

                      <td>
                        <strong className="text-danger">-{item.totalOutflow} stems</strong>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: isZero ? "#dc2626" : item.status === "LOW_STOCK" ? "#b45309" : "#15803d",
                              background: isZero ? "#fee2e2" : item.status === "LOW_STOCK" ? "#fef3c7" : "#dcfce7",
                              padding: "4px 10px",
                              borderRadius: 8,
                            }}
                          >
                            {item.currentStock} stems
                          </span>
                        </div>
                      </td>

                      <td>
                        <input
                          type="number"
                          className="inline-min-input"
                          defaultValue={item.minThreshold}
                          onBlur={(e) => handleUpdateThreshold(item.flowerId, e.target.value)}
                          title="Click and edit minimum safety threshold"
                          style={{ width: 65, textAlign: "center", borderRadius: 8, border: "1px solid #ebd3cb", padding: "4px 6px" }}
                        />
                      </td>

                      <td>
                        <span className={`admin-status-badge ${badgeClass}`}>
                          {item.statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

export default InventoryManager;
