-- ============================================================================
-- FLOWRA SEED DATA (INITIAL DATA FOR DEMO & TESTING)
-- ============================================================================

-- 1. USERS
INSERT INTO users (id, full_name, email, password_hash, phone, role, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Admin Florist', 'admin@flowra.com', '$2b$12$e8YQ3d.9q1bW5zH...samplehash', '+919876543210', 'admin', true),
    ('22222222-2222-2222-2222-222222222222', 'Eleanor Vance', 'eleanor@example.com', '$2b$12$e8YQ3d.9q1bW5zH...samplehash', '+919812345678', 'customer', true),
    ('33333333-3333-3333-3333-333333333333', 'Sophia Reynolds', 'sophia@example.com', '$2b$12$e8YQ3d.9q1bW5zH...samplehash', '+919823456789', 'customer', true)
ON CONFLICT (email) DO NOTHING;

-- 2. CATEGORIES
INSERT INTO categories (id, name, slug, description, status, display_order)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Roses', 'roses', 'Classic English, Dutch, and wild garden roses', 'Active', 1),
    ('c2222222-2222-2222-2222-222222222222', 'Jasmine', 'jasmine', 'Fresh morning harvested fragrant jasmine posies', 'Active', 2),
    ('c3333333-3333-3333-3333-333333333333', 'Tulips', 'tulips', 'Imported Dutch ruffled tulips in pastel hues', 'Active', 3),
    ('c4444444-4444-4444-4444-444444444444', 'Hibiscus', 'hibiscus', 'Tropical blooms for traditional & modern decor', 'Active', 4),
    ('c5555555-5555-5555-5555-555555555555', 'Lotus & Water Lilies', 'lotus', 'Sacred pink and white water blossoms', 'Active', 5),
    ('c6666666-6666-6666-6666-666666666666', 'Artisan Bouquets', 'bouquets', 'Hand-tied bouquets with luxury Italian wrap', 'Active', 6),
    ('c7777777-7777-7777-7777-777777777777', 'Exotic Botanicals', 'luxury', 'King proteas, orchids and architectural stems', 'Active', 7)
ON CONFLICT (slug) DO NOTHING;

-- 3. PRODUCTS
INSERT INTO products (id, category_id, name, slug, sku, flower_type, color, size, price, original_price, discount_percent, description, popularity, status, is_featured)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'c6666666-6666-6666-6666-666666666666', 'The Blush Romance Bouquet', 'the-blush-romance-bouquet', 'BQ-RAN-01', 'Ranunculus & Roses', 'Peach Blush', 'Large (24 Stems)', 1299.00, 1699.00, 23, 'Our bestselling signature masterpiece. Layered peach ranunculus, English David Austin roses, and aromatic eucalyptus in textured rose kraft wrap.', 100, 'Active', true),
    ('p2222222-2222-2222-2222-222222222222', 'c7777777-7777-7777-7777-777777777777', 'The Imperial Botanical Luxe', 'the-imperial-botanical-luxe', 'PROT-WHT-01', 'King Protea & Orchid', 'Snow White & Lilac', 'Deluxe Centerpiece', 2499.00, 3199.00, 22, 'South African white king protea flanked by cascading lilac phalaenopsis orchids and frosted dusty blue hydrangeas.', 98, 'Low Stock', true),
    ('p3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Premium Red Rose', 'premium-red-rose', 'ROS-RED-12', 'Single Stem & Bunch', 'Crimson Red', 'Single Stem', 50.00, 70.00, 28, 'Handpicked velvety Crimson Grand Prix roses sourced at dawn from organic hill estates.', 98, 'Active', false)
ON CONFLICT (sku) DO NOTHING;

-- 4. INVENTORY
INSERT INTO inventory (product_id, current_stock, reserved_stock, min_threshold)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 18, 4, 10),
    ('p2222222-2222-2222-2222-222222222222', 3, 2, 10),
    ('p3333333-3333-3333-3333-333333333333', 85, 15, 25)
ON CONFLICT (product_id) DO NOTHING;

-- 5. ADDRESSES
INSERT INTO addresses (user_id, recipient_name, recipient_phone, address_line1, address_line2, city, state, pincode, country, address_type, is_default)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'Eleanor Vance', '+919812345678', 'Flat 402, Lotus Residency', 'Bandra West', 'Mumbai', 'Maharashtra', '400050', 'India', 'Home', true);

-- 6. ORDERS
INSERT INTO orders (id, order_number, user_id, status, subtotal, discount_amount, delivery_fee, total_amount, promo_code, delivery_date, delivery_slot, recipient_name, recipient_phone, delivery_address, gift_message, occasion)
VALUES
    ('o1111111-1111-1111-1111-111111111111', 'FLW-839210', '22222222-2222-2222-2222-222222222222', 'Out for Delivery', 1299.00, 0.00, 0.00, 1299.00, NULL, CURRENT_DATE, 'Evening (5:00 PM - 9:00 PM)', 'Eleanor Vance', '+919812345678', 'Flat 402, Lotus Residency, Bandra West, Mumbai - 400050', 'Wishing you warmth, laughter, and fragrant blooms always! Happy Birthday!', 'Birthday')
ON CONFLICT (order_number) DO NOTHING;

-- 7. ORDER_ITEMS
INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, total_price)
VALUES
    ('o1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'The Blush Romance Bouquet', 1299.00, 1, 1299.00);

-- 8. PAYMENTS
INSERT INTO payments (order_id, payment_method, payment_status, amount, currency, razorpay_order_id, razorpay_payment_id, paid_at)
VALUES
    ('o1111111-1111-1111-1111-111111111111', 'razorpay', 'Paid', 1299.00, 'INR', 'order_Q1a89FkWzX82', 'pay_Q1a89FkWzX82', CURRENT_TIMESTAMP);

-- 9. ORDER_TRACKING (4 Tracking Stages)
INSERT INTO order_tracking (order_id, step_number, status_title, status_description, is_completed, completed_at, driver_name, driver_phone)
VALUES
    ('o1111111-1111-1111-1111-111111111111', 1, 'Order Confirmed', 'Received & verified by florist desk', true, CURRENT_TIMESTAMP - INTERVAL '3 hours', NULL, NULL),
    ('o1111111-1111-1111-1111-111111111111', 2, 'Arranging Blooms', 'Greenhouse master florists hand-tying stems', true, CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL, NULL),
    ('o1111111-1111-1111-1111-111111111111', 3, 'Out for Delivery', 'Dispatched in chilled temperature van', true, CURRENT_TIMESTAMP - INTERVAL '20 minutes', 'Ramesh Kumar', '+919876512345'),
    ('o1111111-1111-1111-1111-111111111111', 4, 'Delivered', 'Doorstep floral handover with care instructions', false, NULL, 'Ramesh Kumar', '+919876512345');

-- 10. REVIEWS
INSERT INTO reviews (user_id, product_id, author_name, rating, comment, status, admin_reply)
VALUES
    ('33333333-3333-3333-3333-333333333333', 'p1111111-1111-1111-1111-111111111111', 'Sophia Reynolds', 5, 'The King Protea and orchid bouquet was beyond breathtaking! Arrived pristine and lasted 10+ days.', 'Approved', 'Thank you from the Flowra Team! 🌸');

-- 11. ADMIN_ACTIVITY
INSERT INTO admin_activity (admin_id, activity_type, title, detail, amount, icon, badge_class)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'online', 'Online Order #FLW-839210', 'Eleanor Vance • The Blush Romance Bouquet', 1299.00, '🌐', 'badge-green'),
    ('11111111-1111-1111-1111-111111111111', 'expense', 'Tea & Snacks for Staff', 'Morning tea & biscuits for florist crew', -140.00, '☕', 'badge-amber');
