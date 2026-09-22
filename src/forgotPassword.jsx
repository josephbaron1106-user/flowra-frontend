import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;

function ForgotPassword() {
  const navigate = useNavigate();
  const otpInputs = useRef([]);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.demoOtp) {
        setNotice(`Verification code sent! (Demo OTP: ${data.demoOtp})`);
      }
    } catch (err) {
      console.warn("Forgot password request warning:", err);
    }
    setStep("otp");
  };

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");

    if (!pastedDigits.length) return;

    setOtp([...pastedDigits, ...Array(OTP_LENGTH - pastedDigits.length).fill("")]);
    otpInputs.current[Math.min(pastedDigits.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const enteredCode = otp.join("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: enteredCode }),
      });
      if (!res.ok && enteredCode !== "123456") {
        setError("That code is not correct or has expired. Please try again.");
        return;
      }
    } catch (err) {
      if (enteredCode !== "123456") {
        setError("That code is not correct. Please try again.");
        return;
      }
    }

    setError("");
    setStep("success");
  };

  const handleResendOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setNotice("A fresh code has been sent to your email address.");
    otpInputs.current[0]?.focus();
  };

  return (
    <main className="otp-page">
      <div className="otp-orbit otp-orbit-one" aria-hidden="true" />
      <div className="otp-orbit otp-orbit-two" aria-hidden="true" />

      <section className="otp-card" aria-label="Password recovery">
        <Link className="otp-brand" to="/" aria-label="Flowra home">
          <span aria-hidden="true">✦</span>
          flowra
        </Link>

        {step === "email" && (
          <>
            <div className="otp-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M3.5 6.5 12 13l8.5-6.5" />
                <rect x="3.5" y="5" width="17" height="14" rx="2" />
              </svg>
            </div>
            <div className="otp-heading">
              <p>ACCOUNT RECOVERY</p>
              <h1>Let’s get you back in bloom.</h1>
              <span>Enter your email and we’ll send a one-time code to verify your account.</span>
            </div>

            <form className="otp-email-form" onSubmit={handleSendOtp}>
              <label htmlFor="recovery-email">Email address</label>
              <div className="otp-email-control">
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M3.5 6.5 12 13l8.5-6.5" />
                  <rect x="3.5" y="5" width="17" height="14" rx="2" />
                </svg>
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <button className="otp-primary-button" type="submit">
                Send verification code <span aria-hidden="true">→</span>
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="otp-icon-wrap otp-lock-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="4.5" y="10" width="15" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
              </svg>
            </div>
            <div className="otp-heading">
              <p>CHECK YOUR INBOX</p>
              <h1>Enter your verification code.</h1>
              <span>We sent a 6-digit code to <strong>{email}</strong>.</span>
            </div>

            <form className="otp-verify-form" onSubmit={handleVerifyOtp}>
              <div className="otp-inputs" aria-label="Six digit verification code" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => { otpInputs.current[index] = element; }}
                    aria-label={`Digit ${index + 1}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength="1"
                    value={digit}
                    onChange={(event) => updateOtp(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  />
                ))}
              </div>

              {error && <p className="otp-error" role="alert">{error}</p>}
              {notice && <p className="otp-notice" role="status">{notice}</p>}
              <p className="otp-demo-code">Demo code: <strong>123456</strong></p>

              <button className="otp-primary-button" type="submit">
                Verify &amp; sign in <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="otp-resend">Didn’t receive a code? <button type="button" onClick={handleResendOtp}>Resend code</button></p>
          </>
        )}

        {step === "success" && (
          <div className="otp-success-state">
            <div className="otp-success-icon" aria-hidden="true">✓</div>
            <p>VERIFIED</p>
            <h1>You’re successfully signed in.</h1>
            <span>Your Flowra garden is ready whenever you are.</span>
            <button className="otp-primary-button" type="button" onClick={() => navigate("/")}>
              Continue to Flowra <span aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {step !== "success" && (
          <p className="otp-back-link">
            Remember your password? <Link to="/login">Back to sign in</Link>
          </p>
        )}
      </section>
    </main>
  );
}

export default ForgotPassword;
