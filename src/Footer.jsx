import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "./CartContext.jsx";

function Footer() {
  const [email, setEmail] = useState("");
  const { showToast } = useCart();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        await fetch("https://flowra-backend-1.onrender.com/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.warn("Newsletter subscribe warning:", err);
      }
      showToast("Thank you for subscribing to Flowra newsletters! 💌");
      setEmail("");
    }
  };

  return (
    <footer className="flowra-footer">
      <div className="footer-top-grid">
        <div className="footer-brand-col">
          <div className="footer-logo">🌸 FLOWRA</div>
          <p className="footer-tagline">
            Cultivating joy through nature’s most exquisite expressions. Handcrafted floral arrangements, sustainably sourced and delivered with care.
          </p>
          <div className="footer-socials">
            <span className="social-icon" title="Instagram">📸</span>
            <span className="social-icon" title="Pinterest">📌</span>
            <span className="social-icon" title="Facebook">📘</span>
            <span className="social-icon" title="WhatsApp">💬</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/">Fresh Flowers</Link>
          <Link to="/bouquets">Artisan Bouquets</Link>
          <Link to="/decoration">Floral Styling & Events</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">Our Story</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/about#sustainability">Eco Sourcing</Link>
          <Link to="/contact#faq">Floral Care FAQs</Link>
          <Link to="/admin/login" className="admin-footer-link">🔒 Staff & Admin Portal</Link>
        </div>

        <div className="footer-col footer-newsletter">
          <h4>Join The Garden Club</h4>
          <p>Subscribe for seasonal bloom previews, exclusive discounts, and floral styling tips.</p>
          <form onSubmit={handleSubscribe} className="footer-newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Join →</button>
          </form>
          <small className="footer-promise">🌸 100% Freshness Guaranteed • No spam ever</small>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>© {new Date().getFullYear()} FLOWRA Artisanal Florists. All Rights Reserved.</p>
        <div className="footer-legal">
          <Link to="/about">Privacy Policy</Link>
          <span>•</span>
          <Link to="/about">Terms of Service</Link>
          <span>•</span>
          <Link to="/contact">Help & Support</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
