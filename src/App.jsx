import { BrowserRouter, Routes, Route } from "react-router-dom";
import Web1 from "./web1.jsx";
import Login from "./login.jsx";
import CreateAccount from "./createAccount.jsx";
import ForgotPassword from "./forgotPassword.jsx";
import Purchase from "./purchase.jsx";
import Bouquets from "./bouquets.jsx";
import Decoration from "./decoration.jsx";
import About from "./about.jsx";
import Contact from "./contact.jsx";
import Orders from "./orders.jsx";
import OrderDetail from "./OrderDetail.jsx";
import ProductDetail from "./ProductDetail.jsx";
import LoginModal from "./LoginModal.jsx";

// ADMIN MODULE
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import OrdersManager from "./admin/OrdersManager.jsx";
import ProductsManager from "./admin/ProductsManager.jsx";
import CategoryManager from "./admin/CategoryManager.jsx";
import InventoryManager from "./admin/InventoryManager.jsx";
import CustomersManager from "./admin/CustomersManager.jsx";
import PaymentsManager from "./admin/PaymentsManager.jsx";
import DeliveryManager from "./admin/DeliveryManager.jsx";
import CouponsManager from "./admin/CouponsManager.jsx";
import ReviewsManager from "./admin/ReviewsManager.jsx";
import ReportsAnalytics from "./admin/ReportsAnalytics.jsx";
import DailyExpensesManager from "./admin/DailyExpensesManager.jsx";
import NotificationsManager from "./admin/NotificationsManager.jsx";
import AdminSettings from "./admin/AdminSettings.jsx";
import AdminProfile from "./admin/AdminProfile.jsx";
import WholesalePosManager from "./admin/WholesalePosManager.jsx";

import { CartProvider } from "./CartContext.jsx";
import { AdminAuthProvider } from "./admin/AdminAuthContext.jsx";

function App() {
  return (
    <AdminAuthProvider>
      <CartProvider>
        <BrowserRouter>
          <LoginModal />
          <Routes>
            {/* CUSTOMER STOREFRONT ROUTES */}
            <Route path="/" element={<Web1 />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/bouquets" element={<Bouquets />} />
            <Route path="/decoration" element={<Decoration />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/product/:productId" element={<ProductDetail />} />

            {/* ADMIN SUITE ROUTES */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<OrdersManager />} />
            <Route path="/admin/wholesale-pos" element={<WholesalePosManager />} />
            <Route path="/admin/products" element={<ProductsManager />} />
            <Route path="/admin/categories" element={<CategoryManager />} />
            <Route path="/admin/inventory" element={<InventoryManager />} />
            <Route path="/admin/customers" element={<CustomersManager />} />
            <Route path="/admin/payments" element={<PaymentsManager />} />
            <Route path="/admin/deliveries" element={<DeliveryManager />} />
            <Route path="/admin/coupons" element={<CouponsManager />} />
            <Route path="/admin/reviews" element={<ReviewsManager />} />
            <Route path="/admin/reports" element={<ReportsAnalytics />} />
            <Route path="/admin/expenses" element={<DailyExpensesManager />} />
            <Route path="/admin/notifications" element={<NotificationsManager />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />

            {/* FALLBACK REDIRECT */}
            <Route path="*" element={<Web1 />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AdminAuthProvider>
  );
}

export default App;
