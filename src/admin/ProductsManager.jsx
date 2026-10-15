import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout.jsx";

import carouselRanunculus from "../assets/pictures/carousel_ranunculus.jpg";
import carouselProtea from "../assets/pictures/carousel_protea.jpg";
import carouselCalla from "../assets/pictures/carousel_calla.jpg";
import flowers1 from "../assets/pictures/flowers1.jpg";
import flowers2 from "../assets/pictures/flowers2.jpg";
import flowers3 from "../assets/pictures/flowers3.jpg";
import flower4 from "../assets/pictures/flower4.jpg";
import flowers5 from "../assets/pictures/flowers5.jpeg";

function ProductsManager() {
  const initialProducts = [
    {
      id: "PRD-01",
      name: "The Blush Romance Bouquet",
      category: "Bouquets",
      flowerType: "Ranunculus & Roses",
      color: "Peach Blush",
      size: "Large (24 Stems)",
      price: 1299,
      originalPrice: 1699,
      discount: 23,
      stock: 18,
      sku: "BQ-RAN-01",
      status: "Active",
      featured: true,
      image: carouselRanunculus,
      description: "Artisan peach ranunculus, English garden roses, and silver eucalyptus in luxury kraft wrap.",
    },
    {
      id: "PRD-02",
      name: "The Imperial Botanical Luxe",
      category: "Luxury",
      flowerType: "King Protea & Orchid",
      color: "Snow White & Lilac",
      size: "Deluxe Centerpiece",
      price: 2499,
      originalPrice: 3199,
      discount: 22,
      stock: 3,
      sku: "PROT-WHT-01",
      status: "Low Stock",
      featured: true,
      image: carouselProtea,
      description: "Rare South African white king protea with cascading lilac phalaenopsis orchids on marble styling.",
    },
    {
      id: "PRD-03",
      name: "The Midnight Velvet Symphony",
      category: "Luxury",
      flowerType: "Calla Lily & Dahlia",
      color: "Obsidian & Blue",
      size: "Grand Vase Arrangement",
      price: 1899,
      originalPrice: 2299,
      discount: 17,
      stock: 4,
      sku: "CAL-BLK-04",
      status: "Low Stock",
      featured: true,
      image: carouselCalla,
      description: "Deep obsidian calla lilies, burgundy dahlias, and frosted dusty blue hydrangeas.",
    },
    {
      id: "PRD-04",
      name: "Premium Long Stem Red Roses",
      category: "Roses",
      flowerType: "Dutch Red Rose",
      color: "Velvet Crimson",
      size: "Bunch (12 Stems)",
      price: 50,
      originalPrice: 70,
      discount: 28,
      stock: 85,
      sku: "ROS-RED-12",
      status: "Active",
      featured: true,
      image: flowers1,
      description: "Hand-selected long stem velvety Dutch red roses with baby's breath.",
    },
    {
      id: "PRD-05",
      name: "Fresh Fragrant Jasmine Posy",
      category: "Jasmine",
      flowerType: "Indian Jasmine",
      color: "Pure White",
      size: "Standard Posy",
      price: 45,
      originalPrice: 65,
      discount: 30,
      stock: 60,
      sku: "JAS-WHT-01",
      status: "Active",
      featured: false,
      image: flowers2,
      description: "Pure fragrant jasmine posy combined with white calla lilies for peace and mindfulness.",
    },
    {
      id: "PRD-06",
      name: "Elegant Holland Tulips",
      category: "Tulips",
      flowerType: "Holland Tulip",
      color: "Pastel Pink",
      size: "Bunch (10 Stems)",
      price: 70,
      originalPrice: 90,
      discount: 22,
      stock: 35,
      sku: "TUL-PNK-05",
      status: "Active",
      featured: false,
      image: flowers3,
      description: "Lush pink peonies, ruffled Holland tulips, and sweet peas hand-tied with silk ribbon.",
    },
    {
      id: "PRD-07",
      name: "Crimson Red Hibiscus",
      category: "Hibiscus",
      flowerType: "Tropical Hibiscus",
      color: "Deep Ruby",
      size: "Single Stem",
      price: 60,
      originalPrice: 80,
      discount: 25,
      stock: 40,
      sku: "HIB-RED-08",
      status: "Active",
      featured: false,
      image: flower4,
      description: "Vibrant tropical crimson hibiscus, birds of paradise, and golden ferns.",
    },
    {
      id: "PRD-08",
      name: "Sacred Pink Lotus",
      category: "Lotus",
      flowerType: "Sacred Lotus",
      color: "Blush Lotus",
      size: "Stem Pair",
      price: 65,
      originalPrice: 85,
      discount: 23,
      stock: 2,
      sku: "LOT-PNK-02",
      status: "Low Stock",
      featured: false,
      image: flowers5,
      description: "Sacred pink lotus blossoms resting upon fresh river greenery, presented in a gift vase.",
    },
  ];

  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "Roses",
    flowerType: "Rose",
    color: "Pink",
    size: "Standard",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    sku: "",
    status: "Active",
    featured: false,
    image: flowers1,
    description: "",
  });

  useEffect(() => {
    fetch("https://flowra-backend-1.onrender.com/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiProds = data.map((p) => ({
            id: `PRD-${p.id}`,
            dbId: p.id,
            name: p.name,
            category: p.categoryName || "Roses",
            flowerType: p.flowerType || "Artisan Bloom",
            color: p.color || "Multi-colored",
            size: p.size || "Standard",
            price: Number(p.price),
            originalPrice: Number(p.originalPrice || p.price),
            discount: p.discountPercent || 0,
            stock: p.currentStock || 10,
            sku: p.sku || `SKU-${p.id}`,
            status: p.status || "Active",
            featured: p.isFeatured || false,
            image: p.primaryImage || flowers1,
            description: p.description || "",
          }));
          setProducts((prev) => {
            const existingNames = new Set(apiProds.map((ap) => ap.name));
            return [...apiProds, ...prev.filter((pr) => !existingNames.has(pr.name))];
          });
        }
      })
      .catch((err) => console.warn("Products sync warning:", err));
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Roses",
      flowerType: "Rose",
      color: "Pink",
      size: "Standard",
      price: "",
      originalPrice: "",
      discount: "",
      stock: "",
      sku: "SKU-" + Math.floor(1000 + Math.random() * 9000),
      status: "Active",
      featured: false,
      image: carouselRanunculus,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const numPrice = parseFloat(formData.price) || 50;
    const numOldPrice = parseFloat(formData.originalPrice) || numPrice;
    const numDiscount = parseInt(formData.discount, 10) || 0;
    const numStock = parseInt(formData.stock, 10) || 20;

    const payload = {
      name: formData.name,
      flowerType: formData.flowerType,
      color: formData.color,
      size: formData.size,
      price: numPrice,
      originalPrice: numOldPrice,
      discountPercent: numDiscount,
      initialStock: numStock,
      sku: formData.sku || `SKU-${Date.now()}`,
      status: formData.status || "Active",
      isFeatured: !!formData.featured,
      description: formData.description,
      imageUrls: typeof formData.image === "string" && formData.image.startsWith("http") ? [formData.image] : [],
    };

    if (editingProduct) {
      if (editingProduct.dbId) {
        fetch(`https://flowra-backend-1.onrender.com/api/products/${editingProduct.dbId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(console.warn);
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...formData, id: p.id } : p))
      );
      triggerToast(`Product "${formData.name}" updated successfully! 🌸`);
    } else {
      try {
        const res = await fetch("https://flowra-backend-1.onrender.com/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const saved = await res.json();
          const newProd = {
            ...formData,
            id: `PRD-${saved.id}`,
            dbId: saved.id,
            price: numPrice,
            stock: numStock,
          };
          setProducts((prev) => [newProd, ...prev]);
          triggerToast(`Product "${formData.name}" added to catalog! 🌸`);
          setIsModalOpen(false);
          return;
        }
      } catch (err) {
        console.warn("Product creation warning:", err);
      }

      const newId = "PRD-0" + (products.length + 1);
      setProducts((prev) => [{ ...formData, id: newId }, ...prev]);
      triggerToast(`Product "${formData.name}" added to catalog! 🌸`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from catalog?`)) {
      const prod = products.find((p) => p.id === id);
      if (prod && prod.dbId) {
        fetch(`https://flowra-backend-1.onrender.com/api/products/${prod.dbId}`, { method: "DELETE" }).catch(console.warn);
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      triggerToast(`Product "${name}" deleted.`);
    }
  };

  const handleDuplicateProduct = (prod) => {
    const duplicated = {
      ...prod,
      id: "PRD-" + Math.floor(100 + Math.random() * 900),
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku}-CP`,
    };
    setProducts((prev) => [duplicated, ...prev]);
    triggerToast(`Duplicated "${prod.name}"!`);
  };

  const handleToggleStatus = (id) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "Active" ? "Disabled" : "Active";
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    triggerToast("Product availability status toggled.");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.flowerType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ["All", "Roses", "Jasmine", "Tulips", "Hibiscus", "Lotus", "Bouquets", "Luxury"];

  return (
    <AdminLayout pageTitle="Product Management">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TOP CONTROL CARD */}
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          <div className="admin-search-input-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search flowers, bouquets, SKU or flower type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")}>✕</button>
            )}
          </div>

          <div className="filter-select-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleOpenAddModal}
          >
            + Add New Flower / Product
          </button>
        </div>
      </section>

      {/* PRODUCTS TABLE */}
      <section className="dashboard-table-card">
        <div className="card-top-action-bar">
          <div>
            <h3>Botanical Inventory ({filteredProducts.length} Products)</h3>
            <p>Catalog pricing, stock quantities and storefront visibility</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name &amp; SKU</th>
                <th>Category</th>
                <th>Price &amp; Discount</th>
                <th>Stock Qty</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty-row">
                    <div className="empty-state-box">
                      <span>🥀</span>
                      <h4>No products match your criteria</h4>
                      <p>Try clearing filters or adding a new floral product.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <img src={prod.image} alt={prod.name} className="product-table-img" />
                    </td>

                    <td>
                      <strong>{prod.name}</strong>
                      <small className="table-subtext">SKU: {prod.sku} • {prod.flowerType}</small>
                    </td>

                    <td>
                      <span className="category-tag-pill">{prod.category}</span>
                    </td>

                    <td>
                      <strong className="amount-highlight">₹{prod.price}</strong>
                      {prod.originalPrice && (
                        <small className="strike-text">₹{prod.originalPrice} ({prod.discount}% off)</small>
                      )}
                    </td>

                    <td>
                      <div className="stock-level-cell">
                        <strong className={prod.stock <= 5 ? "stock-warn" : ""}>
                          {prod.stock} stems
                        </strong>
                      </div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`status-pill-toggle ${prod.status.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => handleToggleStatus(prod.id)}
                        title="Click to toggle status"
                      >
                        {prod.status}
                      </button>
                    </td>

                    <td>
                      {prod.featured ? (
                        <span className="badge-featured">⭐ Featured</span>
                      ) : (
                        <span className="badge-standard">Standard</span>
                      )}
                    </td>

                    <td>
                      <div className="table-actions-group">
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Edit Product"
                          onClick={() => handleOpenEditModal(prod)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title="Duplicate Product"
                          onClick={() => handleDuplicateProduct(prod)}
                        >
                          📋
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn danger"
                          title="Delete Product"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-eyebrow">PRODUCT CATALOG FORM</span>
                <h2>{editingProduct ? `Edit "${editingProduct.name}"` : "Add New Floral Product"}</h2>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form-scroll">
              <div className="input-grid-2">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Imperial White Protea"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PROT-WHT-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-grid-3">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Roses">Roses</option>
                    <option value="Jasmine">Jasmine</option>
                    <option value="Tulips">Tulips</option>
                    <option value="Hibiscus">Hibiscus</option>
                    <option value="Lotus">Lotus</option>
                    <option value="Bouquets">Bouquets</option>
                    <option value="Luxury">Luxury &amp; Exotic</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    placeholder="1299"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="input-grid-3">
                <div className="form-group">
                  <label>Current Stock (Stems / Units) *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Flower Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Ranunculus & Garden Rose"
                    value={formData.flowerType}
                    onChange={(e) => setFormData({ ...formData, flowerType: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Color Palette</label>
                  <input
                    type="text"
                    placeholder="e.g. Peach Blush & Ivory"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description &amp; Care Details</label>
                <textarea
                  rows="3"
                  placeholder="Describe the floral composition, scent notes, and arrangement wrapping..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-checkbox-row">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Feature this product on homepage carousel / banners</span>
                </label>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ProductsManager;
