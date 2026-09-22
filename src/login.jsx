import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import flowers3 from "./assets/pictures/flowers3.jpg";


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGooglePortalOpen, setIsGooglePortalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsNewUser(false);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 || (data.message && data.message.includes("No account found"))) {
          // Unregistered user: restrict access and guide to registration
          setIsNewUser(true);
          setErrorMessage("No account found with this email. Please create an account first.");
        } else if (response.status === 400) {
          setErrorMessage(data.message || "Incorrect password. Please try again.");
        } else {
          setErrorMessage(data.message || "Sign in failed. Please check your credentials.");
        }
        setIsLoading(false);
        return;
      }

      // Valid account & credentials: store session and proceed
      localStorage.setItem("flowra_user", JSON.stringify(data));
      setIsLoading(false);
      navigate("/");
    } catch (err) {
      console.error("Login request error:", err);
      setErrorMessage("Unable to connect to the Flowra server. Please ensure the backend server is running on port 8080.");
      setIsLoading(false);
    }
  };

  const handleGoogleAccountSelect = () => {
    setIsGooglePortalOpen(false);
    navigate("/");
  };

  return (
    <main className="login-page">
      <div className="login-orb login-orb-one" aria-hidden="true" />
      <div className="login-orb login-orb-two" aria-hidden="true" />

      <section className="login-shell" aria-label="Sign in to Flowra">
        <aside className="login-showcase">
          <img src={flowers3} alt="Pink flowers in bloom" />
          <div className="showcase-shade" />

          <Link className="showcase-brand" to="/" aria-label="Flowra home">
            <span className="brand-mark" aria-hidden="true">✦</span>
            flowra
          </Link>

          <div className="showcase-copy">
            <p className="showcase-eyebrow">FRESHLY CURATED</p>
            <h1>Flowers that make every moment bloom.</h1>
            <p>
              Discover handpicked blooms and thoughtful arrangements for the
              people you love.
            </p>
          </div>

          <div className="showcase-note">
            <span className="note-star" aria-hidden="true">★</span>
            <span>Beautiful moments, delivered fresh.</span>
          </div>
        </aside>

        <section className="login-panel">
          <Link className="mobile-brand" to="/" aria-label="Flowra home">
            <span className="brand-mark" aria-hidden="true">✦</span>
            flowra
          </Link>

          <div className="login-heading">
            <p className="welcome-label">WELCOME BACK</p>
            <h2>Sign in to your garden.</h2>
            <p>Enter your details to keep your favourite blooms close.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <div className="field-control">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M3.5 6.5 12 13l8.5-6.5" />
                  <rect x="3.5" y="5" width="17" height="14" rx="2" />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage("");
                    if (isNewUser) setIsNewUser(false);
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <div className="field-control">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <rect x="4.5" y="10" width="15" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                    if (isNewUser) setIsNewUser(false);
                  }}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="remember-me">
              <input name="remember" type="checkbox" />
              <span className="custom-check" aria-hidden="true" />
              Remember me 
            </label>

            {isNewUser ? (
              <div className="login-newuser-alert" role="alert">
                <div className="login-newuser-header">
                  <span className="login-newuser-icon" aria-hidden="true">⚠️</span>
                  <strong>Account Not Found</strong>
                </div>
                <p>
                  No Flowra account was found for <strong>{email}</strong>. Please create an account before signing in.
                </p>
                <Link
                  to={`/create-account?email=${encodeURIComponent(email)}`}
                  className="login-register-redirect-btn"
                >
                  Create your Flowra account →
                </Link>
              </div>
            ) : errorMessage ? (
              <div className="login-error-alert" role="alert">
                <span aria-hidden="true">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <button className="signin-button" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : <>Sign in <span aria-hidden="true">→</span></>}
            </button>
          </form>

          <div className="divider"><span>or continue with</span></div>

          <button
            className="google-button"
            type="button"
            onClick={() => setIsGooglePortalOpen(true)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4a4.6 4.6 0 0 1-2 3v2.4h3.2c1.9-1.8 3-4.4 3-7.1Z" />
              <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.7l-3.2-2.4c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1H3.1v2.5A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.4 13.7a6 6 0 0 1 0-3.4V7.8H3.1a10 10 0 0 0 0 8.9l3.3-3Z" />
              <path fill="#EA4335" d="M12 6.2c1.5 0 2.9.5 3.9 1.5l2.9-2.9C17 3.1 14.7 2 12 2a10 10 0 0 0-8.9 5.8l3.3 2.5c.8-2.4 3-4.1 5.6-4.1Z" />
            </svg>
            Continue with Google
          </button>

          <p className="create-account">
            New to Flowra? <Link to="/create-account">Create an account</Link>
          </p>

          <div className="admin-access-bridge">
            <div className="admin-bridge-divider"><span>FLOWRA STAFF</span></div>
            <Link to="/admin/login" className="admin-portal-link-btn" title="Access Flowra Admin Portal">
              <span className="admin-lock-icon">🔒</span>
              <span>Admin Management Portal</span>
              <span className="admin-arrow">→</span>
            </Link>
          </div>
        </section>
      </section>

      {isGooglePortalOpen && (
        <div className="google-portal-backdrop" role="presentation">
          <button
            className="google-portal-scrim"
            type="button"
            aria-label="Close Google account chooser"
            onClick={() => setIsGooglePortalOpen(false)}
          />

          <section
            className="google-portal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="google-portal-title"
            aria-describedby="google-portal-description"
          >
            <button
              className="google-portal-close"
              type="button"
              aria-label="Close"
              onClick={() => setIsGooglePortalOpen(false)}
            >
              ×
            </button>

            <div className="google-portal-logo" aria-label="Google">
              <span className="google-letter-blue">G</span>
              <span className="google-letter-red">o</span>
              <span className="google-letter-yellow">o</span>
              <span className="google-letter-blue">g</span>
              <span className="google-letter-green">l</span>
              <span className="google-letter-red">e</span>
            </div>

            <h2 id="google-portal-title">Choose an account</h2>
            <p id="google-portal-description">to continue to <strong>Flowra</strong></p>

            <div className="google-account-list">
              <button className="google-account-option" type="button" onClick={handleGoogleAccountSelect}>
                <span className="google-avatar avatar-rose" aria-hidden="true">A</span>
                <span className="google-account-copy">
                  <strong>Alex Bloom</strong>
                  <small>alex.bloom@example.com</small>
                </span>
              </button>

              <button className="google-account-option" type="button" onClick={handleGoogleAccountSelect}>
                <span className="google-avatar avatar-lilac" aria-hidden="true">S</span>
                <span className="google-account-copy">
                  <strong>Sam Florist</strong>
                  <small>sam.florist@example.com</small>
                </span>
              </button>

              <button className="google-account-option google-add-account" type="button">
                <span className="google-add-icon" aria-hidden="true">+</span>
                <span className="google-account-copy">
                  <strong>Use another account</strong>
                </span>
              </button>
            </div>

            <p className="google-portal-note">
              Demo account chooser — connect Google OAuth to use real accounts.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}

export default Login;
