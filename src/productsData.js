import carouselRanunculus from "./assets/pictures/carousel_ranunculus.jpg";
import carouselProtea from "./assets/pictures/carousel_protea.jpg";
import carouselCalla from "./assets/pictures/carousel_calla.jpg";
import flowers1 from "./assets/pictures/flowers1.jpg";
import flowers2 from "./assets/pictures/flowers2.jpg";
import flowers3 from "./assets/pictures/flowers3.jpg";
import flower4 from "./assets/pictures/flower4.jpg";
import flowers5 from "./assets/pictures/flowers5.jpeg";

export const allProducts = [
  // FRESH FLOWERS (ID: 1 to 9)
  {
    id: "1",
    image: flowers1,
    alter: "Rose",
    name: "Premium Red Rose",
    price: "₹50",
    oldPrice: "₹70",
    category: "Rose",
    popularity: 98,
    rawPrice: 50,
    type: "Single Stem & Bunch",
    description:
      "Handpicked velvety Crimson Grand Prix roses sourced at dawn from organic hill estates. Features long sturdy stems, deep romantic fragrance, and exceptional vase longevity.",
    highlights: [
      "100% Organic Greenhouse Harvest",
      "Vase Life: 7 to 10 Days",
      "Complimentary Floral Nutrition Sachet",
      "Same-Day Temperature Controlled Delivery",
    ],
    care: "Trim stems at a 45° angle under water, change water every 2 days, and keep away from direct sunlight.",
  },
  {
    id: "2",
    image: flowers2,
    alter: "Jasmine",
    name: "Fresh Jasmine Posy",
    price: "₹45",
    oldPrice: "₹65",
    category: "Jasmine",
    popularity: 92,
    rawPrice: 45,
    type: "Fragrant Traditional Posy",
    description:
      "Intensely aromatic Madurai jasmine blossoms tied with natural craft cord. Evokes peaceful garden tranquility and soothing floral notes throughout any room.",
    highlights: [
      "Intense Natural Essential Fragrance",
      "Traditional Artisan Hand-Binding",
      "Ethically Sourced from Local Farmers",
      "Fresh Morning Harvest Guarantee",
    ],
    care: "Mist lightly with fresh water twice a day and store in a cool, ventilated ceramic dish.",
  },
  {
    id: "3",
    image: flowers3,
    alter: "Tulip",
    name: "Elegant Holland Tulip",
    price: "₹70",
    oldPrice: "₹90",
    category: "Tulip",
    popularity: 95,
    rawPrice: 70,
    type: "Imported Dutch Bloom",
    description:
      "Crisp, graceful Holland tulips with pastel pink and peach gradients. Perfect for minimalist vases, uplifting modern home aesthetics, and celebrating new beginnings.",
    highlights: [
      "Direct Air-Freight from Dutch Growers",
      "Vase Life: 6 to 9 Days",
      "Naturally Continues to Grow in Water",
      "Includes Hand-Embossed Card",
    ],
    care: "Place in cold water with ice cubes; tulips love cool spots away from room heaters.",
  },
  {
    id: "4",
    image: flower4,
    alter: "Hibiscus",
    name: "Crimson Red Hibiscus",
    price: "₹60",
    oldPrice: "₹80",
    category: "Hibiscus",
    popularity: 88,
    rawPrice: 60,
    type: "Tropical Exotic Flower",
    description:
      "Bold scarlet hibiscus blooms featuring prominent golden stamens and sun-drenched tropical vitality. Celebrated for celebratory vibrancy and ornamental beauty.",
    highlights: [
      "Rich Radiant Scarlet Pigments",
      "Sun-Grown Coastal Nursery Stem",
      "Eco-Friendly Fiber Wrapping",
      "Morning Harvest Same-Day Handover",
    ],
    care: "Keep in shallow filtered water; blooms thrive in warm, brightly lit rooms.",
  },
  {
    id: "5",
    image: flowers5,
    alter: "Lotus",
    name: "Sacred Pink Lotus",
    price: "₹65",
    oldPrice: "₹85",
    category: "Lotus",
    popularity: 96,
    rawPrice: 65,
    type: "Sacred Aquatic Flower",
    description:
      "Divine pink lotus blossoms hand-harvested from tranquil freshwater sanctuary ponds. Brings serene spirituality, purity, and zen grace to festive and temple styling.",
    highlights: [
      "Sacred Symbolic Heritage",
      "Natural Fresh Pond Harvest",
      "Naturally Opens with Morning Light",
      "Wrapped in Biodegradable Banana Leaf",
    ],
    care: "Submerge stem bases in clean water; float flower heads in wide decorative brass or ceramic urli bowls.",
  },
  {
    id: "6",
    image: carouselRanunculus,
    alter: "Ranunculus",
    name: "Pastel Silk Ranunculus",
    price: "₹85",
    oldPrice: "₹110",
    category: "Rose",
    popularity: 99,
    rawPrice: 85,
    type: "Luxury Layered Petal Stem",
    description:
      "Delicate tissue-thin ruffled petals arranged in mesmerizing spiral whorls. Warm champagne-peach undertones evoke high-fashion European spring botanical styling.",
    highlights: [
      "Extraordinary 80+ Petal Density",
      "Vase Life: 8 to 12 Days",
      "Styled with Italian Ribbon Accents",
      "100% Farm Fresh Guarantee",
    ],
    care: "Keep water shallow (about 2-3 inches) to avoid stem softening; trim ends every 48 hours.",
  },
  {
    id: "7",
    image: carouselProtea,
    alter: "Protea",
    name: "White King Protea Stem",
    price: "₹120",
    oldPrice: "₹160",
    category: "Protea",
    popularity: 97,
    rawPrice: 120,
    type: "Architectural Statement Bloom",
    description:
      "Statuesque South African King Protea with velvety artichoke-shaped bracts. An opulent centerpiece stem that naturally dries into an everlasting botanical keepsake.",
    highlights: [
      "Vase Life: Up to 14+ Days Fresh",
      "Can Be Preserved As Everlasting Dried Floral",
      "Rare South African Cultivar",
      "Sculptural Luxury Centerpiece",
    ],
    care: "Thrives in deep fresh water; replace water every few days and display in a tall ceramic or marble vase.",
  },
  {
    id: "8",
    image: carouselCalla,
    alter: "Calla Lily",
    name: "Obsidian Calla Lily",
    price: "₹95",
    oldPrice: "₹130",
    category: "Tulip",
    popularity: 94,
    rawPrice: 95,
    type: "Sculptural Modern Bloom",
    description:
      "Striking deep obsidian trumpet bloom with sleek architectural stems. Ideal for contemporary interior decor, art exhibitions, and bold sophisticated gifting.",
    highlights: [
      "Smooth Elegant Velvety Texture",
      "Minimalist Modern Design Choice",
      "Vase Life: 7 to 10 Days",
      "Temperature-Controlled Transit",
    ],
    care: "Submerge stem ends in 2 inches of water; avoid overfilling to keep stems crisp and upright.",
  },
  {
    id: "9",
    image: flowers3,
    alter: "Pink Tulip",
    name: "Blush Ruffled Tulip",
    price: "₹75",
    oldPrice: "₹95",
    category: "Tulip",
    popularity: 90,
    rawPrice: 75,
    type: "Dutch Peony-Flowering Tulip",
    description:
      "Feathery fringed edges with multi-layered blush petals that mimic garden peonies. Exudes romantic softness, gentle sweetness, and joyful spring optimism.",
    highlights: [
      "Unique Peony-Style Double Petals",
      "Eco-Kraft Paper Packaging",
      "Vase Life: 6 to 9 Days",
      "Handwritten Message Card Included",
    ],
    care: "Keep in cool water; rotate vase occasionally as tulips naturally lean towards sunlight.",
  },

  // ARTISAN BOUQUETS (ID: bq-1 to bq-8)
  {
    id: "bq-1",
    image: carouselRanunculus,
    alter: "Silk Ranunculus & Garden Roses Bouquet",
    name: "The Blush Romance Bouquet",
    price: "₹1,299",
    oldPrice: "₹1,699",
    category: "Romance",
    popularity: 100,
    rawPrice: 1299,
    type: "Hand-Tied Artisan Bouquet",
    description:
      "Our bestselling signature masterpiece. Layered peach ranunculus, English David Austin garden roses, and aromatic silver dollar eucalyptus hand-tied in textured rose kraft wrap.",
    highlights: [
      "Master Florist Hand-Tied Composition",
      "Includes Complimentary Glass Italian Vase",
      "Handwritten Calligraphy Greeting Card",
      "7-Day Vase Freshness Life Guarantee",
    ],
    care: "Unwrap stems, cut 1 inch off bottoms, place in vase with fresh water and flower food provided.",
  },
  {
    id: "bq-2",
    image: carouselProtea,
    alter: "Exotic King Protea & Cascading Orchids",
    name: "The Imperial Botanical Luxe",
    price: "₹2,499",
    oldPrice: "₹3,199",
    category: "Luxury",
    popularity: 98,
    rawPrice: 2499,
    type: "High-Luxe Botanical Showcase",
    description:
      "South African white king protea flanked by cascading lilac phalaenopsis orchids, frosted dusty blue hydrangeas, and trailing Italian ruscus on marble aesthetics.",
    highlights: [
      "Ultra-Luxury Statement Floral Design",
      "Rare Air-Imported Stems",
      "Delivered in Luxury Keepsake Gift Box",
      "VIP Dedicated Temperature Van Delivery",
    ],
    care: "Mist orchid petals gently; keep water fresh and enjoy over 10 to 14 days of botanical wonder.",
  },
  {
    id: "bq-3",
    image: carouselCalla,
    alter: "Midnight Velvet Calla Lilies & Dahlias",
    name: "The Midnight Velvet Symphony",
    price: "₹1,899",
    oldPrice: "₹2,299",
    category: "Luxury",
    popularity: 96,
    rawPrice: 1899,
    type: "Moody Haute-Couture Bouquet",
    description:
      "Deep obsidian calla lilies, burgundy garden dahlias, and frosted indigo sea holly nestled in charcoal black matte paper with satin burgundy ribbons.",
    highlights: [
      "Dramatic Runway-Inspired Palette",
      "Long-Lasting Velvety Blooms",
      "Includes Handcrafted Gold Wax Sealed Card",
      "Florist-Conditioned Hydration Pack",
    ],
    care: "Add fresh water upon arrival and avoid direct heat or air conditioning drafts.",
  },
  {
    id: "bq-4",
    image: flowers3,
    alter: "Pink Peonies and Tulips Bouquet",
    name: "Pastel Springtime Dream",
    price: "₹899",
    oldPrice: "₹1,199",
    category: "Birthday",
    popularity: 95,
    rawPrice: 899,
    type: "Celebratory Pastel Arrangement",
    description:
      "Lush pink peonies, ruffled Holland tulips, and sweet peas hand-tied with silk ribbon. Radiates joyful warmth, playful charm, and delightful springtime celebration.",
    highlights: [
      "Ideal for Birthdays & Celebrations",
      "Sweet Natural Fragrance Notes",
      "Eco-Friendly Recyclable Materials",
      "Free Custom Gift Card Included",
    ],
    care: "Keep in cool water; blooms will expand and fill the room with sweet pastel fragrance.",
  },
  {
    id: "bq-5",
    image: flowers1,
    alter: "Classic Red and White Rose Arrangement",
    name: "Timeless Grand Romance Roses",
    price: "₹999",
    oldPrice: "₹1,299",
    category: "Romance",
    popularity: 97,
    rawPrice: 999,
    type: "Classic Two-Dozen Roses",
    description:
      "Two dozen premium crimson red roses intertwined with delicate white baby's breath and salal greenery in a signature Flowra luxury cylinder presentation box.",
    highlights: [
      "24 Long-Stem Grand Prix Roses",
      "Velvet Finish Floral Presentation Box",
      "Classic Romantic Expression",
      "Guaranteed Fresh Arrival",
    ],
    care: "Keep in water-soaked oasis foam or transfer to vase after 2-3 days for maximum longevity.",
  },
  {
    id: "bq-6",
    image: flowers2,
    alter: "Pure White Jasmine and Lily Posy",
    name: "Serene Jasmine Harmony",
    price: "₹749",
    oldPrice: "₹950",
    category: "Sympathy",
    popularity: 93,
    rawPrice: 749,
    type: "Pure Mindfulness Posy",
    description:
      "Pure fragrant jasmine posy combined with white calla lilies and silver eucalyptus. Designed to bring peace, comfort, and soothing harmony.",
    highlights: [
      "Calming Traditional Floral Aromas",
      "Pure White & Silver Greenery Tones",
      "Gentle Thoughtful Presentation",
      "Handcrafted with Care and Reverence",
    ],
    care: "Keep stems hydrated with fresh cold water daily.",
  },
  {
    id: "bq-7",
    image: flower4,
    alter: "Tropical Hibiscus Fiesta",
    name: "Tropical Sunrise Burst",
    price: "₹849",
    oldPrice: "₹1,050",
    category: "Celebrations",
    popularity: 91,
    rawPrice: 849,
    type: "Vibrant Tropical Bouquet",
    description:
      "Vibrant tropical crimson hibiscus, sunburst yellow lilies, golden ferns, and orange hypericum berries. Brings energetic tropical sunshine into any festive room.",
    highlights: [
      "Sun-Drenched Tropical Color Burst",
      "Long-Stem Rainforest Greenery",
      "Festive Celebration Favorite",
      "Includes Custom Gift Box Wrap",
    ],
    care: "Display in a brightly lit room; mist leaves every morning to mimic tropical humidity.",
  },
  {
    id: "bq-8",
    image: flowers5,
    alter: "Sacred Lotus and Water Lily Bouquet",
    name: "Zen Lotus Whisper",
    price: "₹1,149",
    oldPrice: "₹1,450",
    category: "Celebrations",
    popularity: 96,
    rawPrice: 1149,
    type: "Aquatic Botanical Centerpiece",
    description:
      "Sacred pink lotus blossoms resting upon fresh river greenery, palm fronds, and white tuberose stems. Presented in an elegant eco-luxe floral cylinder.",
    highlights: [
      "Sacred Lotus Blooms with Morning Opening",
      "Harmonious Zen Centerpiece",
      "Includes Botanical Food Nutrition",
      "Fresh Sanctuary Pond Sourced",
    ],
    care: "Display in wide vase or decorative bowl with 3-4 inches of fresh water.",
  },
];

/**
 * Finds a product by ID (handles string or number)
 */
export function getProductById(id) {
  const normalizedId = String(id || "").trim().toLowerCase();
  return (
    allProducts.find((p) => String(p.id).toLowerCase() === normalizedId) ||
    allProducts.find((p) => p.name.toLowerCase().includes(normalizedId)) ||
    allProducts[0]
  );
}

/**
 * Returns relatable / related products from our catalog
 * Prioritizes matching category, same product family, and diverse recommendations
 */
export function getRelatedProducts(currentId, category, limit = 4) {
  const normalizedId = String(currentId || "").trim().toLowerCase();
  const normalizedCat = String(category || "").trim().toLowerCase();

  // Filter out current product
  const candidates = allProducts.filter(
    (p) => String(p.id).toLowerCase() !== normalizedId
  );

  // Split into same category and other categories
  const sameCategory = candidates.filter(
    (p) => p.category?.toLowerCase() === normalizedCat
  );
  const otherCategory = candidates.filter(
    (p) => p.category?.toLowerCase() !== normalizedCat
  );

  // Combine with same category first, then fill up to limit
  const combined = [...sameCategory, ...otherCategory];
  return combined.slice(0, limit);
}
