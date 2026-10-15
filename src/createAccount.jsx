import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import flowers1 from "./assets/pictures/flowers1.jpg";

function CreateAccount() {
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location.search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormMessage("");

    if (password !== confirmPassword) {
      setFormMessage("Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 8) {
      setFormMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://flowra-backend-1.onrender.com/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      let data = {};
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 400 && data.message && data.message.includes("already exists")) {
          setFormMessage("An account with this email already exists. Please sign in instead.");
        } else {
          setFormMessage(data.message || `Failed to create account (${response.status}). Please check your information.`);
        }
        setIsLoading(false);
        return;
      }

      // Account created in MySQL
      localStorage.setItem("flowra_user", JSON.stringify(data));
      setIsSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      console.error("Account creation request error:", err);
      setFormMessage("Connection to Flowra server failed. If the backend is waking up from idle, please wait 15-20 seconds and try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-petal signup-petal-one" aria-hidden="true" />
      <div className="signup-petal signup-petal-two" aria-hidden="true" />

      <section className="signup-shell" aria-label="Create a Flowra account">
        <section className="signup-form-panel">
          <Link className="signup-brand" to="/" aria-label="Flowra home">
            <span className="signup-brand-mark" aria-hidden="true">✦</span>
            flowra
          </Link>

          <div className="signup-heading">
            <p>START YOUR FLOWER STORY</p>
            <h1>Make every moment bloom.</h1>
            <span>Create an account and save the flowers you love.</span>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-field">
              <label htmlFor="full-name">Full name</label>
              <div className="signup-control">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3.4" />
                  <path d="M5 20c.8-3.4 3.2-5.2 7-5.2s6.2 1.8 7 5.2" />
                </svg>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">Email address</label>
              <div className="signup-control">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M3.5 6.5 12 13l8.5-6.5" />
                  <rect x="3.5" y="5" width="17" height="14" rx="2" />
                </svg>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="signup-field">
              <div className="signup-label-row">
                <label htmlFor="signup-password">Create password</label>
                <span>8+ characters</span>
              </div>
              <div className="signup-control">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <rect x="4.5" y="10" width="15" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
                </svg>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                  minLength="8"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button className="signup-password-toggle" type="button" onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="confirm-password">Confirm password</label>
              <div className="signup-control">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m7.5 12 3 3 6-6" />
                  <circle cx="12" cy="12" r="8" />
                </svg>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <label className="signup-terms">
              <input name="terms" type="checkbox" required />
              <span className="signup-check" aria-hidden="true" />
              I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
            </label>

            {isSuccess && (
              <p className="signup-success" role="alert" style={{ color: "#2e7d32", fontWeight: 600, fontSize: "12px", margin: "2px 0 0" }}>
                ✓ Account created successfully! Redirecting you to garden...
              </p>
            )}

            {formMessage && <p className="signup-error" role="alert">{formMessage}</p>}

            <button className="signup-submit" type="submit" disabled={isLoading || isSuccess}>
              {isLoading ? "Creating account..." : isSuccess ? "Welcome to Flowra 🌸" : <>Create account <span aria-hidden="true">→</span></>}
            </button>
          </form>

          <p className="signup-login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>

        <aside className="signup-showcase">
          <img src={flowers1} alt="White flower bouquet" />
          <div className="signup-overlay" />
          <div className="signup-quote">
            <span aria-hidden="true">“</span>
            <p>Give beauty a place in your everyday.</p>
            <small>FLOWRA COLLECTION</small>
          </div>
          <div className="signup-bloom" aria-hidden="true">✿</div>
        </aside>
      </section>
    </main>
  );
}

export default CreateAccount;
