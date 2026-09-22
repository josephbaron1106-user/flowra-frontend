import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import CartDrawer from "./CartDrawer.jsx";
import Toast from "./Toast.jsx";
import Props from "./props.jsx";

import carouselRanunculus from "./assets/pictures/carousel_ranunculus.jpg";
import carouselProtea from "./assets/pictures/carousel_protea.jpg";
import carouselCalla from "./assets/pictures/carousel_calla.jpg";
import flowers1 from "./assets/pictures/flowers1.jpg";
import flowers2 from "./assets/pictures/flowers2.jpg";
import flowers3 from "./assets/pictures/flowers3.jpg";
import flower4 from "./assets/pictures/flower4.jpg";
import flowers5 from "./assets/pictures/flowers5.jpeg";

function Bouquets() {
  const [activeCategory, setActiveCategory] = useState("all");

  const bouquetList = [
    {
      id: "bq-1",
      image: carouselRanunculus,
      alter: "Silk Ranunculus & Garden Roses Bouquet",
      name: "The Blush Romance Bouquet",
      price: "₹1,299",
      oldPrice: "₹1,699",
      category: "Romance",
      description: "Artisan peach ranunculus, English garden roses, and silver eucalyptus in luxury kraft wrap.",
    },
    {
      id: "bq-2",
      image: carouselProtea,
      alter: "Exotic King Protea & Cascading Orchids",
      name: "The Imperial Botanical Luxe",
      price: "₹2,499",
      oldPrice: "₹3,199",
      category: "Luxury",
      description: "Rare South African white king protea with cascading lilac phalaenopsis orchids on marble styling.",
    },
    {
      id: "bq-3",
      image: carouselCalla,
      alter: "Midnight Velvet Calla Lilies & Dahlias",
      name: "The Midnight Velvet Symphony",
      price: "₹1,899",
      oldPrice: "₹2,299",
      category: "Luxury",
      description: "Deep obsidian calla lilies, burgundy dahlias, and frosted dusty blue hydrangeas.",
    },
    {
      id: "bq-4",
      image: flowers3,
      alter: "Pink Peonies and Tulips Bouquet",
      name: "Pastel Springtime Dream",
      price: "₹899",
      oldPrice: "₹1,199",
      category: "Birthday",
      description: "Lush pink peonies, ruffled Holland tulips, and sweet peas hand-tied with silk ribbon.",
    },
    {
      id: "bq-5",
      image: flowers1,
      alter: "Classic Red and White Rose Arrangement",
      name: "Timeless Grand Romance Roses",
      price: "₹999",
      oldPrice: "₹1,299",
      category: "Romance",
      description: "24 long-stem velvety red roses surrounded by baby's breath and fresh greenery.",
    },
    {
      id: "bq-6",
      image: flowers2,
      alter: "Pure White Jasmine and Lily Posy",
      name: "Serene Jasmine Harmony",
      price: "₹749",
      oldPrice: "₹950",
      category: "Sympathy",
      description: "Pure fragrant jasmine posy combined with white calla lilies for peace and mindfulness.",
    },
    {
      id: "bq-7",
      image: flower4,
      alter: "Tropical Hibiscus Fiesta",
      name: "Tropical Sunrise Burst",
      price: "₹849",
      oldPrice: "₹1,050",
      category: "Celebrations",
      description: "Vibrant tropical crimson hibiscus, birds of paradise, and golden ferns.",
    },
    {
      id: "bq-8",
      image: flowers5,
      alter: "Sacred Lotus and Water Lily Bouquet",
      name: "Zen Lotus Whisper",
      price: "₹1,149",
      oldPrice: "₹1,450",
      category: "Celebrations",
      description: "Sacred pink lotus blossoms resting upon fresh river greenery, presented in a gift vase.",
    },
  ];

  const filteredBouquets =
    activeCategory === "all"
      ? bouquetList
      : bouquetList.filter(
          (b) => b.category.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="bouquets-page-container">
      <Navbar />
      <CartDrawer />
      <Toast />

      {/* HERO BANNER */}
      <section className="bouquets-hero">
        <div className="bouquets-hero-content">
          <span className="bouquets-badge">✨ HAND-TIED ARTISANAL ARRANGEMENTS</span>
          <h1>Masterpiece Bouquets Crafted with Love</h1>
          <p>
            Each arrangement is uniquely composed by master florists using the morning’s freshest harvest, wrapped in eco-luxe materials.
          </p>
        </div>
      </section>

      {/* FILTER PILLS */}
      <section className="bouquets-filter-bar">
        <div className="filter-pill-group">
          {["all", "Romance", "Luxury", "Birthday", "Celebrations", "Sympathy"].map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "all" ? "🌸 All Bouquets" : cat}
            </button>
          ))}
        </div>
      </section>

      {/* BOUQUETS GRID */}
      <section className="bouquets-grid-section">
        <div className="items">
          {filteredBouquets.map((b) => (
            <Props
              key={b.id}
              id={b.id}
              image={b.image}
              alter={b.alter}
              name={b.name}
              price={b.price}
              oldPrice={b.oldPrice}
              category={b.category}
              btnText="ORDER BOUQUET"
            />
          ))}
        </div>
      </section>

      {/* BESPOKE BOUQUET BUILDER CALLOUT */}
      <section className="custom-bouquet-banner">
        <div className="custom-bouquet-card">
          <div className="custom-bouquet-copy">
            <span className="gold-tag">BESPOKE FLORISTRY</span>
            <h2>Want a Custom Arrangement?</h2>
            <p>
              Tell our lead floral designers your preferred flower varieties, color palette, and occasion. We will curate a one-of-a-kind bouquet just for you.
            </p>
            <a href="/contact" className="bespoke-btn">
              Consult a Florist →
            </a>
          </div>
          <div className="custom-bouquet-features">
            <div className="feature-item">
              <span className="feature-icon">🌿</span>
              <h4>Sustainably Harvested</h4>
              <p>Direct from pesticide-free organic partner growers.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎀</span>
              <h4>Luxury Presentation</h4>
              <p>Wrapped in Italian craft paper with custom silk satin ribbons.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💧</span>
              <h4>7-Day Fresh Guarantee</h4>
              <p>Nutrient packs included with every bouquet to maximize bloom time.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Bouquets;
