import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import { Link } from "react-router-dom";

import carouselRanunculus from "./assets/pictures/carousel_ranunculus.jpg";

function About() {
  return (
    <div className="about-page-container">
      <Navbar />
      <CartDrawer />
      <Toast />

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-eyebrow">OUR STORY & PHILOSOPHY</span>
          <h1>Bringing Nature’s Poetry into Every Home</h1>
          <p>
            Flowra was founded on a simple, timeless belief: flowers aren’t just decorations — they are emotional messengers that elevate human connection.
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="about-story-section">
        <div className="story-grid">
          <div className="story-image-wrap">
            <img src={carouselRanunculus} alt="Florist arranging fresh roses and ranunculus" />
            <div className="story-image-accent">
              <span>EST. 2026</span>
            </div>
          </div>
          <div className="story-text-content">
            <span className="gold-subhead">THE FLOWRA JOURNEY</span>
            <h2>From Morning Harvest to Midnight Celebrations</h2>
            <p>
              What began as a boutique greenhouse workshop in 2024 has grown into a premier artisan floristry brand. We partner directly with sustainable alpine growers and local floriculturists who cultivate blooms without harsh chemical pesticides.
            </p>
            <p>
              Every stem chosen for a Flowra arrangement is hand-inspected at dawn for color vibrance, petal resilience, and stem longevity. Our floral artists then compose each piece with balance, scent harmony, and texture depth.
            </p>
            <div className="story-stats">
              <div className="stat-card">
                <h3>50,000+</h3>
                <p>Happy Bouquets Delivered</p>
              </div>
              <div className="stat-card">
                <h3>100%</h3>
                <p>Compostable Eco-Wraps</p>
              </div>
              <div className="stat-card">
                <h3>7-Day</h3>
                <p>Vase Freshness Life</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES / PROMISE */}
      <section className="about-values-section" id="sustainability">
        <div className="section-header-centered">
          <span className="subhead">OUR COMMITMENT</span>
          <h2>The Four Pillars of Flowra</h2>
          <p>Our promise to our customers, our growers, and the earth.</p>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <span className="val-icon">🌱</span>
            <h3>Direct Farm-to-Vase</h3>
            <p>
              We bypass traditional wholesale middlemen so your blooms reach your doorstep within 24 hours of harvest, staying vibrant for over a week.
            </p>
          </div>

          <div className="value-card">
            <span className="val-icon">♻️</span>
            <h3>100% Zero-Plastic Packing</h3>
            <p>
              All our wrapping papers are manufactured from recycled FSC-certified post-consumer fibers and natural vegetable-based dyes.
            </p>
          </div>

          <div className="value-card">
            <span className="val-icon">🎨</span>
            <h3>Master Certified Florists</h3>
            <p>
              Each bouquet is arranged by European and Ikebana-trained floral stylists who treat floral arranging as a fine art discipline.
            </p>
          </div>

          <div className="value-card">
            <span className="val-icon">💧</span>
            <h3>Ethical Water Stewardship</h3>
            <p>
              Our grower network uses closed-loop hydroponic and drip micro-irrigation systems to minimize water waste by over 60%.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="about-cta-banner">
        <div className="about-cta-card">
          <h2>Ready to Fill Your Life with Blooms?</h2>
          <p>Explore our seasonal catalog or consult our florists for bespoke styling.</p>
          <div className="about-cta-buttons">
            <Link to="/" className="btn-primary">
              Shop Fresh Flowers 🌸
            </Link>
            <Link to="/contact" className="btn-secondary">
              Get in Touch 💬
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;
