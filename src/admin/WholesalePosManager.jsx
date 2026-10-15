import { useState, useEffect, useMemo, useRef } from "react";
import AdminLayout from "./AdminLayout.jsx";

function WholesalePosManager() {
  const [activeTab, setActiveTab] = useState("wholesale"); // "wholesale" | "pos" | "analytics"
  const [toastMessage, setToastMessage] = useState("");

  // MASTER DATA FROM BACKEND
  const [flowers, setFlowers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);

  // WHOLESALE INWARD DATA & FORM
  const [wholesaleList, setWholesaleList] = useState([]);
  const [wholesaleForm, setWholesaleForm] = useState({
    flowerId: "",
    flowerName: "",
    supplierId: "",
    supplierName: "",
    quantity: "",
    unitCost: "",
    retailPrice: "",
    grade: "Grade A+ (Cold-Chain Stored)",
    notes: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });
  const [wholesaleSearch, setWholesaleSearch] = useState("");
  const [flowerSearchTerm, setFlowerSearchTerm] = useState("");
  const [showFlowerDropdown, setShowFlowerDropdown] = useState(false);
  const flowerDropdownRef = useRef(null);

  // "ADD NEW FLOWER" MODAL STATE
  const [showAddFlowerModal, setShowAddFlowerModal] = useState(false);
  const [newFlowerForm, setNewFlowerForm] = useState({
    name: "",
    categoryId: "",
    categoryName: "",
    price: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSavingFlower, setIsSavingFlower] = useState(false);

  // POS / OFFLINE SALES STATE & FORM
  const [offlineSales, setOfflineSales] = useState([]);
  const [posCategoryFilter, setPosCategoryFilter] = useState("All");
  const [posForm, setPosForm] = useState({
    customer: "",
    phone: "",
    flowerId: "",
    flowerName: "",
    qty: 1,
    price: 50,
    discount: 0,
    paymentMode: "UPI (Google Pay)",
    attendant: "Counter Staff",
  });
  const [posSearch, setPosSearch] = useState("");
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (flowerDropdownRef.current && !flowerDropdownRef.current.contains(event.target)) {
        setShowFlowerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LOAD MASTER DATA & RECORDS FROM BACKEND
  const loadBackendData = async () => {
    try {
      // 1. Flowers
      const flowersRes = await fetch("https://flowra-backend-1.onrender.com/api/flowers");
      if (flowersRes.ok) {
        const flowerData = await flowersRes.json();
        setFlowers(flowerData);
      }

      // 2. Suppliers
      const suppliersRes = await fetch("https://flowra-backend-1.onrender.com/api/suppliers");
      if (suppliersRes.ok) {
        const supplierData = await suppliersRes.json();
        setSuppliers(supplierData);
      }

      // 3. Categories
      const categoriesRes = await fetch("https://flowra-backend-1.onrender.com/api/categories");
      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        setCategories(catData);
      }

      // 4. Purchases (Wholesale Inward History)
      const purchasesRes = await fetch("https://flowra-backend-1.onrender.com/api/purchases");
      if (purchasesRes.ok) {
        const purchaseData = await purchasesRes.json();
        const mappedPurchases = purchaseData.map((p) => ({
          id: p.purchaseCode || `WS-2026-${p.id}`,
          dbId: p.id,
          date: p.purchaseDate
            ? new Date(p.purchaseDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
            : "Today",
          supplier: p.supplierName,
          item: p.flowerName,
          category: p.categoryName || "General",
          quantity: p.quantity,
          unitCost: Number(p.unitCost),
          totalCost: Number(p.totalCost),
          retailPrice: Number(p.retailPrice),
          grade: p.grade,
          notes: p.notes,
        }));
        setWholesaleList(mappedPurchases);
      }

      // 5. Sales (POS In-person history)
      const salesRes = await fetch("https://flowra-backend-1.onrender.com/api/sales");
      if (salesRes.ok) {
        const salesData = await salesRes.json();
        const mappedSales = salesData.map((s) => ({
          id: s.receiptNumber || `POS-${s.id}`,
          dbId: s.id,
          date: s.saleTime
            ? new Date(s.saleTime).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Today",
          customer: s.customerName,
          phone: s.customerPhone,
          item: s.flowerName,
          category: s.categoryName || "Floral",
          qty: s.quantity,
          price: Number(s.unitPrice),
          discount: Number(s.discountAmount),
          total: Number(s.totalAmount),
          paymentMode: s.paymentMode,
          attendant: s.attendantName,
          saleType: s.saleType,
        }));
        setOfflineSales(mappedSales);
      }
    } catch (err) {
      console.warn("Error loading master data from backend:", err);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Filtered flower list for searchable dropdown in wholesale purchase form
  const searchableFlowers = useMemo(() => {
    if (!flowerSearchTerm.trim()) return flowers;
    const term = flowerSearchTerm.toLowerCase();
    return flowers.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        (f.categoryName && f.categoryName.toLowerCase().includes(term)) ||
        (f.sku && f.sku.toLowerCase().includes(term))
    );
  }, [flowers, flowerSearchTerm]);

  // Handle selecting a flower in wholesale form
  const handleSelectFlower = (flw) => {
    setWholesaleForm({
      ...wholesaleForm,
      flowerId: flw.id,
      flowerName: flw.name,
      retailPrice: flw.price || "",
    });
    setFlowerSearchTerm(flw.name);
    setShowFlowerDropdown(false);
  };

  // Handle Image Upload for "Add New Flower" modal
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewFlowerForm((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit "Add New Flower" modal
  const handleCreateNewFlower = async (e) => {
    e.preventDefault();
    if (!newFlowerForm.name.trim()) {
      alert("Please provide a Flower Name");
      return;
    }

    setIsSavingFlower(true);
    try {
      const payload = {
        name: newFlowerForm.name.trim(),
        categoryId: newFlowerForm.categoryId ? Number(newFlowerForm.categoryId) : null,
        categoryName: newFlowerForm.categoryName.trim() || undefined,
        price: newFlowerForm.price ? parseFloat(newFlowerForm.price) : 50,
        imageUrl: newFlowerForm.imageUrl || "/src/assets/pictures/flowers1.jpg",
      };

      const res = await fetch("https://flowra-backend-1.onrender.com/api/flowers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to register new flower");
      }

      const createdFlower = await res.json();
      setFlowers((prev) => [createdFlower, ...prev]);

      // Automatically select newly created flower in the wholesale form
      handleSelectFlower(createdFlower);

      // Reset modal form & close
      setNewFlowerForm({ name: "", categoryId: "", categoryName: "", price: "", imageUrl: "" });
      setImagePreview(null);
      setShowAddFlowerModal(false);
      showToast(`🌸 "${createdFlower.name}" registered in Flower Catalog & selected!`);
    } catch (err) {
      alert(`Error registering flower: ${err.message}`);
    } finally {
      setIsSavingFlower(false);
    }
  };

  // SUBMIT WHOLESALE PURCHASE ENTRY
  const handleAddWholesale = async (e) => {
    e.preventDefault();
    if (!wholesaleForm.flowerName) {
      alert("Please select or search a flower item.");
      return;
    }
    if (!wholesaleForm.supplierName && !wholesaleForm.supplierId) {
      alert("Please select or enter a supplier / vendor name.");
      return;
    }
    if (!wholesaleForm.quantity || Number(wholesaleForm.quantity) <= 0) {
      alert("Please enter a valid quantity greater than 0.");
      return;
    }
    if (!wholesaleForm.unitCost || Number(wholesaleForm.unitCost) < 0) {
      alert("Please enter a valid unit cost rate.");
      return;
    }

    const qty = parseInt(wholesaleForm.quantity, 10);
    const unit = parseFloat(wholesaleForm.unitCost);
    const retail = parseFloat(wholesaleForm.retailPrice || unit * 2.2);

    try {
      const payload = {
        flowerId: wholesaleForm.flowerId ? Number(wholesaleForm.flowerId) : null,
        flowerName: wholesaleForm.flowerName,
        supplierId: wholesaleForm.supplierId ? Number(wholesaleForm.supplierId) : null,
        supplierName: wholesaleForm.supplierName,
        quantity: qty,
        unitCost: unit,
        retailPrice: retail,
        grade: wholesaleForm.grade,
        notes: wholesaleForm.notes || "Fresh wholesale stock received and verified.",
        purchaseDate: wholesaleForm.purchaseDate || new Date().toISOString().split("T")[0],
      };

      const res = await fetch("https://flowra-backend-1.onrender.com/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to record wholesale purchase");
      }

      const saved = await res.json();
      const newRecord = {
        id: saved.purchaseCode || `WS-2026-${saved.id}`,
        dbId: saved.id,
        date: saved.purchaseDate
          ? new Date(saved.purchaseDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
          : "Today",
        supplier: saved.supplierName,
        item: saved.flowerName,
        category: saved.categoryName || "General",
        quantity: saved.quantity,
        unitCost: Number(saved.unitCost),
        totalCost: Number(saved.totalCost),
        retailPrice: Number(saved.retailPrice),
        grade: saved.grade,
        notes: saved.notes,
      };

      setWholesaleList((prev) => [newRecord, ...prev]);

      // Reset form
      setWholesaleForm({
        flowerId: "",
        flowerName: "",
        supplierId: "",
        supplierName: "",
        quantity: "",
        unitCost: "",
        retailPrice: "",
        grade: "Grade A+ (Cold-Chain Stored)",
        notes: "",
        purchaseDate: new Date().toISOString().split("T")[0],
      });
      setFlowerSearchTerm("");

      // Refresh master flower list so updated available count displays instantly
      loadBackendData();
      showToast(`Inbound recorded! +${qty} stems added from ${newRecord.supplier} 🌿`);
    } catch (err) {
      alert(`Error recording purchase: ${err.message}`);
    }
  };

  // IN-STORE (POS) SALES: Flowers available for selected category
  const availablePosFlowers = useMemo(() => {
    let list = flowers;
    if (posCategoryFilter !== "All") {
      list = list.filter((f) => f.categoryName === posCategoryFilter);
    }
    return list;
  }, [flowers, posCategoryFilter]);

  // Handle Flower Selection in POS Form
  const handleSelectPosFlower = (flowerId) => {
    const selected = flowers.find((f) => String(f.id) === String(flowerId));
    if (selected) {
      setPosForm((prev) => ({
        ...prev,
        flowerId: selected.id,
        flowerName: selected.name,
        price: selected.price || 50,
      }));
    }
  };

  // Currently selected flower for POS form validation
  const currentPosFlower = useMemo(() => {
    if (!posForm.flowerId) return flowers[0] || null;
    return flowers.find((f) => String(f.id) === String(posForm.flowerId)) || null;
  }, [flowers, posForm.flowerId]);

  // SUBMIT IN-STORE (POS) SALE WITH LIVE STOCK DEDUCTION
  const handleRecordPosSale = async (e) => {
    e.preventDefault();

    if (!currentPosFlower) {
      alert("Please select a flower to sell.");
      return;
    }

    const qty = parseInt(posForm.qty, 10) || 1;
    const available = currentPosFlower.availableStock || 0;

    if (qty > available) {
      alert(`⚠️ Insufficient stock for ${currentPosFlower.name}: only ${available} stems available.`);
      return;
    }

    const price = parseFloat(posForm.price) || 0;
    const discount = parseFloat(posForm.discount) || 0;
    const grandTotal = Math.max(0, qty * price - discount);

    setIsSubmittingSale(true);
    try {
      const payload = {
        flowerId: currentPosFlower.id,
        flowerName: currentPosFlower.name,
        quantity: qty,
        unitPrice: price,
        discountAmount: discount,
        totalAmount: grandTotal,
        paymentMode: posForm.paymentMode,
        customerName: posForm.customer.trim() || "Walk-in Guest",
        customerPhone: posForm.phone.trim() || "Not provided",
        attendantName: posForm.attendant.trim() || "Counter Staff",
        saleType: "POS",
      };

      const res = await fetch("https://flowra-backend-1.onrender.com/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to record sale");
      }

      const saved = await res.json();
      const newSale = {
        id: saved.receiptNumber || `POS-${saved.id}`,
        dbId: saved.id,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        customer: saved.customerName,
        phone: saved.customerPhone,
        item: saved.flowerName,
        category: saved.categoryName,
        qty: saved.quantity,
        price: Number(saved.unitPrice),
        discount: Number(saved.discountAmount),
        total: Number(saved.totalAmount),
        paymentMode: saved.paymentMode,
        attendant: saved.attendantName,
        saleType: "POS",
      };

      setOfflineSales((prev) => [newSale, ...prev]);
      setActiveReceipt(newSale);

      // Reset form
      setPosForm((prev) => ({
        ...prev,
        customer: "",
        phone: "",
        qty: 1,
        discount: 0,
      }));

      // Reload backend master data to reflect immediate stock deduction
      loadBackendData();
      showToast(`Sale recorded! ₹${grandTotal} received via ${newSale.paymentMode} 🌸`);
    } catch (err) {
      alert(`Error recording sale: ${err.message}`);
    } finally {
      setIsSubmittingSale(false);
    }
  };

  // CALCULATIONS FOR METRICS & ANALYTICS
  const totalWholesaleSpend = wholesaleList.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalWholesaleStems = wholesaleList.reduce((acc, curr) => acc + curr.quantity, 0);

  const totalOfflineRevenue = offlineSales.reduce((acc, curr) => acc + curr.total, 0);
  const totalOfflineOrders = offlineSales.length;

  const cashTotal = offlineSales
    .filter((s) => s.paymentMode.toLowerCase().includes("cash"))
    .reduce((acc, curr) => acc + curr.total, 0);

  const upiTotal = offlineSales
    .filter((s) => s.paymentMode.toLowerCase().includes("upi"))
    .reduce((acc, curr) => acc + curr.total, 0);

  const cardTotal = offlineSales
    .filter((s) => s.paymentMode.toLowerCase().includes("card"))
    .reduce((acc, curr) => acc + curr.total, 0);

  // Filtered lists
  const filteredWholesale = wholesaleList.filter(
    (w) =>
      w.item.toLowerCase().includes(wholesaleSearch.toLowerCase()) ||
      w.supplier.toLowerCase().includes(wholesaleSearch.toLowerCase()) ||
      w.id.toLowerCase().includes(wholesaleSearch.toLowerCase()) ||
      w.category.toLowerCase().includes(wholesaleSearch.toLowerCase())
  );

  const filteredSales = offlineSales.filter(
    (s) =>
      s.id.toLowerCase().includes(posSearch.toLowerCase()) ||
      s.customer.toLowerCase().includes(posSearch.toLowerCase()) ||
      s.item.toLowerCase().includes(posSearch.toLowerCase()) ||
      s.paymentMode.toLowerCase().includes(posSearch.toLowerCase())
  );

  return (
    <AdminLayout pageTitle="Wholesale Purchase & In-Person POS Management">
      {toastMessage && (
        <div className="admin-toast-feedback">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* TOP NAVIGATION TABS */}
      <div className="pos-tab-nav">
        <button
          type="button"
          className={`pos-tab-btn ${activeTab === "wholesale" ? "active" : ""}`}
          onClick={() => setActiveTab("wholesale")}
        >
          📦 Wholesale Purchase Entry &amp; Inflow
        </button>
        <button
          type="button"
          className={`pos-tab-btn ${activeTab === "pos" ? "active" : ""}`}
          onClick={() => setActiveTab("pos")}
        >
          🏷️ In-Person (POS) Sales Entry
        </button>
        <button
          type="button"
          className={`pos-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Flow &amp; Margin Analytics
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. WHOLESALE PROCUREMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === "wholesale" && (
        <div className="pos-sub-view">
          {/* WHOLESALE KPIS */}
          <div className="pos-kpi-row">
            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">💸</span>
              <div>
                <h4>₹{totalWholesaleSpend.toLocaleString("en-IN")}</h4>
                <p>Total Wholesale Inward Spend</p>
                <small>{wholesaleList.length} recorded shipments</small>
              </div>
            </div>

            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">🌿</span>
              <div>
                <h4>{totalWholesaleStems.toLocaleString("en-IN")}</h4>
                <p>Total Stems &amp; Bunches Inwarded</p>
                <small>Restocked into live storage</small>
              </div>
            </div>

            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">🚚</span>
              <div>
                <h4>{suppliers.length || new Set(wholesaleList.map((w) => w.supplier)).size}</h4>
                <p>Registered Suppliers / Mandis</p>
                <small>Active partner network</small>
              </div>
            </div>
          </div>

          <div className="pos-grid-2col">
            {/* RECORD WHOLESALE INWARD FORM */}
            <div className="admin-card-panel">
              <div className="card-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3>📥 Wholesale Purchase Entry</h3>
                  <p>Record inbound stock arriving from growers and wholesale flower mandis</p>
                </div>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowAddFlowerModal(true)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  🌸 + Add New Flower
                </button>
              </div>

              <form onSubmit={handleAddWholesale} className="pos-form-grid">
                {/* SEARCHABLE FLOWER DROPDOWN */}
                <div className="form-field-group full-width" ref={flowerDropdownRef} style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label style={{ margin: 0 }}>Flower Name (Searchable Dropdown) *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddFlowerModal(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--admin-rose, #c75b87)",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      + Register Unlisted Flower
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Type to search flower name, category, or SKU..."
                    value={flowerSearchTerm}
                    onFocus={() => setShowFlowerDropdown(true)}
                    onChange={(e) => {
                      setFlowerSearchTerm(e.target.value);
                      setShowFlowerDropdown(true);
                      setWholesaleForm((prev) => ({
                        ...prev,
                        flowerName: e.target.value,
                        flowerId: "",
                      }));
                    }}
                    required
                  />

                  {showFlowerDropdown && (
                    <div
                      className="search-dropdown-list"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        background: "white",
                        border: "1px solid #ebd3cb",
                        borderRadius: 10,
                        maxHeight: 230,
                        overflowY: "auto",
                        boxShadow: "0 10px 30px rgba(54, 31, 38, 0.15)",
                      }}
                    >
                      {searchableFlowers.length === 0 ? (
                        <div style={{ padding: "12px 14px", color: "#785a65", fontSize: 13 }}>
                          No matching flower found.{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setNewFlowerForm((prev) => ({ ...prev, name: flowerSearchTerm }));
                              setShowAddFlowerModal(true);
                              setShowFlowerDropdown(false);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#c75b87",
                              fontWeight: 700,
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                          >
                            Add &quot;{flowerSearchTerm}&quot; as New Flower
                          </button>
                        </div>
                      ) : (
                        searchableFlowers.map((flw) => (
                          <div
                            key={flw.id}
                            onClick={() => handleSelectFlower(flw)}
                            style={{
                              padding: "10px 14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderBottom: "1px solid #f7ece8",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff8f5")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                          >
                            <div>
                              <strong style={{ color: "#361f26", display: "block" }}>{flw.name}</strong>
                              <small style={{ color: "#785a65" }}>
                                {flw.categoryName} • SKU: {flw.sku}
                              </small>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  background: (flw.availableStock || 0) > 10 ? "#e6f6ec" : "#fef3c7",
                                  color: (flw.availableStock || 0) > 10 ? "#166534" : "#92400e",
                                }}
                              >
                                Stock: {flw.availableStock || 0}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* SUPPLIER / VENDOR (CHOOSE REGISTERED) */}
                <div className="form-field-group">
                  <label htmlFor="wholesale-supplier-select">Supplier / Vendor (Choose Existing) *</label>
                  <select
                    id="wholesale-supplier-select"
                    value={wholesaleForm.supplierId}
                    onChange={(e) => {
                      const sel = suppliers.find((s) => String(s.id) === e.target.value);
                      setWholesaleForm({
                        ...wholesaleForm,
                        supplierId: e.target.value,
                        supplierName: sel ? sel.name : "",
                      });
                    }}
                  >
                    <option value="">-- Choose Registered Vendor --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.contactPerson || "Vendor"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* SUPPLIER / VENDOR (NEW OR OVERRIDE NAME) */}
                <div className="form-field-group">
                  <label htmlFor="wholesale-supplier-custom">Supplier / Vendor Name *</label>
                  <input
                    id="wholesale-supplier-custom"
                    type="text"
                    placeholder="e.g. Pune Rose Mandi Growers Co-op..."
                    value={wholesaleForm.supplierName}
                    onChange={(e) =>
                      setWholesaleForm({
                        ...wholesaleForm,
                        supplierName: e.target.value,
                        supplierId: "",
                      })
                    }
                    required
                  />
                </div>

                {/* QUANTITY PURCHASED */}
                <div className="form-field-group">
                  <label>Quantity Purchased (Stems / Units) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={wholesaleForm.quantity}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, quantity: e.target.value })}
                    required
                  />
                </div>

                {/* COST PRICE (PURCHASE RATE) */}
                <div className="form-field-group">
                  <label>Cost Price / Purchase Rate (₹) *</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="e.g. 18.00"
                    value={wholesaleForm.unitCost}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, unitCost: e.target.value })}
                    required
                  />
                </div>

                {/* RETAIL SELLING PRICE */}
                <div className="form-field-group">
                  <label>Target Retail Selling Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50.00"
                    value={wholesaleForm.retailPrice}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, retailPrice: e.target.value })}
                  />
                </div>

                {/* PURCHASE DATE */}
                <div className="form-field-group">
                  <label>Purchase Date *</label>
                  <input
                    type="date"
                    value={wholesaleForm.purchaseDate}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, purchaseDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Freshness Grade / Preservation</label>
                  <select
                    value={wholesaleForm.grade}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, grade: e.target.value })}
                  >
                    <option value="Grade A+ (Cold-Chain Stored)">Grade A+ (Cold-Chain Stored)</option>
                    <option value="Export Quality">Export Quality</option>
                    <option value="Fresh Morning Cut">Fresh Morning Cut</option>
                    <option value="Bud Stage (Long Shelf Life)">Bud Stage (Long Shelf Life)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Inspection Notes &amp; Batch Comments</label>
                  <input
                    type="text"
                    placeholder="e.g. Firm heads, vibrant color, 10-day vase expectancy"
                    value={wholesaleForm.notes}
                    onChange={(e) => setWholesaleForm({ ...wholesaleForm, notes: e.target.value })}
                  />
                </div>

                {wholesaleForm.quantity && wholesaleForm.unitCost && (
                  <div className="cost-calc-preview full-width">
                    <span>Total Purchase Outlay:</span>
                    <strong>
                      ₹{(parseInt(wholesaleForm.quantity || 0) * parseFloat(wholesaleForm.unitCost || 0)).toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}

                <div className="form-actions-row full-width">
                  <button type="submit" className="admin-btn-primary">
                    ➕ Record Wholesale Inbound &amp; Update Stock
                  </button>
                </div>
              </form>
            </div>

            {/* WHOLESALE INWARD LEDGER TABLE */}
            <div className="admin-card-panel">
              <div className="card-panel-header with-search">
                <div>
                  <h3>📜 Wholesale Purchase History</h3>
                  <p>Inbound floral shipments with relational foreign keys</p>
                </div>
                <div className="panel-mini-search">
                  <input
                    type="text"
                    placeholder="Search wholesale records..."
                    value={wholesaleSearch}
                    onChange={(e) => setWholesaleSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-wrapper mini-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Batch ID &amp; Date</th>
                      <th>Supplier / Vendor</th>
                      <th>Flower Name</th>
                      <th>Inward Qty</th>
                      <th>Unit Cost</th>
                      <th>Total Outlay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWholesale.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="table-empty-row">No wholesale records found.</td>
                      </tr>
                    ) : (
                      filteredWholesale.map((w) => (
                        <tr key={w.id}>
                          <td>
                            <strong>{w.id}</strong>
                            <small className="date-subtext">{w.date}</small>
                          </td>
                          <td>
                            <strong>{w.supplier}</strong>
                          </td>
                          <td>
                            <strong>{w.item}</strong>
                            <span className="category-micro-tag">{w.category}</span>
                          </td>
                          <td>
                            <strong className="text-success">+{w.quantity} stems</strong>
                          </td>
                          <td>₹{w.unitCost}</td>
                          <td>
                            <strong>₹{w.totalCost.toLocaleString("en-IN")}</strong>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IN-PERSON (POS) SALES ENTRY TAB */}
      {/* ========================================================================= */}
      {activeTab === "pos" && (
        <div className="pos-sub-view">
          {/* POS KPIS */}
          <div className="pos-kpi-row">
            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">🏪</span>
              <div>
                <h4>₹{totalOfflineRevenue.toLocaleString("en-IN")}</h4>
                <p>In-Person Counter Revenue</p>
                <small>{totalOfflineOrders} counter sales recorded</small>
              </div>
            </div>

            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">💵</span>
              <div>
                <h4>₹{cashTotal.toLocaleString("en-IN")}</h4>
                <p>Cash at Counter</p>
                <small>Drawer cash float</small>
              </div>
            </div>

            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">📱</span>
              <div>
                <h4>₹{(upiTotal + cardTotal).toLocaleString("en-IN")}</h4>
                <p>Digital Payments</p>
                <small>UPI (₹{upiTotal}) • Cards (₹{cardTotal})</small>
              </div>
            </div>
          </div>

          <div className="pos-grid-2col">
            {/* COUNTER BILLING TERMINAL FORM */}
            <div className="admin-card-panel">
              <div className="card-panel-header">
                <h3>💐 In-Store (POS) Sales Entry</h3>
                <p>Record counter sales with immediate live stock deduction</p>
              </div>

              <form onSubmit={handleRecordPosSale} className="pos-form-grid">
                {/* CATEGORY FILTER */}
                <div className="form-field-group">
                  <label>Category Filter</label>
                  <select
                    value={posCategoryFilter}
                    onChange={(e) => {
                      setPosCategoryFilter(e.target.value);
                      const matching = e.target.value === "All"
                        ? flowers
                        : flowers.filter((f) => f.categoryName === e.target.value);
                      if (matching.length > 0) {
                        handleSelectPosFlower(matching[0].id);
                      }
                    }}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* FLOWER NAME (WITH LIVE STOCK STATUS) */}
                <div className="form-field-group">
                  <label>Flower Name (In-Stock Catalog) *</label>
                  <select
                    value={posForm.flowerId}
                    onChange={(e) => handleSelectPosFlower(e.target.value)}
                    required
                  >
                    {availablePosFlowers.map((f) => (
                      <option key={f.id} value={f.id} disabled={(f.availableStock || 0) <= 0}>
                        {f.name} — ({(f.availableStock || 0) > 0 ? `${f.availableStock} in stock` : "OUT OF STOCK"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* SELLING PRICE */}
                <div className="form-field-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={posForm.price}
                    onChange={(e) => setPosForm({ ...posForm, price: e.target.value })}
                    required
                  />
                </div>

                {/* QUANTITY SOLD WITH LIVE VALIDATION */}
                <div className="form-field-group">
                  <label>Quantity Sold *</label>
                  <input
                    type="number"
                    min="1"
                    max={currentPosFlower?.availableStock || 9999}
                    value={posForm.qty}
                    onChange={(e) => setPosForm({ ...posForm, qty: e.target.value })}
                    required
                  />
                  {currentPosFlower && (
                    <small
                      style={{
                        display: "block",
                        marginTop: 4,
                        color: (posForm.qty > (currentPosFlower.availableStock || 0)) ? "#dc2626" : "#166534",
                        fontWeight: 600,
                      }}
                    >
                      {posForm.qty > (currentPosFlower.availableStock || 0)
                        ? `⚠️ Exceeds stock! Only ${currentPosFlower.availableStock || 0} stems available.`
                        : `✓ Available stock: ${currentPosFlower.availableStock || 0} stems`}
                    </small>
                  )}
                </div>

                {/* DISCOUNT GIVEN */}
                <div className="form-field-group">
                  <label>Discount Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={posForm.discount}
                    onChange={(e) => setPosForm({ ...posForm, discount: e.target.value })}
                  />
                </div>

                {/* PAYMENT METHOD */}
                <div className="form-field-group">
                  <label>Payment Method *</label>
                  <select
                    value={posForm.paymentMode}
                    onChange={(e) => setPosForm({ ...posForm, paymentMode: e.target.value })}
                  >
                    <option value="Cash">Cash at Counter</option>
                    <option value="UPI (Google Pay)">UPI (Google Pay)</option>
                    <option value="UPI (PhonePe / Paytm)">UPI (PhonePe / Paytm)</option>
                    <option value="Credit Card (HDFC POS)">Credit Card (HDFC POS)</option>
                    <option value="Debit Card">Debit Card</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Walk-in Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Meera Sen / Walk-in Guest"
                    value={posForm.customer}
                    onChange={(e) => setPosForm({ ...posForm, customer: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label>Customer Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98200 00000"
                    value={posForm.phone}
                    onChange={(e) => setPosForm({ ...posForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-field-group full-width">
                  <label>Attendant / Counter Lead</label>
                  <input
                    type="text"
                    value={posForm.attendant}
                    onChange={(e) => setPosForm({ ...posForm, attendant: e.target.value })}
                  />
                </div>

                <div className="cost-calc-preview full-width highlight-green">
                  <span>Net Payable Total:</span>
                  <strong>
                    ₹{Math.max(
                      0,
                      (parseInt(posForm.qty || 1, 10) * parseFloat(posForm.price || 0)) -
                        parseFloat(posForm.discount || 0)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="form-actions-row full-width">
                  <button
                    type="submit"
                    className="admin-btn-primary"
                    disabled={
                      isSubmittingSale ||
                      !currentPosFlower ||
                      (currentPosFlower.availableStock || 0) <= 0 ||
                      posForm.qty > (currentPosFlower.availableStock || 0)
                    }
                  >
                    {isSubmittingSale ? "Processing Sale & Deducting Stock..." : "🧾 Complete Sale & Deduct Live Stock"}
                  </button>
                </div>
              </form>
            </div>

            {/* POS SALES AUDIT TABLE */}
            <div className="admin-card-panel">
              <div className="card-panel-header with-search">
                <div>
                  <h3>🧾 Sales History (In-Store &amp; Online)</h3>
                  <p>Transactions synced with real-time stock deductions</p>
                </div>
                <div className="panel-mini-search">
                  <input
                    type="text"
                    placeholder="Search sales..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-wrapper mini-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Receipt &amp; Date</th>
                      <th>Customer</th>
                      <th>Flower / Item</th>
                      <th>Qty Sold</th>
                      <th>Total Paid</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="table-empty-row">No sales recorded.</td>
                      </tr>
                    ) : (
                      filteredSales.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.id}</strong>
                            <small className="date-subtext">{s.date}</small>
                          </td>
                          <td>
                            <strong>{s.customer}</strong>
                            <small className="date-subtext">{s.paymentMode}</small>
                          </td>
                          <td>
                            <strong>{s.item}</strong>
                          </td>
                          <td>
                            <strong className="text-danger">-{s.qty} stems</strong>
                          </td>
                          <td>
                            <strong>₹{s.total.toLocaleString("en-IN")}</strong>
                          </td>
                          <td>
                            <span
                              className={`category-micro-tag ${s.saleType === "ONLINE" ? "online-tag" : ""}`}
                              style={{
                                background: s.saleType === "ONLINE" ? "#e0e7ff" : "#fef3c7",
                                color: s.saleType === "ONLINE" ? "#3730a3" : "#92400e",
                              }}
                            >
                              {s.saleType || "POS"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FLOW & MARGIN ANALYTICS TAB */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="pos-sub-view">
          <div className="pos-kpi-row">
            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">📈</span>
              <div>
                <h4>
                  ₹{Math.max(0, totalOfflineRevenue - (totalWholesaleSpend * 0.4)).toLocaleString("en-IN")}
                </h4>
                <p>Gross Realized Profit</p>
                <small>Calculated from stock sales</small>
              </div>
            </div>

            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">📦</span>
              <div>
                <h4>
                  {Math.max(0, totalWholesaleStems - offlineSales.reduce((acc, s) => acc + s.qty, 0))}
                </h4>
                <p>Total Available Stem Stock</p>
                <small>Sum of Inflow - Outflow</small>
              </div>
            </div>

            <div className="pos-kpi-card">
              <span className="pos-kpi-icon">✨</span>
              <div>
                <h4>
                  {totalWholesaleStems > 0
                    ? Math.round((offlineSales.reduce((acc, s) => acc + s.qty, 0) / totalWholesaleStems) * 100)
                    : 0}%
                </h4>
                <p>Inventory Turnover Rate</p>
                <small>High velocity seasonal blooms</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* "ADD NEW FLOWER" MODAL */}
      {/* ========================================================================= */}
      {showAddFlowerModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddFlowerModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: "0 0 16px", borderBottom: "1px solid #ebd3cb" }}>
              <div>
                <span className="drawer-eyebrow">CATALOG REGISTRATION</span>
                <h2>🌸 Add New Flower to Master Catalog</h2>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowAddFlowerModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewFlower} className="modal-form-scroll" style={{ padding: "16px 0" }}>
              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label>Flower Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dutch Scarlet Long-Stem Rose, White Calla Lily"
                  value={newFlowerForm.name}
                  onChange={(e) => setNewFlowerForm({ ...newFlowerForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label>Category *</label>
                <select
                  value={newFlowerForm.categoryId}
                  onChange={(e) => {
                    const sel = categories.find((c) => String(c.id) === e.target.value);
                    setNewFlowerForm({
                      ...newFlowerForm,
                      categoryId: e.target.value,
                      categoryName: sel ? sel.name : "",
                    });
                  }}
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label>Target Retail Selling Price (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="e.g. 50.00"
                  value={newFlowerForm.price}
                  onChange={(e) => setNewFlowerForm({ ...newFlowerForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label>Image Upload Option</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{ padding: 6 }}
                />
                {imagePreview && (
                  <div style={{ marginTop: 10, textAlign: "center" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 12, border: "2px solid #ebd3cb" }}
                    />
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#785a65" }}>Selected Image Preview</p>
                  </div>
                )}
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowAddFlowerModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={isSavingFlower}
                >
                  {isSavingFlower ? "Saving to Database..." : "✓ Register Flower & Select"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE RECEIPT MODAL */}
      {/* ========================================================================= */}
      {activeReceipt && (
        <div className="admin-modal-backdrop" onClick={() => setActiveReceipt(null)}>
          <div className="admin-receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <div className="receipt-logo">🌸 FLOWRA</div>
              <p>Artisanal Florist &amp; Botanical Studio</p>
              <small>Flagship Boutique: Worli Sea Face, Mumbai - 400018</small>
              <small>GSTIN: 27AABCF4920L1Z8 • Phone: +91 98765 43210</small>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-meta-grid">
              <div>
                <span>Receipt No:</span>
                <strong>{activeReceipt.id}</strong>
              </div>
              <div>
                <span>Date &amp; Time:</span>
                <strong>{activeReceipt.date}</strong>
              </div>
              <div>
                <span>Customer:</span>
                <strong>{activeReceipt.customer}</strong>
              </div>
              <div>
                <span>Mobile:</span>
                <strong>{activeReceipt.phone}</strong>
              </div>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-items-table">
              <div className="receipt-row header">
                <span>Item</span>
                <span>Qty</span>
                <span>Rate</span>
                <span>Amount</span>
              </div>
              <div className="receipt-row">
                <span>{activeReceipt.item}</span>
                <span>{activeReceipt.qty}</span>
                <span>₹{activeReceipt.price}</span>
                <span>₹{(activeReceipt.qty * activeReceipt.price).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-totals-box">
              {activeReceipt.discount > 0 && (
                <div className="total-line">
                  <span>Special Discount:</span>
                  <span>-₹{activeReceipt.discount}</span>
                </div>
              )}
              <div className="total-line grand">
                <span>Net Total Paid:</span>
                <span>₹{activeReceipt.total.toLocaleString("en-IN")}</span>
              </div>
              <div className="total-line sub">
                <span>Payment Mode:</span>
                <strong>{activeReceipt.paymentMode}</strong>
              </div>
              <div className="total-line sub">
                <span>Boutique Attendant:</span>
                <strong>{activeReceipt.attendant}</strong>
              </div>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-footer">
              <p>🌸 Thank you for letting Flowra bloom with you! 🌸</p>
              <small>Keep in fresh cold water &amp; trim stems at 45° for lasting beauty.</small>
            </div>

            <div className="receipt-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setActiveReceipt(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Print Tax Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default WholesalePosManager;
