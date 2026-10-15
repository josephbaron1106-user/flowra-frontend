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

function CategoryManager() {
  const initialCategories = [
    { id: "CAT-01", name: "Roses", slug: "roses", productCount: 14, status: "Active", image: flowers1, description: "Classic English, Dutch, and wild garden roses" },
    { id: "CAT-02", name: "Jasmine", slug: "jasmine", productCount: 8, status: "Active", image: flowers2, description: "Fresh morning harvested fragrant jasmine posies" },
    { id: "CAT-03", name: "Tulips", slug: "tulips", productCount: 12, status: "Active", image: flowers3, description: "Imported Dutch ruffled tulips in pastel hues" },
    { id: "CAT-04", name: "Hibiscus", slug: "hibiscus", productCount: 6, status: "Active", image: flower4, description: "Tropical blooms for traditional & modern decor" },
    { id: "CAT-05", name: "Lotus & Water Lilies", slug: "lotus", productCount: 5, status: "Active", image: flowers5, description: "Sacred pink and white water blossoms" },
    { id: "CAT-06", name: "Artisan Bouquets", slug: "bouquets", productCount: 18, status: "Active", image: carouselRanunculus, description: "Hand-tied bouquets with luxury Italian wrap" },
    { id: "CAT-07", name: "Exotic & Rare Botanicals", slug: "luxury", productCount: 9, status: "Active", image: carouselProtea, description: "King proteas, orchids and architectural stems" },
    { id: "CAT-08", name: "Event Floral Styling", slug: "decoration", productCount: 7, status: "Active", image: carouselCalla, description: "Wedding stage, mandap, and banquet styling" },
  ];

  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "Active",
    image: flowers1,
  });

  useEffect(() => {
    fetch("https://flowra-backend-1.onrender.com/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiCats = data.map((c) => ({
            id: `CAT-${c.id}`,
            dbId: c.id,
            name: c.name,
            slug: c.slug,
            productCount: c.productCount || 0,
            status: c.status || "Active",
            image: c.imageUrl || flowers1,
            description: c.description || "",
          }));
          setCategories((prev) => {
            const existingSlugs = new Set(apiCats.map((ac) => ac.slug));
            return [...apiCats, ...prev.filter((p) => !existingSlugs.has(p.slug))];
          });
        }
      })
      .catch((err) => console.warn("Categories sync warning:", err));
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "Active",
      image: carouselRanunculus,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ ...cat });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = {
      name: formData.name,
      slug: slug,
      description: formData.description,
      imageUrl: typeof formData.image === "string" && formData.image.startsWith("http") ? formData.image : null,
      status: formData.status || "Active",
    };

    if (editingCategory) {
      if (editingCategory.dbId) {
        fetch(`https://flowra-backend-1.onrender.com/api/categories/${editingCategory.dbId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(console.warn);
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...formData, id: c.id, productCount: c.productCount } : c))
      );
      triggerToast(`Category "${formData.name}" updated! 🌸`);
    } else {
      try {
        const res = await fetch("https://flowra-backend-1.onrender.com/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const saved = await res.json();
          const newCat = {
            ...formData,
            id: `CAT-${saved.id}`,
            dbId: saved.id,
            productCount: 0,
          };
          setCategories((prev) => [newCat, ...prev]);
          triggerToast(`Category "${formData.name}" created! 🌸`);
          setIsModalOpen(false);
          return;
        }
      } catch (err) {
        console.warn("Category creation warning:", err);
      }

      const newId = "CAT-0" + (categories.length + 1);
      setCategories((prev) => [{ ...formData, id: newId, productCount: 0 }, ...prev]);
      triggerToast(`Category "${formData.name}" created! 🌸`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      const cat = categories.find((c) => c.id === id);
      if (cat && cat.dbId) {
        fetch(`https://flowra-backend-1.onrender.com/api/categories/${cat.dbId}`, { method: "DELETE" }).catch(console.warn);
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      triggerToast(`Category "${name}" removed.`);
    }
  };

  const handleToggleStatus = (id) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "Active" ? "Disabled" : "Active" } : c))
    );
    triggerToast("Category status updated.");
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout pageTitle="Category Management">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TOP FILTER BAR */}
      <section className="admin-filter-card">
        <div className="filter-controls-row">
          <div className="admin-search-input-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search floral categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleOpenAddModal}
          >
            + Create New Category
          </button>
        </div>
      </section>

      {/* CATEGORIES TABLE */}
      <section className="dashboard-table-card">
        <div className="card-top-action-bar">
          <div>
            <h3>All Flower &amp; Decor Categories ({filteredCategories.length})</h3>
            <p>Organize flowers, bouquets, occasions, and styling services</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Image</th>
                <th>Category Name &amp; Slug</th>
                <th>Description</th>
                <th>Products Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <img src={cat.image} alt={cat.name} className="product-table-img" />
                  </td>
                  <td>
                    <strong>{cat.name}</strong>
                    <small className="table-subtext">slug: /{cat.slug}</small>
                  </td>
                  <td className="text-truncate-cell">{cat.description}</td>
                  <td>
                    <span className="count-pill">{cat.productCount} products</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`status-pill-toggle ${cat.status.toLowerCase()}`}
                      onClick={() => handleToggleStatus(cat.id)}
                    >
                      {cat.status}
                    </button>
                  </td>
                  <td>
                    <div className="table-actions-group">
                      <button
                        type="button"
                        className="action-icon-btn"
                        title="Edit Category"
                        onClick={() => handleOpenEditModal(cat)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn danger"
                        title="Delete Category"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ADD/EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-eyebrow">CATEGORY BUILDER</span>
                <h2>{editingCategory ? `Edit "${editingCategory.name}"` : "Add Category"}</h2>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="modal-form-scroll">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exotic Orchids & Proteas"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                />
              </div>

              <div className="form-group">
                <label>Slug URL Path</label>
                <input
                  type="text"
                  placeholder="exotic-orchids"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Briefly describe this floral category for catalog navigation..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CategoryManager;
