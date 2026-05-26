const bcrypt = require('bcryptjs');
const { User, Order, OrderItem, Product, Category, Vendor, Payment, Review, ProductImage, Coupon } = require('../models');
const { Op } = require('sequelize');
const orderService = require('../services/orderService');
const { paginate, formatPaginatedResponse, requireId, generateSlug } = require('../utils/helpers');

const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, totalProducts, totalOrders, totalRevenue, totalVendors, recentOrders] = await Promise.all([
      User.count(),
      Product.count({ where: { is_active: true } }),
      Order.count(),
      Order.sum('total_amount', { where: { payment_status: 'completed' } }),
      Vendor.count(),
      Order.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      }),
    ]);

    res.json({
      stats: {
        total_users: totalUsers,
        total_products: totalProducts,
        total_orders: totalOrders,
        total_revenue: totalRevenue || 0,
        total_vendors: totalVendors,
      },
      recent_orders: recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password_hash', 'refresh_token'] },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    res.json(formatPaginatedResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.payment_status) where.payment_status = req.query.payment_status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json(formatPaginatedResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const getSalesReport = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const where = { payment_status: 'completed' };

    if (start_date) where.created_at = { ...where.created_at, [Op.gte]: new Date(start_date) };
    if (end_date) where.created_at = { ...where.created_at, [Op.lte]: new Date(end_date) };

    const orders = await Order.findAll({
      where,
      attributes: [
        'id', 'order_number', 'total_amount', 'created_at',
      ],
      order: [['created_at', 'DESC']],
    });

    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    res.json({
      total_sales: totalSales,
      total_orders: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const getVendors = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const { count, rows } = await Vendor.findAndCountAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role', 'is_verified', 'created_at'] }],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    res.json(formatPaginatedResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const createVendor = async (req, res, next) => {
  try {
    const { name, email, password, store_name, description, commission_rate, contact_email, contact_phone } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      const error = new Error('Email already registered.');
      error.statusCode = 409;
      throw error;
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password_hash, role: 'vendor', is_verified: true });

    const slug = store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const vendor = await Vendor.create({
      user_id: user.id,
      store_name,
      slug,
      description: description || null,
      commission_rate: commission_rate || 10.00,
      is_verified: true,
      is_active: true,
      contact_email: contact_email || email,
      contact_phone: contact_phone || null,
    });

    res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

const updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(requireId(req.params.id));
    if (!vendor) {
      const error = new Error('Vendor not found.');
      error.statusCode = 404;
      throw error;
    }

    const allowed = ['store_name', 'description', 'commission_rate', 'is_verified', 'is_active', 'contact_email', 'contact_phone', 'logo_url', 'banner_url', 'address'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) vendor[key] = req.body[key];
    }
    if (req.body.store_name) {
      vendor.slug = req.body.store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await vendor.save();
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByPk(requireId(req.params.id), { include: [{ model: User, as: 'user' }] });
    if (!vendor) {
      const error = new Error('Vendor not found.');
      error.statusCode = 404;
      throw error;
    }

    const user = vendor.user;
    await vendor.destroy();
    if (user) await user.destroy();

    res.json({ message: 'Vendor deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const getAdminProducts = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query);
    const where = {};
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === 'true';

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary'], separate: true },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json(formatPaginatedResponse(rows, count, page, limit));
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByPk(requireId(req.params.id));
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      const error = new Error('Invalid role. Must be customer or admin.');
      error.statusCode = 400;
      throw error;
    }
    await user.update({ role });
    const userData = user.toJSON();
    delete userData.password_hash;
    delete userData.refresh_token;
    res.json(userData);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(requireId(req.params.id));
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    const allowed = ['name', 'phone', 'email', 'avatar_url'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await user.update(updates);
    const userData = user.toJSON();
    delete userData.password_hash;
    delete userData.refresh_token;
    res.json(userData);
  } catch (error) {
    next(error);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({ order: [['created_at', 'DESC']] });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({
      code: req.body.code.toUpperCase(),
      discount_type: req.body.discount_type,
      discount_value: req.body.discount_value,
      min_order_amount: req.body.min_order_amount || 0,
      max_discount: req.body.max_discount || null,
      usage_limit: req.body.usage_limit || null,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      starts_at: req.body.starts_at || null,
      expires_at: req.body.expires_at,
    });
    res.status(201).json(coupon);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Coupon code already exists.' });
    }
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(requireId(req.params.id));
    if (!coupon) {
      const error = new Error('Coupon not found.');
      error.statusCode = 404;
      throw error;
    }
    const allowed = ['discount_type', 'discount_value', 'min_order_amount', 'max_discount', 'usage_limit', 'is_active', 'starts_at', 'expires_at'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) coupon[key] = req.body[key];
    }
    if (req.body.code) coupon.code = req.body.code.toUpperCase();
    await coupon.save();
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(requireId(req.params.id));
    if (!coupon) {
      const error = new Error('Coupon not found.');
      error.statusCode = 404;
      throw error;
    }
    await coupon.destroy();
    res.json({ message: 'Coupon deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getUsers, getAdminProducts, updateUserRole, updateUser, getAdminOrders, updateOrderStatus, getSalesReport, getVendors, createVendor, updateVendor, deleteVendor, getCoupons, createCoupon, updateCoupon, deleteCoupon };
