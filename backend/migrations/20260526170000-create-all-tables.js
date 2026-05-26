'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('customer', 'vendor', 'admin'), defaultValue: 'customer' },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      google_id: { type: Sequelize.STRING(255), allowNull: true },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      last_login: { type: Sequelize.DATE, allowNull: true },
      failed_login_attempts: { type: Sequelize.INTEGER, defaultValue: 0 },
      locked_until: { type: Sequelize.DATE, allowNull: true },
      refresh_token: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      parent_id: { type: Sequelize.INTEGER, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('vendors', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      store_name: { type: Sequelize.STRING(200), allowNull: false, unique: true },
      slug: { type: Sequelize.STRING(200), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      logo_url: { type: Sequelize.STRING(500), allowNull: true },
      banner_url: { type: Sequelize.STRING(500), allowNull: true },
      commission_rate: { type: Sequelize.DECIMAL(5, 2), defaultValue: 10.00 },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      contact_email: { type: Sequelize.STRING(255), allowNull: true },
      contact_phone: { type: Sequelize.STRING(20), allowNull: true },
      address: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      compare_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      cost_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      stock_qty: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      sku: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      is_featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      weight: { type: Sequelize.DECIMAL(8, 2), allowNull: true },
      category_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
      vendor_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'vendors', key: 'id' }, onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('product_images', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      image_url: { type: Sequelize.STRING(500), allowNull: false },
      alt_text: { type: Sequelize.STRING(255), allowNull: true },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('coupons', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      discount_type: { type: Sequelize.ENUM('percentage', 'fixed'), allowNull: false },
      discount_value: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      min_order_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      max_discount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      usage_limit: { type: Sequelize.INTEGER, allowNull: true },
      used_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      starts_at: { type: Sequelize.DATE, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('cart', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('cart_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      cart_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'cart', key: 'id' }, onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'), defaultValue: 'pending' },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tax_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      shipping_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      discount_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      coupon_code: { type: Sequelize.STRING(50), allowNull: true },
      payment_status: { type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
      shipping_address: { type: Sequelize.JSON, allowNull: true },
      billing_address: { type: Sequelize.JSON, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      tracking_number: { type: Sequelize.STRING(100), allowNull: true },
      shipped_at: { type: Sequelize.DATE, allowNull: true },
      delivered_at: { type: Sequelize.DATE, allowNull: true },
      cancelled_at: { type: Sequelize.DATE, allowNull: true },
      cancel_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('order_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      product_name: { type: Sequelize.STRING(255), allowNull: false },
      product_sku: { type: Sequelize.STRING(100), allowNull: true },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      total_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE' },
      gateway: { type: Sequelize.ENUM('stripe', 'paypal', 'razorpay'), allowNull: false },
      transaction_id: { type: Sequelize.STRING(255), allowNull: true },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), defaultValue: 'USD' },
      status: { type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
      gateway_response: { type: Sequelize.JSON, allowNull: true },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      refunded_at: { type: Sequelize.DATE, allowNull: true },
      refund_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('addresses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      label: { type: Sequelize.STRING(50), defaultValue: 'Home' },
      street: { type: Sequelize.STRING(255), allowNull: false },
      city: { type: Sequelize.STRING(100), allowNull: false },
      state: { type: Sequelize.STRING(100), allowNull: false },
      postal_code: { type: Sequelize.STRING(20), allowNull: false },
      country: { type: Sequelize.STRING(100), allowNull: false, defaultValue: 'US' },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_billing: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('reviews', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING(255), allowNull: true },
      comment: { type: Sequelize.TEXT, allowNull: true },
      is_approved: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('wishlists', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      type: { type: Sequelize.STRING(50), allowNull: false },
      title: { type: Sequelize.STRING(255), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: true },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      link: { type: Sequelize.STRING(500), allowNull: true },
      read_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('products', ['slug']);
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['vendor_id']);
    await queryInterface.addIndex('products', ['is_active', 'is_featured']);
    await queryInterface.addIndex('orders', ['order_number']);
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('reviews', ['product_id']);
    await queryInterface.addIndex('reviews', ['user_id']);
    await queryInterface.addConstraint('reviews', { fields: ['user_id', 'product_id'], type: 'unique', name: 'reviews_user_id_product_id_unique' });
    await queryInterface.addConstraint('wishlists', { fields: ['user_id', 'product_id'], type: 'unique', name: 'wishlists_user_id_product_id_unique' });
    await queryInterface.addIndex('notifications', ['user_id', 'is_read']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('wishlists');
    await queryInterface.dropTable('reviews');
    await queryInterface.dropTable('addresses');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('cart_items');
    await queryInterface.dropTable('cart');
    await queryInterface.dropTable('coupons');
    await queryInterface.dropTable('product_images');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('vendors');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
  },
};
