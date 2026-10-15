import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import { useCart } from "./CartContext.jsx";

function Contact() {
  const { showToast } = useCart();
  const [openFaq, setOpenFaq] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  const faqs = [
    {
      q: "How does same-day flower delivery work?",
      a: "Orders placed before 4:00 PM are hand-arranged and delivered on the same day in our temperature-controlled vans. For early morning or midnight surprises, simply choose your slot during checkout!",
    },
    {
      q: "How long will my Flowra bouquet stay fresh?",
      a: "Because we source directly from morning harvest, our bouquets typically stay fresh and vibrant for 7 to 12 days when you change water every two days and add our complimentary flower nutrient food.",
    },
    {
      q: "Can I request custom flower combinations or specific colors?",
      a: "Absolutely! You can reach out directly via our contact form or WhatsApp with your inspiration photos, and our master florists will craft a bespoke arrangement just for your occasion.",
    },
    {
      q: "Do you cater for large wedding stages and corporate events?",
      a: "Yes! Check our Decoration page to explore our event styling packages, calculate instant price brackets, and book a free 3D design consultation with our lead floral architects.",
    },
    {
      q: "What is your replacement / freshness guarantee policy?",
      a: "If your flowers arrive damaged or do not meet our high freshness standards, send us a photo within 24 hours of delivery and we will promptly send a fresh replacement bouquet free of charge!",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("https://flowra-backend-1.onrender.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (err) {
      console.warn("Contact save warning:", err);
    }
    setSubmitted(true);
    showToast("Message sent! Our floral concierge will reply within 1 hour. 💌");
  };

  return (
    <div className="contact-page-container">
      <Navbar />
      <CartDrawer />
      <Toast />

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-eyebrow">FLORAL CONCIERGE & SUPPORT</span>
          <h1>We’d Love to Hear From You</h1>
          <p>
            Whether you need custom styling advice, help with a scheduled delivery, or wish to collaborate, our botanical team is here for you.
          </p>
        </div>
      </section>

      {/* CONTACT CHANNELS */}
      <section className="contact-cards-section">
        <div className="contact-info-grid">
          <div className="contact-card">
            <div className="contact-icon-bubble">📍</div>
            <h3>Visit Our Studio</h3>
            <p>12 Orchid Avenue, Blossom Quarter</p>
            <span>Mumbai, MH 400050</span>
            <small>Open Daily: 8:00 AM - 9:30 PM</small>
          </div>

          <div className="contact-card">
            <div className="contact-icon-bubble">💬</div>
            <h3>Call / WhatsApp Concierge</h3>
            <p>Direct styling & quick orders</p>
            <strong>+91 (022) 8921-BLOOM</strong>
            <small>Instant WhatsApp Support 24/7</small>
          </div>

          <div className="contact-card">
            <div className="contact-icon-bubble">✉️</div>
            <h3>Email Support</h3>
            <p>For custom events & partnerships</p>
            <strong>concierge@flowra.com</strong>
            <small>Avg response time: &lt; 30 mins</small>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FORM & MAP/INFO */}
      <section className="contact-form-section">
        <div className="contact-form-layout">
          <div className="contact-form-left">
            <span className="gold-subhead">SEND A NOTE</span>
            <h2>Get in Touch with Our Master Florists</h2>
            <p>Fill out the form below and we will get back to you promptly.</p>

            {submitted ? (
              <div className="contact-success-state">
                <div className="success-icon-badge">✓</div>
                <h3>Message Received!</h3>
                <p>
                  Thank you, <strong>{form.name}</strong>. We have received your note regarding{" "}
                  <strong>{form.subject}</strong> and will respond to <strong>{form.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "General Inquiry", message: "" });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-box">
                <div className="input-grid-2">
                  <div className="form-group">
                    <label htmlFor="cnt-name">Your Full Name *</label>
                    <input
                      id="cnt-name"
                      type="text"
                      placeholder="e.g. Maya Lin"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cnt-email">Email Address *</label>
                    <input
                      id="cnt-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cnt-subject">Topic / Purpose</label>
                  <select
                    id="cnt-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order & Delivery Tracking">Order &amp; Delivery Tracking</option>
                    <option value="Custom Bouquet Request">Custom Bouquet Request</option>
                    <option value="Event / Wedding Decoration">Event / Wedding Decoration</option>
                    <option value="Corporate Floral Subscription">Corporate Floral Subscription</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cnt-message">Your Message *</label>
                  <textarea
                    id="cnt-message"
                    rows="4"
                    placeholder="Tell us what you have in mind..."
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="contact-submit-btn">
                  Send Message 🌸
                </button>
              </form>
            )}
          </div>

          {/* STUDIO HOURS & AMENITIES */}
          <div className="contact-studio-card">
            <h3>Flowra Flagship Studio</h3>
            <p>Step inside our glasshouse boutique for fresh morning stems, bespoke vase pairings, and coffee.</p>

            <div className="studio-schedule">
              <div className="sched-row">
                <span>Monday – Friday</span>
                <strong>8:00 AM – 9:30 PM</strong>
              </div>
              <div className="sched-row">
                <span>Saturday – Sunday</span>
                <strong>7:30 AM – 10:00 PM</strong>
              </div>
              <div className="sched-row">
                <span>Holiday Hours</span>
                <strong>Open with Special Deliveries</strong>
              </div>
            </div>

            <div className="studio-perks">
              <div className="perk-item">
                <span>☕</span>
                <small>Complimentary Botanical Tea for in-store visitors</small>
              </div>
              <div className="perk-item">
                <span>💐</span>
                <small>Live Bloom Arranging Bar with our Florists</small>
              </div>
              <div className="perk-item">
                <span>🚗</span>
                <small>Free Valet &amp; Curbside Pickup available</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section className="contact-faq-section" id="faq">
        <div className="section-header-centered">
          <span className="subhead">FREQUENTLY ASKED QUESTIONS</span>
          <h2>Everything You Need to Know</h2>
          <p>Quick answers on ordering, delivery speed, and bloom care.</p>
        </div>

        <div className="faq-accordion">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className={`faq-item ${isOpen ? "open" : ""}`}
                onClick={() => setOpenFaq(isOpen ? -1 : index)}
              >
                <div className="faq-question">
                  <h4>{faq.q}</h4>
                  <span className="faq-toggle-icon">{isOpen ? "−" : "+"}</span>
                </div>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;
