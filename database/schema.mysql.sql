-- ============================================================================
-- FLOWRA E-COMMERCE DATABASE SCHEMA (MySQL 8.0+ / MariaDB)
-- 
-- Relationships:
--   USERS ──┬── ADDRESSES
--           ├── CART ─── CART_ITEMS ─── PRODUCTS
--           ├── ORDERS ─── ORDER_ITEMS ─── PRODUCTS
--           │       │
--           │       └── PAYMENTS
--           ├── WISHLIST ─── PRODUCTS
--           ├── REVIEWS ─── PRODUCTS
--           └── ADMIN_ACTIVITY
--
--   CATEGORIES ─── PRODUCTS ──┬── PRODUCT_IMAGES
--                             └── INVENTORY
--
--   ORDERS ─── ORDER_TRACKING
-- ============================================================================

CREATE DATABASE IF NOT EXISTS flowra_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flowra_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin', 'florist_staff') NOT NULL DEFAULT 'customer',
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;


-- 2. ADDRESSES TABLE (Child of USERS)
CREATE TABLE IF NOT EXISTS addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL DEFAULT 'Mumbai',
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    pincode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    address_type ENUM('Home', 'Work', 'Other') NOT NULL DEFAULT 'Home',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_addresses_user_id (user_id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 3. CATEGORIES TABLE (Parent of PRODUCTS)
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categories_slug (slug),
    INDEX idx_categories_status (status)
) ENGINE=InnoDB;


-- 4. PRODUCTS TABLE (Child of CATEGORIES)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(50) NOT NULL UNIQUE,
    flower_type VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NULL,
    discount_percent INT DEFAULT 0,
    description TEXT,
    highlights JSON,
    care_instructions TEXT,
    popularity INT DEFAULT 0,
    status ENUM('Active', 'Draft', 'Archived', 'Low Stock') NOT NULL DEFAULT 'Active',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_category (category_id),
    INDEX idx_products_slug (slug),
    INDEX idx_products_status (status),
    INDEX idx_products_featured (is_featured),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- 5. PRODUCT_IMAGES TABLE (Child of PRODUCTS)
CREATE TABLE IF NOT EXISTS product_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_images_product (product_id),
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 6. INVENTORY TABLE (Child of PRODUCTS)
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL UNIQUE,
    current_stock INT NOT NULL DEFAULT 0,
    reserved_stock INT NOT NULL DEFAULT 0,
    min_threshold INT NOT NULL DEFAULT 10,
    last_restocked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_inventory_product (product_id),
    CONSTRAINT fk_inventory_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 7. CART TABLE (Child of USERS)
CREATE TABLE IF NOT EXISTS cart (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cart_user (user_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 8. CART_ITEMS TABLE (Child of CART and PRODUCTS)
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cart_product (cart_id, product_id),
    INDEX idx_cart_items_cart (cart_id),
    INDEX idx_cart_items_product (product_id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 9. ORDERS TABLE (Child of USERS)
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NULL,
    status ENUM('Pending', 'Processing', 'Arranging Blooms', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Processing',
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    promo_code VARCHAR(50),
    delivery_date DATE NOT NULL,
    delivery_slot VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    gift_message TEXT,
    occasion VARCHAR(50) DEFAULT 'Birthday',
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_number (order_number),
    INDEX idx_orders_status (status),
    INDEX idx_orders_placed_at (placed_at),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- 10. ORDER_ITEMS TABLE (Child of ORDERS and PRODUCTS)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    product_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- 11. PAYMENTS TABLE (Child of ORDERS)
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    payment_method ENUM('razorpay', 'cod', 'card', 'upi', 'netbanking') NOT NULL,
    payment_status ENUM('Pending', 'Authorized', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_razorpay (razorpay_payment_id),
    INDEX idx_payments_status (payment_status),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 12. ORDER_TRACKING TABLE (Child of ORDERS)
CREATE TABLE IF NOT EXISTS order_tracking (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    step_number INT NOT NULL,
    status_title VARCHAR(100) NOT NULL,
    status_description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    estimated_delivery_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_tracking_order (order_id),
    CONSTRAINT fk_order_tracking_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 13. WISHLIST TABLE (Child of USERS and PRODUCTS)
CREATE TABLE IF NOT EXISTS wishlist (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_wishlist (user_id, product_id),
    INDEX idx_wishlist_user (user_id),
    INDEX idx_wishlist_product (product_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 14. REVIEWS TABLE (Child of USERS and PRODUCTS)
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Hidden', 'Rejected') NOT NULL DEFAULT 'Approved',
    admin_reply TEXT,
    admin_replied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_status (status),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 15. ADMIN_ACTIVITY TABLE (Child of USERS)
CREATE TABLE IF NOT EXISTS admin_activity (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT UNSIGNED NULL,
    activity_type ENUM('online', 'offline_sale', 'expense', 'stock_inward', 'product_update', 'order_status_change', 'auth') NOT NULL,
    title VARCHAR(255) NOT NULL,
    detail TEXT,
    amount DECIMAL(10, 2) NULL,
    icon VARCHAR(10) DEFAULT '🌸',
    badge_class VARCHAR(50) DEFAULT 'badge-green',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_activity_created (created_at),
    INDEX idx_admin_activity_admin (admin_id),
    CONSTRAINT fk_admin_activity_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- USER-SIDE ADDITIONAL TABLES
-- ----------------------------------------------------------------------------

-- 16. CONTACT_MESSAGES TABLE (Customer inquiries from /contact)
CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    status ENUM('New', 'In Progress', 'Resolved', 'Archived') NOT NULL DEFAULT 'New',
    admin_reply TEXT NULL,
    replied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contact_user (user_id),
    INDEX idx_contact_status (status),
    INDEX idx_contact_email (email),
    CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- 17. DECORATION_INQUIRIES TABLE (Event styling quotes from /decoration)
CREATE TABLE IF NOT EXISTS decoration_inquiries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    client_name VARCHAR(150) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    event_type VARCHAR(100) NOT NULL DEFAULT 'wedding',
    venue_scale VARCHAR(50) NOT NULL DEFAULT 'medium',
    theme_color VARCHAR(50) NOT NULL DEFAULT 'blush',
    event_date DATE NULL,
    estimated_budget DECIMAL(10, 2) NULL,
    notes TEXT NULL,
    status ENUM('Pending', 'Consultation Scheduled', 'Quote Sent', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_decor_user (user_id),
    INDEX idx_decor_status (status),
    INDEX idx_decor_date (event_date),
    CONSTRAINT fk_decor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- 18. NEWSLETTER_SUBSCRIBERS TABLE (Email list from footer & homepage)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP NULL,
    INDEX idx_newsletter_email (email),
    INDEX idx_newsletter_active (is_active)
) ENGINE=InnoDB;


-- 19. PASSWORD_RESETS TABLE (OTP tokens from /forgot-password)
CREATE TABLE IF NOT EXISTS password_resets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pwd_email (email),
    INDEX idx_pwd_otp (otp_code)
) ENGINE=InnoDB;


-- ----------------------------------------------------------------------------
-- ADMIN-SIDE ADDITIONAL TABLES
-- ----------------------------------------------------------------------------

-- 20. COUPONS TABLE (Promo codes from /admin/coupons)
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('Percentage', 'Fixed Amount') NOT NULL DEFAULT 'Percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2) NULL,
    usage_limit INT NOT NULL DEFAULT 100,
    usage_count INT NOT NULL DEFAULT 0,
    status ENUM('Active', 'Disabled', 'Expired') NOT NULL DEFAULT 'Active',
    expiry_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_status (status)
) ENGINE=InnoDB;


-- 21. DAILY_EXPENSES TABLE (Daily florist petty cash & expenses from /admin/expenses)
CREATE TABLE IF NOT EXISTS daily_expenses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expense_code VARCHAR(50) UNIQUE,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(20) DEFAULT '💸',
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash from Drawer',
    spent_by VARCHAR(150) NOT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expenses_date (expense_date),
    INDEX idx_expenses_category (category)
) ENGINE=InnoDB;


-- 22. POS_SALES TABLE (Offline store counter sales from /admin/wholesale-pos)
CREATE TABLE IF NOT EXISTS pos_sales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(150) NOT NULL DEFAULT 'Walk-in Guest',
    customer_phone VARCHAR(20) NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash',
    attendant_name VARCHAR(150) NOT NULL DEFAULT 'Counter Staff',
    sale_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pos_receipt (receipt_number),
    INDEX idx_pos_time (sale_time)
) ENGINE=InnoDB;


-- 23. WHOLESALE_INWARD TABLE (Bulk flower mandi purchases from /admin/wholesale-pos)
CREATE TABLE IF NOT EXISTS wholesale_inward (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    record_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_name VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    retail_price DECIMAL(10, 2) NOT NULL,
    grade VARCHAR(100) DEFAULT 'Grade A',
    notes TEXT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wholesale_code (record_code),
    INDEX idx_wholesale_date (purchase_date)
) ENGINE=InnoDB;


-- 24. CHAT_CONVERSATIONS TABLE (Customer concierge threads from /admin/chat)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_avatar VARCHAR(50) DEFAULT '👤',
    is_online BOOLEAN NOT NULL DEFAULT false,
    unread_count INT NOT NULL DEFAULT 0,
    last_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chat_customer (customer_id),
    CONSTRAINT fk_chat_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- 25. CHAT_MESSAGES TABLE (Individual messages inside chat threads)
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender_type ENUM('customer', 'admin') NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_msg_conv (conversation_id),
    CONSTRAINT fk_chat_messages_conv FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 26. DELIVERY_ASSIGNMENTS TABLE (Fleet dispatch & temperature logs from /admin/delivery)
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    delivery_code VARCHAR(50) NOT NULL UNIQUE,
    order_id BIGINT UNSIGNED NULL,
    order_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_partner VARCHAR(150) NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    driver_phone VARCHAR(30) NULL,
    delivery_slot VARCHAR(100) NOT NULL,
    status ENUM('Assigned', 'Preparing', 'Out for Delivery', 'Delivered', 'Failed') NOT NULL DEFAULT 'Assigned',
    temperature_log VARCHAR(100) DEFAULT '15°C (Climate-Controlled)',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP NULL,
    INDEX idx_deliv_order (order_id),
    INDEX idx_deliv_status (status),
    CONSTRAINT fk_deliv_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- 27. NOTIFICATIONS TABLE (Admin operational alerts & warnings from /admin/notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    notification_type ENUM('order', 'stock', 'payment', 'system', 'customer') NOT NULL DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_read (is_read),
    INDEX idx_notif_type (notification_type)
) ENGINE=InnoDB;


-- 28. STORE_SETTINGS TABLE (Store configurations from /admin/settings)
CREATE TABLE IF NOT EXISTS store_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_group VARCHAR(50) NOT NULL DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_settings_key (setting_key),
    INDEX idx_settings_group (setting_group)
) ENGINE=InnoDB;
