import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";

function LoginModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, handleAuthSuccess } = useCart();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("https://flowra-backend-1.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 || (data.message && data.message.includes("No account found"))) {
          setErrorMessage("No account found with this email. Please create an account first.");
        } else if (response.status === 400) {
          setErrorMessage(data.message || "Incorrect password. Please try again.");
        } else {
          setErrorMessage(data.message || "Sign in failed. Please verify your credentials.");
        }
        setIsLoading(false);
        return;
      }

      // Valid account: save user, notify window & resume pending purchase action
      localStorage.setItem("flowra_user", JSON.stringify(data));
      window.dispatchEvent(new Event("storage"));
      setIsLoading(false);
      handleAuthSuccess(data);
    } catch (err) {
      console.error("LoginModal error:", err);
      setErrorMessage("Unable to connect to Flowra server. Please verify the backend service is running.");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage("");
  };

  const handleCreateAccountClick = () => {
    handleClose();
    navigate("/create-account");
  };

  return (
    <div className="login-modal-backdrop" onClick={handleClose}>
      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button
          className="login-modal-close-btn"
          onClick={handleClose}
          type="button"
          aria-label="Close Login Modal"
        >
          ✕
        </button>

        {/* BRAND HEADER */}
        <div className="login-modal-header">
          <div className="login-modal-icon-badge">🌸</div>
          <h2>Sign In to Buy</h2>
          <p className="login-modal-subtext">
            Please log in to your Flowra account to proceed with your selected floral blooms &amp; checkout.
          </p>
        </div>

        {/* ERROR FEEDBACK */}
        {errorMessage && (
          <div className="login-modal-error-banner">
            <span>⚠️</span>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* LOGIN FORM */}
        <form className="login-modal-form" onSubmit={handleSubmit}>
          <div className="login-modal-field">
            <label htmlFor="modal-email">Email Address</label>
            <input
              id="modal-email"
              type="email"
              required
              placeholder="e.g. eleanor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="login-modal-field">
            <div className="modal-field-label-row">
              <label htmlFor="modal-password">Password</label>
              <Link
                to="/forgot-password"
                className="modal-forgot-link"
                onClick={handleClose}
              >
                Forgot password?
              </Link>
            </div>
            <div className="modal-input-password-wrap">
              <input
                id="modal-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="modal-pw-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-modal-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Sign In & Proceed to Buy →"}
          </button>
        </form>

        {/* FOOTER CALLOUT */}
        <div className="login-modal-footer">
          <p>
            Don't have an account yet?{" "}
            <button
              type="button"
              className="modal-switch-auth-btn"
              onClick={handleCreateAccountClick}
            >
              Create Account 🌸
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
