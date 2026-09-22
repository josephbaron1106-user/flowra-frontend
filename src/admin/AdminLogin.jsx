import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext.jsx";
import carouselRanunculus from "../assets/pictures/carousel_ranunculus.jpg";

function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  const [email, setEmail] = useState("admin@flowra.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(email, password);
      setIsLoading(false);
      if (res.success) {
        navigate("/admin/dashboard");
      } else {
        setErrorMessage(res.error);
      }
    }, 700);
  };

  const handleFillDemo = () => {
    setEmail("admin@flowra.com");
    setPassword("admin123");
    setErrorMessage("");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-orb orb-1" aria-hidden="true" />
      <div className="admin-login-orb orb-2" aria-hidden="true" />

      <div className="admin-login-shell">
        {/* LEFT SHOWCASE */}
        <div className="admin-login-showcase">
          <img src={carouselRanunculus} alt="Luxury Roses & Flowers" />
          <div className="admin-showcase-overlay" />
          <div className="admin-showcase-content">
            <div className="admin-badge-pill">🌸 BLOOMBAY • FLOWRA MANAGEMENT</div>
            <h2>Artisan Florist Management Portal</h2>
            <p>
              Monitor store operations, track real-time deliveries, manage inventories, and delight flower lovers around the clock.
            </p>
            <div className="admin-security-note">
              <span>🔒 256-Bit SSL Encrypted Admin Gateway</span>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="admin-login-form-container">
          <div className="admin-brand-header">
            <Link to="/" className="admin-logo-link">
              🌸 <span>FLOWRA</span> <small className="portal-sub">ADMIN</small>
            </Link>
            <span className="admin-subtitle">BloomBay Florist Executive Suite</span>
          </div>

          <div className="admin-form-intro">
            <h1>Admin Sign In</h1>
            <p>Enter your credentials to access the floral management dashboard.</p>
          </div>

          {errorMessage && (
            <div className="admin-error-banner" role="alert">
              <span>⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form-stack">
            <div className="admin-field-group">
              <label htmlFor="admin-email">Email or Admin ID</label>
              <div className="admin-input-wrap">
                <span className="input-icon">👤</span>
                <input
                  id="admin-email"
                  type="text"
                  placeholder="admin@flowra.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-field-group">
              <div className="label-row-admin">
                <label htmlFor="admin-password">Password</label>
                <button
                  type="button"
                  className="quick-demo-btn"
                  onClick={handleFillDemo}
                >
                  ⚡ Autofill Demo
                </button>
              </div>
              <div className="admin-input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="admin-remember-row">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this terminal</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Admin password reset link sent to registered phone/email."); }} className="forgot-admin-link">
                Forgot access?
              </a>
            </div>

            <button
              type="submit"
              className={`admin-submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="admin-spinner">Verifying Credentials...</span>
              ) : (
                <>Access Admin Dashboard →</>
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <Link to="/" className="back-storefront-link">
              ← Return to Customer Storefront
            </Link>
            <small>BloomBay Flowra OS v3.4.0 • Enterprise Edition</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
