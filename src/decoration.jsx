import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import { useCart } from "./CartContext.jsx";

import carouselProtea from "./assets/pictures/carousel_protea.jpg";
import carouselRanunculus from "./assets/pictures/carousel_ranunculus.jpg";
import carouselCalla from "./assets/pictures/carousel_calla.jpg";

function Decoration() {
  const { showToast } = useCart();
  const [eventType, setEventType] = useState("wedding");
  const [venueScale, setVenueScale] = useState("medium");
  const [themeColor, setThemeColor] = useState("blush");
  const [inquirySent, setInquirySent] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    notes: "",
  });

  const packages = [
    {
      title: "Grand Wedding & Reception",
      tagline: "Dream Mandaps, Aisle Runners & Archways",
      image: carouselRanunculus,
      startingPrice: "₹45,000",
      features: [
        "Full floral mandap / stage backdrop",
        "Entrance flower arch with fairy lights",
        "Centerpieces for 15+ banquet tables",
        "Complimentary bridal and groom garlands",
        "Dedicated on-site floral styling crew",
      ],
    },
    {
      title: "Luxury Galas & Corporate Dinners",
      tagline: "Architectural Botanicals & Sophisticated Ambience",
      image: carouselProtea,
      startingPrice: "₹28,000",
      features: [
        "Dramatic statement pedestal arrangements",
        "Minimalist Ikebana-inspired table displays",
        "Brand theme color-matched exotic florals",
        "VIP lounge botanical installations",
        "Pre-event concept 3D rendering preview",
      ],
    },
    {
      title: "Intimate Parties & Celebrations",
      tagline: "Birthdays, Anniversaries & Baby Showers",
      image: carouselCalla,
      startingPrice: "₹14,500",
      features: [
        "Custom photo-booth floral backdrop wall",
        "Dessert and cake table garlands",
        "5 signature artisanal table vases",
        "Delicate hanging ceiling floral orbs",
        "Setup and same-day cleanup included",
      ],
    },
  ];

  // Dynamic estimate calculation
  const getEstimatedPrice = () => {
    let base = 15000;
    if (eventType === "wedding") base = 50000;
    if (eventType === "corporate") base = 35000;
    if (eventType === "birthday") base = 18000;

    let multiplier = 1;
    if (venueScale === "large") multiplier = 1.8;
    if (venueScale === "intimate") multiplier = 0.7;

    const min = Math.round(base * multiplier);
    const max = Math.round(min * 1.35);
    return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}`;
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:8080/api/decorations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: inquiryForm.name,
          clientEmail: inquiryForm.email || `${inquiryForm.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          clientPhone: inquiryForm.phone,
          eventType: eventType,
          venueScale: venueScale,
          themeColor: themeColor,
          eventDate: inquiryForm.eventDate,
          notes: inquiryForm.notes,
        }),
      });
    } catch (err) {
      console.warn("Decoration inquiry save warning:", err);
    }
    setInquirySent(true);
    showToast("Decoration consultation requested! We will call you within 2 hours. 🌸");
  };

  return (
    <div className="decoration-page-container">
      <Navbar />
      <CartDrawer />
      <Toast />

      {/* HERO BANNER */}
      <section className="decor-hero">
        <div className="decor-hero-overlay">
          <span className="decor-badge">🌸 BESPOKE FLORAL ARCHITECTURE</span>
          <h1>Transform Your Special Moments into Living Art</h1>
          <p>
            From fairytale weddings to high-fashion corporate galas, our team of floral sculptors craft unforgettable sensory environments.
          </p>
          <a href="#estimator" className="decor-cta-btn">
            Calculate Instant Estimate ↓
          </a>
        </div>
      </section>

      {/* PACKAGES SECTION */}
      <section className="decor-packages-section">
        <div className="section-header-centered">
          <span className="subhead">SIGNATURE SERVICES</span>
          <h2>Tailored Floral Styling Experiences</h2>
          <p>Carefully designed themes tailored to your venue size, lighting, and guest count.</p>
        </div>

        <div className="packages-grid">
          {packages.map((pkg, idx) => (
            <div className="package-card" key={idx}>
              <div className="package-img-box">
                <img src={pkg.image} alt={pkg.title} />
                <span className="starting-tag">From {pkg.startingPrice}</span>
              </div>
              <div className="package-body">
                <h3>{pkg.title}</h3>
                <p className="pkg-tagline">{pkg.tagline}</p>
                <ul className="pkg-features">
                  {pkg.features.map((feat, fidx) => (
                    <li key={fidx}>
                      <span className="check-icon">✓</span> {feat}
                    </li>
                  ))}
                </ul>
                <a href="#inquiry" className="book-pkg-btn">
                  Inquire For This Package →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE ESTIMATOR & INQUIRY */}
      <section className="decor-estimator-section" id="estimator">
        <div className="estimator-card">
          <div className="estimator-left">
            <span className="gold-subhead">INSTANT QUOTE ESTIMATOR</span>
            <h2>Get an Estimate for Your Venue</h2>
            <p>Customize your event specifics to see a real-time price bracket.</p>

            <div className="estimator-controls">
              <div className="est-group">
                <label>Event Type</label>
                <div className="est-pill-row">
                  <button
                    type="button"
                    className={`est-pill ${eventType === "wedding" ? "active" : ""}`}
                    onClick={() => setEventType("wedding")}
                  >
                    💍 Wedding / Sangeet
                  </button>
                  <button
                    type="button"
                    className={`est-pill ${eventType === "corporate" ? "active" : ""}`}
                    onClick={() => setEventType("corporate")}
                  >
                    🏢 Corporate Gala
                  </button>
                  <button
                    type="button"
                    className={`est-pill ${eventType === "birthday" ? "active" : ""}`}
                    onClick={() => setEventType("birthday")}
                  >
                    🎂 Birthday / Baby Shower
                  </button>
                </div>
              </div>

              <div className="est-group">
                <label>Venue Scale & Guest Count</label>
                <div className="est-pill-row">
                  <button
                    type="button"
                    className={`est-pill ${venueScale === "intimate" ? "active" : ""}`}
                    onClick={() => setVenueScale("intimate")}
                  >
                    Intimate (&lt; 50 guests)
                  </button>
                  <button
                    type="button"
                    className={`est-pill ${venueScale === "medium" ? "active" : ""}`}
                    onClick={() => setVenueScale("medium")}
                  >
                    Medium (50 - 200 guests)
                  </button>
                  <button
                    type="button"
                    className={`est-pill ${venueScale === "large" ? "active" : ""}`}
                    onClick={() => setVenueScale("large")}
                  >
                    Grand Ballroom (200+ guests)
                  </button>
                </div>
              </div>

              <div className="est-group">
                <label>Color Palette Mood</label>
                <div className="est-pill-row">
                  <button
                    type="button"
                    className={`est-pill ${themeColor === "blush" ? "active" : ""}`}
                    onClick={() => setThemeColor("blush")}
                  >
                    🌸 Blush Pastel & Ivory
                  </button>
                  <button
                    type="button"
                    className={`est-pill ${themeColor === "royal" ? "active" : ""}`}
                    onClick={() => setThemeColor("royal")}
                  >
                    👑 Royal Gold & Crimson
                  </button>
                  <button
                    type="button"
                    className={`est-pill ${themeColor === "moody" ? "active" : ""}`}
                    onClick={() => setThemeColor("moody")}
                  >
                    🌙 Moody Velvet Obsidian
                  </button>
                </div>
              </div>
            </div>

            <div className="estimate-result-box">
              <span>Estimated Budget Range:</span>
              <div className="est-amount">{getEstimatedPrice()}</div>
              <small>*Includes fresh florals, transport, setup crew, and post-event cleanup.</small>
            </div>
          </div>

          {/* INQUIRY FORM */}
          <div className="estimator-right" id="inquiry">
            {inquirySent ? (
              <div className="inquiry-success-box">
                <div className="success-icon-badge">✓</div>
                <h3>Consultation Booked!</h3>
                <p>
                  Thank you, <strong>{inquiryForm.name}</strong>. Our senior floral stylist will reach out at{" "}
                  <strong>{inquiryForm.phone}</strong> with a detailed visual mood board and quote.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setInquirySent(false)}
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="decor-inquiry-form">
                <h3>Book Free Stylist Consultation</h3>
                <p>Lock in your date and get a bespoke 3D layout plan.</p>

                <div className="form-group">
                  <label htmlFor="dec-name">Full Name *</label>
                  <input
                    id="dec-name"
                    type="text"
                    placeholder="Your Name"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dec-phone">Phone Number *</label>
                  <input
                    id="dec-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dec-date">Event Date *</label>
                  <input
                    id="dec-date"
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={inquiryForm.eventDate}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, eventDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dec-notes">Venue & Specific Vision</label>
                  <textarea
                    id="dec-notes"
                    rows="3"
                    placeholder="Tell us about your venue name, city, favorite flowers, or inspiration..."
                    value={inquiryForm.notes}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                  />
                </div>

                <button type="submit" className="decor-submit-btn">
                  Request Free Mood Board & Quote →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Decoration;
