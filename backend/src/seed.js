const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Vendor, Product, ProductImage, Address, Order, OrderItem, Payment, Review, Cart, CartItem, Coupon, Wishlist, Notification } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ force: false });

    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    // ── Users ──
    const users = await User.bulkCreate([
      { name: 'Admin User', email: 'admin@shopwave.com', password_hash: hashedPassword, role: 'admin', is_verified: true, phone: '+1-555-0100' },
      { name: 'John Vendor', email: 'vendor@shopwave.com', password_hash: hashedPassword, role: 'vendor', is_verified: true, phone: '+1-555-0101' },
      { name: 'Jane Customer', email: 'customer@shopwave.com', password_hash: hashedPassword, role: 'customer', is_verified: true, phone: '+1-555-0102' },
      { name: 'Bob Smith', email: 'bob@example.com', password_hash: hashedPassword, role: 'customer', is_verified: true, phone: '+1-555-0103' },
      { name: 'Alice Johnson', email: 'alice@example.com', password_hash: hashedPassword, role: 'customer', is_verified: false, phone: '+1-555-0104' },
      { name: 'Tech Vendor 2', email: 'vendor2@shopwave.com', password_hash: hashedPassword, role: 'vendor', is_verified: true, phone: '+1-555-0105' },
    ]);
    console.log(`Created ${users.length} users.`);

    // ── Categories ──
    const categories = await Category.bulkCreate([
      { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', is_active: true, sort_order: 1 },
      { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel', is_active: true, sort_order: 2 },
      { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home appliances and kitchenware', is_active: true, sort_order: 3 },
      { name: 'Books', slug: 'books', description: 'Books and magazines', is_active: true, sort_order: 4 },
      { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear', is_active: true, sort_order: 5 },
      { name: 'Mobile Phones', slug: 'mobile-phones', description: 'Smartphones and accessories', parent_id: null, is_active: true, sort_order: 1 },
      { name: 'Laptops', slug: 'laptops', description: 'Laptops and notebooks', parent_id: null, is_active: true, sort_order: 2 },
      { name: "Men's Clothing", slug: 'mens-clothing', description: "Men's fashion", parent_id: null, is_active: true, sort_order: 1 },
      { name: "Women's Clothing", slug: 'womens-clothing', description: "Women's fashion", parent_id: null, is_active: true, sort_order: 2 },
    ]);

    // Set parent-child relationships
    await categories[5].update({ parent_id: categories[0].id }); // Mobile Phones -> Electronics
    await categories[6].update({ parent_id: categories[0].id }); // Laptops -> Electronics
    await categories[7].update({ parent_id: categories[1].id }); // Men's Clothing -> Clothing
    await categories[8].update({ parent_id: categories[1].id }); // Women's Clothing -> Clothing

    console.log(`Created ${categories.length} categories.`);

    // ── Vendors ──
    const vendors = await Vendor.bulkCreate([
      { user_id: users[1].id, store_name: 'TechStore', slug: 'techstore', description: 'Your one-stop shop for all things tech', commission_rate: 8.00, is_verified: true, contact_email: 'vendor@shopwave.com', contact_phone: '+1-555-0101', address: { street: '123 Tech Blvd', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US' } },
      { user_id: users[5].id, store_name: 'FashionHub', slug: 'fashionhub', description: 'Trendy fashion for everyone', commission_rate: 10.00, is_verified: true, contact_email: 'vendor2@shopwave.com', contact_phone: '+1-555-0105', address: { street: '456 Style Ave', city: 'New York', state: 'NY', postal_code: '10001', country: 'US' } },
    ]);
    console.log(`Created ${vendors.length} vendors.`);

    // ── Products ──
    const products = await Product.bulkCreate([
      { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', description: 'Apple iPhone 15 Pro with A17 Pro chip, 48MP camera system, and titanium design.', price: 999.99, compare_price: 1099.99, cost_price: 750.00, stock_qty: 50, sku: 'APP-IP15P-256', is_featured: true, is_active: true, weight: 0.21, category_id: categories[5].id, vendor_id: vendors[0].id },
      { name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', description: 'Samsung Galaxy S24 Ultra with built-in S Pen, Galaxy AI, and 200MP camera.', price: 1199.99, compare_price: 1299.99, cost_price: 900.00, stock_qty: 35, sku: 'SAM-GS24U-512', is_featured: true, is_active: true, weight: 0.23, category_id: categories[5].id, vendor_id: vendors[0].id },
      { name: 'MacBook Air M3', slug: 'macbook-air-m3', description: 'Apple MacBook Air with M3 chip, 15.3-inch Liquid Retina display, 18GB RAM.', price: 1299.99, compare_price: 1499.99, cost_price: 1000.00, stock_qty: 25, sku: 'APP-MBA-M3-15', is_featured: true, is_active: true, weight: 1.51, category_id: categories[6].id, vendor_id: vendors[0].id },
      { name: 'Dell XPS 16', slug: 'dell-xps-16', description: 'Dell XPS 16 with Intel Core Ultra 9, 32GB RAM, 1TB SSD, OLED display.', price: 1899.99, cost_price: 1450.00, stock_qty: 15, sku: 'DELL-XPS16-U9', is_featured: false, is_active: true, weight: 1.80, category_id: categories[6].id, vendor_id: vendors[0].id },
      { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Sony WH-1000XM5 wireless noise-canceling headphones with 30-hour battery life.', price: 349.99, compare_price: 399.99, cost_price: 250.00, stock_qty: 100, sku: 'SONY-WH1000XM5', is_featured: true, is_active: true, weight: 0.25, category_id: categories[0].id, vendor_id: vendors[0].id },
      { name: 'Men\'s Classic Fit Polo Shirt', slug: 'mens-classic-polo', description: 'Classic fit cotton polo shirt. Available in multiple colors.', price: 49.99, compare_price: 69.99, cost_price: 25.00, stock_qty: 200, sku: 'FH-MPOLO-001', is_featured: true, is_active: true, weight: 0.30, category_id: categories[7].id, vendor_id: vendors[1].id },
      { name: 'Women\'s Floral Summer Dress', slug: 'womens-floral-dress', description: 'Beautiful floral print summer dress with adjustable straps.', price: 79.99, compare_price: 99.99, cost_price: 40.00, stock_qty: 150, sku: 'FH-WDRESS-002', is_featured: true, is_active: true, weight: 0.35, category_id: categories[8].id, vendor_id: vendors[1].id },
      { name: 'Premium Leather Wallet', slug: 'premium-leather-wallet', description: 'Handcrafted genuine leather wallet with RFID protection.', price: 39.99, cost_price: 20.00, stock_qty: 300, sku: 'FH-WALLET-003', is_featured: false, is_active: true, weight: 0.10, category_id: categories[7].id, vendor_id: vendors[1].id },
      { name: 'Stainless Steel Water Bottle', slug: 'stainless-water-bottle', description: '32oz double-wall insulated stainless steel water bottle. Keeps drinks cold for 24h.', price: 34.99, compare_price: 44.99, cost_price: 15.00, stock_qty: 500, sku: 'HK-BOTTLE-001', is_featured: false, is_active: true, weight: 0.40, category_id: categories[2].id, vendor_id: vendors[0].id },
      { name: 'Non-Stick Cooking Pan Set', slug: 'non-stick-pan-set', description: '5-piece non-stick aluminum cookware set with heat-resistant handles.', price: 89.99, compare_price: 129.99, cost_price: 50.00, stock_qty: 80, sku: 'HK-PANSET-002', is_featured: false, is_active: true, weight: 3.50, category_id: categories[2].id, vendor_id: vendors[1].id },
      { name: 'Wireless Bluetooth Earbuds', slug: 'wireless-bluetooth-earbuds', description: 'True wireless earbuds with active noise cancellation and 24h battery life.', price: 79.99, compare_price: 99.99, cost_price: 40.00, stock_qty: 250, sku: 'APP-AIRPODS-PRO', is_featured: false, is_active: true, weight: 0.05, category_id: categories[0].id, vendor_id: vendors[0].id },
      { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: 'Extra thick premium yoga mat with non-slip surface. Includes carrying strap.', price: 29.99, cost_price: 12.00, stock_qty: 400, sku: 'SP-YOGA-001', is_featured: false, is_active: true, weight: 1.20, category_id: categories[4].id, vendor_id: vendors[1].id },
    ]);
    console.log(`Created ${products.length} products.`);

    // ── Product Images ──
    const productImages = await ProductImage.bulkCreate([
      { product_id: products[0].id, image_url: 'https://picsum.photos/seed/iphone15/800/800', alt_text: 'iPhone 15 Pro Front View', is_primary: true, sort_order: 0 },
      { product_id: products[0].id, image_url: 'https://picsum.photos/seed/iphone15b/800/800', alt_text: 'iPhone 15 Pro Back View', is_primary: false, sort_order: 1 },
      { product_id: products[1].id, image_url: 'https://picsum.photos/seed/galaxys24/800/800', alt_text: 'Samsung Galaxy S24 Ultra', is_primary: true, sort_order: 0 },
      { product_id: products[2].id, image_url: 'https://picsum.photos/seed/macbookair/800/800', alt_text: 'MacBook Air M3', is_primary: true, sort_order: 0 },
      { product_id: products[3].id, image_url: 'https://picsum.photos/seed/dellxps/800/800', alt_text: 'Dell XPS 16', is_primary: true, sort_order: 0 },
      { product_id: products[4].id, image_url: 'https://picsum.photos/seed/sony1000xm5/800/800', alt_text: 'Sony WH-1000XM5 Headphones', is_primary: true, sort_order: 0 },
      { product_id: products[5].id, image_url: 'https://picsum.photos/seed/poloshirt/800/800', alt_text: "Men's Classic Fit Polo", is_primary: true, sort_order: 0 },
      { product_id: products[6].id, image_url: 'https://picsum.photos/seed/floraldress/800/800', alt_text: "Women's Floral Summer Dress", is_primary: true, sort_order: 0 },
      { product_id: products[7].id, image_url: 'https://picsum.photos/seed/leatherwallet/800/800', alt_text: 'Premium Leather Wallet', is_primary: true, sort_order: 0 },
      { product_id: products[8].id, image_url: 'https://picsum.photos/seed/waterbottle/800/800', alt_text: 'Stainless Steel Water Bottle', is_primary: true, sort_order: 0 },
      { product_id: products[9].id, image_url: 'https://picsum.photos/seed/cookware/800/800', alt_text: 'Non-Stick Cooking Pan Set', is_primary: true, sort_order: 0 },
      { product_id: products[10].id, image_url: 'https://picsum.photos/seed/earbuds/800/800', alt_text: 'Wireless Bluetooth Earbuds', is_primary: true, sort_order: 0 },
      { product_id: products[11].id, image_url: 'https://picsum.photos/seed/yogamat/800/800', alt_text: 'Premium Yoga Mat', is_primary: true, sort_order: 0 },
    ]);
    console.log(`Created ${productImages.length} product images.`);

    // ── Addresses ──
    const addresses = await Address.bulkCreate([
      { user_id: users[0].id, label: 'Office', street: '100 Admin Tower', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US', phone: '+1-555-0100', is_default: true, is_billing: true },
      { user_id: users[1].id, label: 'Office', street: '123 Tech Blvd', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US', phone: '+1-555-0101', is_default: true, is_billing: true },
      { user_id: users[2].id, label: 'Home', street: '456 Maple Street', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US', phone: '+1-555-0102', is_default: true, is_billing: true },
      { user_id: users[2].id, label: 'Work', street: '789 Business Park', city: 'Los Angeles', state: 'CA', postal_code: '90002', country: 'US', phone: '+1-555-0102', is_default: false, is_billing: false },
      { user_id: users[3].id, label: 'Home', street: '321 Oak Avenue', city: 'New York', state: 'NY', postal_code: '10001', country: 'US', phone: '+1-555-0103', is_default: true, is_billing: true },
      { user_id: users[4].id, label: 'Home', street: '654 Pine Road', city: 'Chicago', state: 'IL', postal_code: '60601', country: 'US', phone: '+1-555-0104', is_default: true, is_billing: true },
    ]);
    console.log(`Created ${addresses.length} addresses.`);

    // ── Orders ──
    const orders = await Order.bulkCreate([
      { order_number: 'ORD-2024-00001', user_id: users[2].id, status: 'delivered', total_amount: 1049.98, subtotal: 999.99, tax_amount: 80.00, shipping_amount: 0, discount_amount: 30.01, payment_status: 'completed', shipping_address: { street: '456 Maple Street', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US' }, billing_address: { street: '456 Maple Street', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US' }, tracking_number: '1Z999AA10123456784', shipped_at: new Date('2024-01-15'), delivered_at: new Date('2024-01-18') },
      { order_number: 'ORD-2024-00002', user_id: users[2].id, status: 'shipped', total_amount: 1299.99, subtotal: 1199.99, tax_amount: 96.00, shipping_amount: 4.00, discount_amount: 0, payment_status: 'completed', shipping_address: { street: '789 Business Park', city: 'Los Angeles', state: 'CA', postal_code: '90002', country: 'US' }, billing_address: { street: '456 Maple Street', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US' }, tracking_number: '1Z999AA10123456785', shipped_at: new Date('2024-02-20') },
      { order_number: 'ORD-2024-00003', user_id: users[3].id, status: 'processing', total_amount: 89.99, subtotal: 79.99, tax_amount: 6.40, shipping_amount: 3.60, discount_amount: 0, payment_status: 'completed', shipping_address: { street: '321 Oak Avenue', city: 'New York', state: 'NY', postal_code: '10001', country: 'US' }, billing_address: { street: '321 Oak Avenue', city: 'New York', state: 'NY', postal_code: '10001', country: 'US' } },
      { order_number: 'ORD-2024-00004', user_id: users[2].id, status: 'pending', total_amount: 34.99, subtotal: 34.99, tax_amount: 0, shipping_amount: 0, discount_amount: 0, payment_status: 'pending', shipping_address: { street: '456 Maple Street', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US' }, billing_address: { street: '456 Maple Street', city: 'Los Angeles', state: 'CA', postal_code: '90001', country: 'US' } },
      { order_number: 'ORD-2024-00005', user_id: users[0].id, status: 'cancelled', total_amount: 349.99, subtotal: 349.99, tax_amount: 28.00, shipping_amount: 0, discount_amount: 0, payment_status: 'refunded', shipping_address: { street: '100 Admin Tower', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US' }, billing_address: { street: '100 Admin Tower', city: 'San Francisco', state: 'CA', postal_code: '94105', country: 'US' }, cancelled_at: new Date('2024-03-01'), cancel_reason: 'Changed mind' },
      { order_number: 'ORD-2024-00006', user_id: users[4].id, status: 'confirmed', total_amount: 79.99, subtotal: 79.99, tax_amount: 6.40, shipping_amount: 0, discount_amount: 6.40, coupon_code: 'WELCOME10', payment_status: 'completed', shipping_address: { street: '654 Pine Road', city: 'Chicago', state: 'IL', postal_code: '60601', country: 'US' }, billing_address: { street: '654 Pine Road', city: 'Chicago', state: 'IL', postal_code: '60601', country: 'US' } },
    ]);
    console.log(`Created ${orders.length} orders.`);

    // ── Order Items ──
    const orderItems = await OrderItem.bulkCreate([
      { order_id: orders[0].id, product_id: products[0].id, product_name: products[0].name, product_sku: products[0].sku, quantity: 1, unit_price: 999.99, total_price: 999.99, image_url: 'https://picsum.photos/seed/iphone15/800/800' },
      { order_id: orders[1].id, product_id: products[1].id, product_name: products[1].name, product_sku: products[1].sku, quantity: 1, unit_price: 1199.99, total_price: 1199.99, image_url: 'https://picsum.photos/seed/galaxys24/800/800' },
      { order_id: orders[2].id, product_id: products[8].id, product_name: products[8].name, product_sku: products[8].sku, quantity: 2, unit_price: 34.99, total_price: 69.98, image_url: 'https://picsum.photos/seed/waterbottle/800/800' },
      { order_id: orders[2].id, product_id: products[7].id, product_name: products[7].name, product_sku: products[7].sku, quantity: 1, unit_price: 10.01, total_price: 10.01, image_url: 'https://picsum.photos/seed/leatherwallet/800/800' },
      { order_id: orders[3].id, product_id: products[8].id, product_name: products[8].name, product_sku: products[8].sku, quantity: 1, unit_price: 34.99, total_price: 34.99, image_url: 'https://picsum.photos/seed/waterbottle/800/800' },
      { order_id: orders[4].id, product_id: products[4].id, product_name: products[4].name, product_sku: products[4].sku, quantity: 1, unit_price: 349.99, total_price: 349.99, image_url: 'https://picsum.photos/seed/sony1000xm5/800/800' },
      { order_id: orders[5].id, product_id: products[6].id, product_name: products[6].name, product_sku: products[6].sku, quantity: 1, unit_price: 79.99, total_price: 79.99, image_url: 'https://picsum.photos/seed/floraldress/800/800' },
    ]);
    console.log(`Created ${orderItems.length} order items.`);

    // ── Payments ──
    const payments = await Payment.bulkCreate([
      { order_id: orders[0].id, gateway: 'stripe', transaction_id: 'pi_3P9Example1', amount: 1049.98, currency: 'USD', status: 'completed', gateway_response: { id: 'pi_3P9Example1', status: 'succeeded' }, paid_at: new Date('2024-01-10') },
      { order_id: orders[1].id, gateway: 'paypal', transaction_id: 'PAYID-EXAMPLE2', amount: 1299.99, currency: 'USD', status: 'completed', gateway_response: { id: 'PAYID-EXAMPLE2', status: 'completed' }, paid_at: new Date('2024-02-18') },
      { order_id: orders[2].id, gateway: 'stripe', transaction_id: 'pi_3P9Example3', amount: 89.99, currency: 'USD', status: 'completed', gateway_response: { id: 'pi_3P9Example3', status: 'succeeded' }, paid_at: new Date('2024-03-05') },
      { order_id: orders[4].id, gateway: 'razorpay', transaction_id: 'RAZORPAY-EX4', amount: 349.99, currency: 'USD', status: 'refunded', gateway_response: { id: 'RAZORPAY-EX4', status: 'refunded' }, paid_at: new Date('2024-02-28'), refunded_at: new Date('2024-03-01'), refund_amount: 349.99 },
      { order_id: orders[5].id, gateway: 'stripe', transaction_id: 'pi_3P9Example5', amount: 79.99, currency: 'USD', status: 'completed', gateway_response: { id: 'pi_3P9Example5', status: 'succeeded' }, paid_at: new Date('2024-03-10') },
    ]);
    console.log(`Created ${payments.length} payments.`);

    // ── Reviews ──
    const reviews = await Review.bulkCreate([
      { user_id: users[2].id, product_id: products[0].id, rating: 5, title: 'Amazing phone!', comment: 'The iPhone 15 Pro is incredible. The camera is a huge upgrade and the battery life is fantastic.', is_approved: true },
      { user_id: users[3].id, product_id: products[0].id, rating: 4, title: 'Great but expensive', comment: 'Love the phone but it is quite pricey. The titanium build feels premium.', is_approved: true },
      { user_id: users[2].id, product_id: products[4].id, rating: 5, title: 'Best headphones ever', comment: 'The noise cancellation is world-class. So comfortable for long sessions.', is_approved: true },
      { user_id: users[3].id, product_id: products[5].id, rating: 4, title: 'Nice polo shirt', comment: 'Good quality material. Fits true to size. Would buy again.', is_approved: true },
      { user_id: users[2].id, product_id: products[6].id, rating: 5, title: 'Beautiful dress', comment: 'Got this for my wife and she loves it. Great fabric and fit.', is_approved: true },
      { user_id: users[4].id, product_id: products[8].id, rating: 4, title: 'Keeps water cold', comment: 'Works great for keeping water cold all day. The lid seals well.', is_approved: true },
      { user_id: users[2].id, product_id: products[10].id, rating: 3, title: 'Decent earbuds', comment: 'Sound quality is good but battery life could be better.', is_approved: true },
      { user_id: users[3].id, product_id: products[2].id, rating: 5, title: 'Perfect laptop', comment: 'The M3 MacBook Air is blazing fast. The display is gorgeous.', is_approved: true },
    ]);
    console.log(`Created ${reviews.length} reviews.`);

    // ── Coupons ──
    const coupons = await Coupon.bulkCreate([
      { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10.00, min_order_amount: 50.00, max_discount: 50.00, usage_limit: 100, used_count: 5, is_active: true, starts_at: new Date('2024-01-01'), expires_at: new Date('2025-12-31') },
      { code: 'SAVE20', discount_type: 'percentage', discount_value: 20.00, min_order_amount: 100.00, max_discount: 100.00, usage_limit: 50, used_count: 2, is_active: true, starts_at: new Date('2024-02-01'), expires_at: new Date('2024-12-31') },
      { code: 'FLAT50', discount_type: 'fixed', discount_value: 50.00, min_order_amount: 200.00, usage_limit: 30, used_count: 1, is_active: true, starts_at: new Date('2024-03-01'), expires_at: new Date('2024-12-31') },
      { code: 'FREESHIP', discount_type: 'fixed', discount_value: 10.00, min_order_amount: 75.00, usage_limit: 200, used_count: 0, is_active: true, starts_at: new Date('2024-01-01'), expires_at: new Date('2025-12-31') },
      { code: 'EXPIRED20', discount_type: 'percentage', discount_value: 20.00, min_order_amount: 50.00, max_discount: 40.00, usage_limit: 10, used_count: 10, is_active: false, starts_at: new Date('2023-01-01'), expires_at: new Date('2023-12-31') },
    ]);
    console.log(`Created ${coupons.length} coupons.`);

    // ── Carts ──
    const carts = await Cart.bulkCreate([
      { user_id: users[2].id },
      { user_id: users[3].id },
      { user_id: users[4].id },
    ]);
    console.log(`Created ${carts.length} carts.`);

    // ── Cart Items ──
    const cartItems = await CartItem.bulkCreate([
      { cart_id: carts[0].id, product_id: products[4].id, quantity: 1 },
      { cart_id: carts[0].id, product_id: products[10].id, quantity: 2 },
      { cart_id: carts[1].id, product_id: products[8].id, quantity: 3 },
      { cart_id: carts[2].id, product_id: products[6].id, quantity: 1 },
    ]);
    console.log(`Created ${cartItems.length} cart items.`);

    // ── Wishlist ──
    const wishlistItems = await Wishlist.bulkCreate([
      { user_id: users[2].id, product_id: products[2].id },
      { user_id: users[2].id, product_id: products[3].id },
      { user_id: users[3].id, product_id: products[0].id },
      { user_id: users[4].id, product_id: products[6].id },
      { user_id: users[4].id, product_id: products[11].id },
    ]);
    console.log(`Created ${wishlistItems.length} wishlist items.`);

    // ── Notifications ──
    const notifications = await Notification.bulkCreate([
      { user_id: users[2].id, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order #ORD-2024-00001 has been confirmed and is being processed.', link: '/orders/ORD-2024-00001', is_read: true, read_at: new Date('2024-01-11') },
      { user_id: users[2].id, type: 'shipping_update', title: 'Order Shipped', message: 'Your order #ORD-2024-00002 has been shipped! Track your package.', link: '/orders/ORD-2024-00002', is_read: false },
      { user_id: users[3].id, type: 'order_confirmation', title: 'Order Confirmed', message: 'Your order #ORD-2024-00003 has been confirmed.', link: '/orders/ORD-2024-00003', is_read: false },
      { user_id: users[2].id, type: 'wishlist', title: 'Price Drop Alert', message: 'iPhone 15 Pro is now on sale! Check it out.', link: '/products/iphone-15-pro', is_read: false },
      { user_id: users[4].id, type: 'welcome', title: 'Welcome to ShopWave!', message: 'Thank you for joining ShopWave. Start exploring our products!', link: '/', is_read: true, read_at: new Date('2024-03-10') },
      { user_id: users[0].id, type: 'system', title: 'New Vendor Registration', message: 'A new vendor has registered. Review their application.', link: '/admin/vendors', is_read: false },
    ]);
    console.log(`Created ${notifications.length} notifications.`);

    console.log('\n✓ Seed completed successfully!');
    console.log('\nCredentials for test accounts:');
    console.log('  Admin:    admin@shopwave.com / password123');
    console.log('  Customer: customer@shopwave.com / password123');
    console.log('\nNote: Vendor accounts are managed by admin. Vendors cannot log in directly.');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
