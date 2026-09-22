import { useState } from "react";
import AdminLayout from "./AdminLayout.jsx";

function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState("this_month");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <AdminLayout pageTitle="Reports & Financial Analytics">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TIMEFRAME SELECTOR */}
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          <div>
            <h3>Executive Performance Reports</h3>
            <p>Exportable business intelligence on gross margins, repeat orders &amp; delivery speed</p>
          </div>
          <div className="filter-select-group">
            <label>Reporting Period:</label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                triggerToast("Analytics synced for selected timeframe.");
              }}
            >
              <option value="today">Today (Live)</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month (September 2026)</option>
              <option value="this_year">This Fiscal Year (2026)</option>
            </select>
          </div>
          <div className="export-btn-group">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => triggerToast("Generating Printable PDF Report...")}
            >
              📄 Export PDF
            </button>
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => triggerToast("Generating Full Excel Workbook...")}
            >
              📊 Export Excel .XLSX
            </button>
          </div>
        </div>
      </section>

      {/* KEY METRICS GRID */}
      <section className="dashboard-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-title">Gross Sales Volume</span>
          <h3 className="kpi-value">₹2,48,920</h3>
          <small className="kpi-sub text-success">▲ +18.4% vs last month</small>
        </div>
        <div className="kpi-card">
          <span className="kpi-title">Average Order Value (AOV)</span>
          <h3 className="kpi-value">₹1,420</h3>
          <small className="kpi-sub text-success">▲ +12.0% (Higher bouquet tiers)</small>
        </div>
        <div className="kpi-card">
          <span className="kpi-title">Customer Lifetime Value</span>
          <h3 className="kpi-value">₹4,890</h3>
          <small className="kpi-sub text-success">▲ 3.4 repeat orders avg</small>
        </div>
        <div className="kpi-card">
          <span className="kpi-title">Gross Profit Margin</span>
          <h3 className="kpi-value">68.5%</h3>
          <small className="kpi-sub text-success">Direct farm sourcing benefit</small>
        </div>
      </section>

      {/* VISUAL REPORT BREAKDOWN */}
      <section className="dashboard-charts-grid">
        <div className="admin-chart-card">
          <div className="chart-header">
            <div>
              <h3>Monthly Growth Trajectory (2026)</h3>
              <p>Total Revenue in Lakhs (INR)</p>
            </div>
          </div>
          <div className="simulated-bar-chart">
            <div className="bar-column">
              <div className="bar-fill" style={{ height: "40%" }}><span className="bar-tooltip">₹1.2L</span></div>
              <span className="bar-label">Apr</span>
            </div>
            <div className="bar-column">
              <div className="bar-fill" style={{ height: "55%" }}><span className="bar-tooltip">₹1.65L</span></div>
              <span className="bar-label">May</span>
            </div>
            <div className="bar-column">
              <div className="bar-fill" style={{ height: "65%" }}><span className="bar-tooltip">₹1.95L</span></div>
              <span className="bar-label">Jun</span>
            </div>
            <div className="bar-column">
              <div className="bar-fill" style={{ height: "78%" }}><span className="bar-tooltip">₹2.18L</span></div>
              <span className="bar-label">Jul</span>
            </div>
            <div className="bar-column">
              <div className="bar-fill" style={{ height: "85%" }}><span className="bar-tooltip">₹2.35L</span></div>
              <span className="bar-label">Aug</span>
            </div>
            <div className="bar-column">
              <div className="bar-fill active-bar" style={{ height: "95%" }}><span className="bar-tooltip">₹2.48L</span></div>
              <span className="bar-label">Sep (Current)</span>
            </div>
          </div>
        </div>

        <div className="admin-chart-card">
          <div className="chart-header">
            <div>
              <h3>Channel Acquisition Breakdown</h3>
              <p>Where high-value floral shoppers come from</p>
            </div>
          </div>
          <div className="category-progress-bars">
            <div className="cat-progress-row">
              <div className="cat-meta">
                <span>Organic Search &amp; Direct</span>
                <strong>45% (₹1.12L)</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: "45%", background: "#923e4e" }} />
              </div>
            </div>
            <div className="cat-progress-row">
              <div className="cat-meta">
                <span>Instagram &amp; Social Influencers</span>
                <strong>32% (₹79.6k)</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: "32%", background: "#b85d6e" }} />
              </div>
            </div>
            <div className="cat-progress-row">
              <div className="cat-meta">
                <span>Word of Mouth &amp; Referrals</span>
                <strong>15% (₹37.3k)</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: "15%", background: "#738b79" }} />
              </div>
            </div>
            <div className="cat-progress-row">
              <div className="cat-meta">
                <span>Corporate Partnerships</span>
                <strong>8% (₹19.9k)</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: "8%", background: "#986f91" }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default ReportsAnalytics;
