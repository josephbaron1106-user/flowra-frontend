import { useState } from "react";
import AdminLayout from "./AdminLayout.jsx";
import { useAdminAuth } from "./AdminAuthContext.jsx";

function AdminProfile() {
  const { adminUser, updateAdminProfile } = useAdminAuth();

  const [formData, setFormData] = useState({
    name: adminUser.name,
    email: adminUser.email,
    phone: adminUser.phone,
    role: adminUser.role,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [twoFactor, setTwoFactor] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateAdminProfile(formData);
    triggerToast("Admin profile updated successfully! 🌸");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    setPasswords({ current: "", newPassword: "", confirm: "" });
    triggerToast("Admin password changed securely! 🔒");
  };

  return (
    <AdminLayout pageTitle="Admin Profile & Security">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      <div className="profile-layout-grid">
        {/* LEFT COLUMN: PROFILE CARD */}
        <div className="profile-card-col">
          <div className="profile-user-summary-card">
            <div className="profile-large-avatar">
              <span>{adminUser.avatar}</span>
              <button
                type="button"
                className="change-avatar-btn"
                title="Change Avatar"
                onClick={() => {
                  const icons = ["🌸", "🌹", "🌷", "🌺", "💐", "🌿"];
                  const next = icons[(icons.indexOf(adminUser.avatar) + 1) % icons.length];
                  updateAdminProfile({ avatar: next });
                  triggerToast("Avatar updated!");
                }}
              >
                ✏️
              </button>
            </div>
            <h2>{adminUser.name}</h2>
            <span className="profile-role-badge">{adminUser.role}</span>
            <small className="profile-email-text">{adminUser.email}</small>

            <div className="profile-quick-stats">
              <div className="quick-stat-box">
                <strong>428</strong>
                <span>Orders Managed</span>
              </div>
              <div className="quick-stat-box">
                <strong>100%</strong>
                <span>Fulfillment Score</span>
              </div>
            </div>
          </div>

          {/* ACTIVE SESSIONS CARD */}
          <div className="dashboard-side-card">
            <h4>Active Terminals &amp; Sessions</h4>
            <div className="sessions-list">
              <div className="session-row active">
                <span className="device-icon">💻</span>
                <div>
                  <strong>Windows PC (Chrome 128)</strong>
                  <small>Mumbai, India • Current Active Session</small>
                </div>
                <span className="badge-green">Online</span>
              </div>
              <div className="session-row">
                <span className="device-icon">📱</span>
                <div>
                  <strong>iPad Pro 12.9" (Safari)</strong>
                  <small>Greenhouse Studio Terminal</small>
                </div>
                <small>2h ago</small>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT FORMS */}
        <div className="profile-forms-col">
          {/* PERSONAL INFO FORM */}
          <div className="dashboard-table-card">
            <div className="card-top-action-bar">
              <div>
                <h3>Personal &amp; Operational Details</h3>
                <p>Update your administrative contact information</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="admin-form-padding">
              <div className="input-grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="input-grid-2">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Administrative Designation</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="admin-btn-primary">
                Save Profile Changes 🌸
              </button>
            </form>
          </div>

          {/* PASSWORD CHANGE FORM */}
          <div className="dashboard-table-card">
            <div className="card-top-action-bar">
              <div>
                <h3>Change Security Password</h3>
                <p>Ensure your account is protected with strong alphanumeric passwords</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="admin-form-padding">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  required
                />
              </div>

              <div className="input-grid-2">
                <div className="form-group">
                  <label>New Password (min 8 chars)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="admin-btn-secondary">
                Update Password 🔒
              </button>
            </form>
          </div>

          {/* TWO-FACTOR AUTHENTICATION */}
          <div className="dashboard-table-card">
            <div className="two-factor-card">
              <div>
                <h4>Two-Factor Authentication (2FA)</h4>
                <p>Enforce OTP verification via SMS or Authenticator App on all new logins.</p>
              </div>
              <button
                type="button"
                className={`status-pill-toggle ${twoFactor ? "active" : "disabled"}`}
                onClick={() => {
                  setTwoFactor(!twoFactor);
                  triggerToast(twoFactor ? "2FA Disabled" : "2FA Enabled & Protected! 🛡️");
                }}
              >
                {twoFactor ? "✓ 2FA Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
