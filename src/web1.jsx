import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";

import flowers1 from "./assets/pictures/flowers1.jpg";
import flowers2 from "./assets/pictures/flowers2.jpg";
import flowers3 from "./assets/pictures/flowers3.jpg";
import flower4 from "./assets/pictures/flower4.jpg";
import flowers5 from "./assets/pictures/flowers5.jpeg";

import carouselRanunculus from "./assets/pictures/carousel_ranunculus.jpg";
import carouselProtea from "./assets/pictures/carousel_protea.jpg";
import carouselCalla from "./assets/pictures/carousel_calla.jpg";

import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import Props from "./props.jsx";
import { useCart } from "./CartContext.jsx";

const heroImages = [
  {
    image: carouselRanunculus,
    title: "Silk Ranunculus & Garden Roses",
    subtitle: "Handcrafted artisan bouquets for life's most precious moments",
    focusDesktop: "center 45%",
    focusMobile: "center 40%",
    tag: "✨ LUXURY SIGNATURE HARVEST",
    cta: "Explore Collection →",
  },
  {
    image: carouselProtea,
    title: "Exotic King Protea & Orchids",
    subtitle: "Rare botanical wonders & luxury architectural centerpieces",
    focusDesktop: "center 45%",
    focusMobile: "center 45%",
    tag: "🌿 RARE BOTANICAL ARTISTRY",
    cta: "View Exotic Florals →",
  },
  {
    image: carouselCalla,
    title: "Midnight Velvet Calla Lilies",
    subtitle: "Bold, dramatic compositions crafted with refined elegance",
    focusDesktop: "center 42%",
    focusMobile: "center 40%",
    tag: "🌙 EDITORIAL MOODY COLLECTION",
    cta: "Discover Dramatic Blooms →",
  },
];

const flowerList = [
  {
    id: 1,
    image: flowers1,
    alter: "Rose",
    name: "Premium Red Rose",
    price: "₹50",
    oldPrice: "₹70",
    category: "Rose",
    popularity: 98,
    rawPrice: 50,
  },
  {
    id: 2,
    image: flowers2,
    alter: "Jasmine",
    name: "Fresh Jasmine Posy",
    price: "₹45",
    oldPrice: "₹65",
    category: "Jasmine",
    popularity: 92,
    rawPrice: 45,
  },
  {
    id: 3,
    image: flowers3,
    alter: "Tulip",
    name: "Elegant Holland Tulip",
    price: "₹70",
    oldPrice: "₹90",
    category: "Tulip",
    popularity: 95,
    rawPrice: 70,
  },
  {
    id: 4,
    image: flower4,
    alter: "Hibiscus",
    name: "Crimson Red Hibiscus",
    price: "₹60",
    oldPrice: "₹80",
    category: "Hibiscus",
    popularity: 88,
    rawPrice: 60,
  },
  {
    id: 5,
    image: flowers5,
    alter: "Lotus",
    name: "Sacred Pink Lotus",
    price: "₹65",
    oldPrice: "₹85",
    category: "Lotus",
    popularity: 96,
    rawPrice: 65,
  },
  {
    id: 6,
    image: carouselRanunculus,
    alter: "Ranunculus",
    name: "Pastel Silk Ranunculus",
    price: "₹85",
    oldPrice: "₹110",
    category: "Rose",
    popularity: 99,
    rawPrice: 85,
  },
  {
    id: 7,
    image: carouselProtea,
    alter: "Protea",
    name: "White King Protea Stem",
    price: "₹120",
    oldPrice: "₹160",
    category: "Protea",
    popularity: 97,
    rawPrice: 120,
  },
  {
    id: 8,
    image: carouselCalla,
    alter: "Calla Lily",
    name: "Obsidian Calla Lily",
    price: "₹95",
    oldPrice: "₹130",
    category: "Tulip",
    popularity: 94,
    rawPrice: 95,
  },
  {
    id: 9,
    image: flowers3,
    alter: "Pink Tulip",
    name: "Blush Ruffled Tulip",
    price: "₹75",
    oldPrice: "₹95",
    category: "Tulip",
    popularity: 90,
    rawPrice: 75,
  },
];

function Web1() {
  const { addToCart, showToast } = useCart();

  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);

  /* SEARCH & FILTER STATES */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  /* COUNTDOWN TIMER FOR FLASH DEAL */
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* AUTO CAROUSEL */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const selectSlide = (index) => {
    setCurrentSlide(index);
  };

  /* FILTER AND SORT LOGIC */
  const filteredFlowers = useMemo(() => {
    let list = flowerList.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (sortBy === "low-high") {
      list.sort((a, b) => a.rawPrice - b.rawPrice);
    } else if (sortBy === "high-low") {
      list.sort((a, b) => b.rawPrice - a.rawPrice);
    } else if (sortBy === "popular") {
      list.sort((a, b) => b.popularity - a.popularity);
    }

    return list;
  }, [searchQuery, selectedCategory, sortBy]);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="flower-page">
      <Navbar />
      <CartDrawer />
      <Toast />

      {/* ================= HERO CAROUSEL ================= */}
      <section className="hero-carousel" ref={heroRef}>
        {heroImages.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? "active" : ""}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              style={{
                "--slide-focus-desktop": slide.focusDesktop,
                "--slide-focus-mobile": slide.focusMobile,
              }}
            />

            <div className="hero-overlay">
              <span className="hero-tag">{slide.tag}</span>
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
            </div>
          </div>
        ))}


        <div className="carousel-dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              className={index === currentSlide ? "dot active" : "dot"}
              onClick={() => selectSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ================= HERO ACTION BAR (MOVED OUTSIDE CAROUSEL WITH GOLD FRAME) ================= */}
      <section className="hero-actions-section">
        <div className="hero-actions-container gold-frame">
          <div className="hero-actions-text">
            <span className="sparkle-icon">✨</span>
            <div>
              <strong>Handcrafted Luxury Blooms &amp; Artisan Florals</strong>
              <small>Delivered 100% farm-fresh today with bespoke handwritten calligraphy greetings</small>
            </div>
          </div>
          <div className="hero-actions-buttons">
            <button
              className="explore-btn gold-shimmer-btn"
              type="button"
              onClick={scrollToProducts}
            >
              Explore Fresh Blooms ✨
            </button>
            <Link to="/bouquets" className="hero-secondary-btn gold-border-btn">
              View Artisan Bouquets →
            </Link>
          </div>
        </div>
      </section>

      {/* ================= VALUE PROPOSITION STRIP ================= */}
      <section className="value-strip">
        <div className="value-strip-grid">
          <div className="value-strip-item">
            <span className="strip-icon">🚚</span>
            <div>
              <strong>Same-Day Hand Delivery</strong>
              <small>Orders placed before 4 PM delivered fresh</small>
            </div>
          </div>
          <div className="value-strip-item">
            <span className="strip-icon">🌿</span>
            <div>
              <strong>Farm-To-Vase Freshness</strong>
              <small>Harvested daily from organic partner growers</small>
            </div>
          </div>
          <div className="value-strip-item">
            <span className="strip-icon">🎁</span>
            <div>
              <strong>Complimentary Gift Card</strong>
              <small>Custom handwritten message with every order</small>
            </div>
          </div>
          <div className="value-strip-item">
            <span className="strip-icon">✨</span>
            <div>
              <strong>7-Day Bloom Life Guarantee</strong>
              <small>Flower nutrition food included free</small>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & FILTERS ================= */}
      <section className="search-section">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search your favourite flowers, roses, tulips, lotus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <select
          className="filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Flower Types</option>
          <option value="Rose">Rose &amp; Ranunculus</option>
          <option value="Jasmine">Jasmine</option>
          <option value="Tulip">Tulip &amp; Calla</option>
          <option value="Hibiscus">Hibiscus</option>
          <option value="Lotus">Lotus</option>
          <option value="Protea">Protea &amp; Exotic</option>
        </select>

        <select
          className="filter"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Sort: Recommended</option>
          <option value="popular">Most Popular</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
        </select>
      </section>

      {/* ================= QUICK CATEGORY PILLS ================= */}
      <div className="category-pills-bar">
        {["All", "Rose", "Tulip", "Jasmine", "Lotus", "Hibiscus", "Protea"].map(
          (cat) => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "All" ? "🌸 All Stems" : cat}
            </button>
          )
        )}
      </div>

      {/* ================= PRODUCTS GRID ================= */}
      <section className="products" id="products">
        <div className="section-title">
          <div>
            <span>✨ OUR LUXURY COLLECTION ✨</span>
            <h2>Fresh Handpicked Flowers</h2>
          </div>
          <p>
            Showing {filteredFlowers.length} {filteredFlowers.length === 1 ? "variety" : "varieties"} available for today’s delivery.
          </p>
        </div>

        {filteredFlowers.length === 0 ? (
          <div className="no-products-found">
            <div className="empty-flower-icon">🥀</div>
            <h3>No matching blooms found</h3>
            <p>Try searching for a different flower name or clear your filters.</p>
            <button
              className="btn-primary"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset All Filters 🌸
            </button>
          </div>
        ) : (
          <div className="items">
            {filteredFlowers.map((item) => (
              <Props
                key={item.id}
                id={item.id}
                image={item.image}
                alter={item.alter}
                name={item.name}
                price={item.price}
                oldPrice={item.oldPrice}
                category={item.category}
                btnText="BUY NOW"
              />
            ))}
          </div>
        )}
      </section>

      {/* ================= TODAY'S FLASH DEAL BANNER ================= */}
      <section className="flash-deal-section">
        <div className="flash-deal-card">
          <div className="flash-deal-badge">⚡ LIMITED TIME OFFER</div>
          <h2>The Grand Silk Ranunculus & Rose Box</h2>
          <p>
            Get 20% OFF today’s featured harvest with complimentary Italian vase & handwritten calligraphy card.
          </p>

          <div className="deal-countdown">
            <div className="countdown-box">
              <span>{String(timeLeft.hours).padStart(2, "0")}</span>
              <small>Hours</small>
            </div>
            <span className="colon">:</span>
            <div className="countdown-box">
              <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
              <small>Mins</small>
            </div>
            <span className="colon">:</span>
            <div className="countdown-box">
              <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
              <small>Secs</small>
            </div>
          </div>

          <button
            className="deal-claim-btn"
            onClick={() => {
              addToCart({
                name: "The Blush Romance Bouquet (Flash Deal)",
                price: "₹999",
                image: carouselRanunculus,
                category: "Rose",
              });
              showToast("Flash deal added to your cart with discount! ⚡");
            }}
          >
            Claim Flash Deal (₹999 <span className="strike">₹1,299</span>) →
          </button>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="testimonials-section">
        <div className="section-header-centered">
          <span className="subhead">CUSTOMER LOVE</span>
          <h2>Blooms that Stole Their Hearts</h2>
          <p>Read genuine reviews from over 5,000+ satisfied flower lovers.</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p>
              “The King Protea and orchid bouquet was beyond breathtaking! It arrived in pristine condition and stayed fresh for over 10 days.”
            </p>
            <div className="testimonial-author">
              <span className="author-avatar">S</span>
              <div>
                <strong>Sophia Reynolds</strong>
                <small>Anniversary Order • Mumbai</small>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p>
              “Same-day delivery was right on time for my mother’s birthday. The packaging and handwritten note made it feel so personal and luxurious.”
            </p>
            <div className="testimonial-author">
              <span className="author-avatar">A</span>
              <div>
                <strong>Arjun Mehta</strong>
                <small>Birthday Surprise • Bandra</small>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p>
              “Flowra styled our intimate engagement dinner and every single guest asked who did the floral arrangements. Absolute floral artistry!”
            </p>
            <div className="testimonial-author">
              <span className="author-avatar">N</span>
              <div>
                <strong>Nisha &amp; Kabir</strong>
                <small>Event Floral Styling</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Web1;
