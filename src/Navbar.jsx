import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import { useState, useEffect } from "react";

function Navbar() {
  const { cartCount, wishlist, setIsCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("flowra_user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const checkUser = () => {
      try {
        setCurrentUser(JSON.parse(localStorage.getItem("flowra_user") || "null"));
      } catch {
        setCurrentUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("flowra_user");
    setCurrentUser(null);
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo" aria-label="Flowra Home">
        🌸 <span>FLOWRA</span>
      </Link>

      <nav className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <Link
          to="/"
          className={isActive("/") ? "active-link" : ""}
          onClick={() => setMobileMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          to="/#products"
          onClick={() => {
            setMobileMenuOpen(false);
            if (location.pathname === "/") {
              document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate("/#products");
            }
          }}
        >
          Flowers
        </Link>
        <Link
          to="/bouquets"
          className={isActive("/bouquets") ? "active-link" : ""}
          onClick={() => setMobileMenuOpen(false)}
        >
          Bouquets
        </Link>
        <Link
          to="/decoration"
          className={isActive("/decoration") ? "active-link" : ""}
          onClick={() => setMobileMenuOpen(false)}
        >
          Decoration
        </Link>
        <Link
          to="/orders"
          className={isActive("/orders") ? "active-link" : ""}
          onClick={() => setMobileMenuOpen(false)}
        >
          Orders
        </Link>
        <Link
          to="/about"
          className={isActive("/about") ? "active-link" : ""}
          onClick={() => setMobileMenuOpen(false)}
        >
          About Us
        </Link>
        <Link
          to="/contact"
          className={isActive("/contact") ? "active-link" : ""}
          onClick={() => setMobileMenuOpen(false)}
        >
          Contact
        </Link>
      </nav>

      <div className="nav-buttons">
        <button
          className="wishlist-nav-btn"
          type="button"
          onClick={() => setIsCartOpen(true)}
          title="Wishlist"
          aria-label="Wishlist"
        >
          ♡ {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
        </button>

        <button
          className="cart-btn"
          type="button"
          onClick={() => setIsCartOpen(true)}
          aria-label="Shopping Cart"
        >
          🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>

        {currentUser ? (
          <button
            className="login-btn logout-btn"
            type="button"
            onClick={handleLogout}
            title={currentUser.email ? `Logged in as ${currentUser.fullName || currentUser.email}` : "Logout"}
          >
            Logout
          </button>
        ) : (
          <button
            className="login-btn"
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}

        <button
          className="hamburger-btn"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
