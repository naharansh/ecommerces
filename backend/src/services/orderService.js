const { Op } = require('sequelize');
const { Order, OrderItem, Cart, CartItem, Product, ProductImage, Address, Coupon } = require('../models');
const { generateOrderNumber, paginate, formatPaginatedResponse, requireId } = require('../utils/helpers');
const { ORDER_STATUS, PAYMENT_STATUS, DISCOUNT_TYPES } = require('../utils/constants');

const createOrder = async (userId, body) => {
  const { shipping_address_id, billing_address_id, coupon_code, notes, payment_method, firstName, lastName, address: street, city, state, zip: postal_code, country, phone } = body;

  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{ model: Product, as: 'product' }],
    }],
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    const error = new Error('Cart is empty.');
    error.statusCode = 400;
    throw error;
  }

  for (const item of cart.items) {
    if (item.quantity > item.product.stock_qty) {
      const error = new Error(`Insufficient stock for ${item.product.name}.`);
      error.statusCode = 400;
      throw error;
    }
  }

  let shippingAddress;
  if (shipping_address_id) {
    shippingAddress = await Address.findOne({
      where: { id: shipping_address_id, user_id: userId },
    });
    if (!shippingAddress) {
      const error = new Error('Shipping address not found.');
      error.statusCode = 404;
      throw error;
    }
  } else if (street && city && state && postal_code) {
    shippingAddress = await Address.create({
      user_id: userId,
      street,
      city,
      state,
      postal_code,
      country: country || 'US',
      phone: phone || null,
      label: `${firstName || ''} ${lastName || ''}`.trim() || 'Shipping',
    });
  } else {
    const error = new Error('Shipping address is required.');
    error.statusCode = 400;
    throw error;
  }

  let billingAddress = shippingAddress;
  if (billing_address_id) {
    billingAddress = await Address.findOne({
      where: { id: billing_address_id, user_id: userId },
    });
    if (!billingAddress) {
      const error = new Error('Billing address not found.');
      error.statusCode = 404;
      throw error;
    }
  }

  let subtotal = 0;
  const orderItems = cart.items.map((item) => {
    const totalPrice = parseFloat(item.product.price) * item.quantity;
    subtotal += totalPrice;
    return {
      product_id: item.product.id,
      product_name: item.product.name,
      product_sku: item.product.sku,
      quantity: item.quantity,
      unit_price: parseFloat(item.product.price),
      total_price: totalPrice,
      image_url: null,
    };
  });

  let discountAmount = 0;
  let appliedCoupon = null;
  if (coupon_code) {
    appliedCoupon = await validateCoupon(coupon_code, subtotal);
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === DISCOUNT_TYPES.PERCENTAGE) {
        discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
        if (appliedCoupon.max_discount) {
          discountAmount = Math.min(discountAmount, parseFloat(appliedCoupon.max_discount));
        }
      } else {
        discountAmount = parseFloat(appliedCoupon.discount_value);
      }
    }
  }

  const taxAmount = subtotal * 0.08;
  const shippingAmount = subtotal > 100 ? 0 : 10;
  const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

  const order = await Order.create({
    order_number: generateOrderNumber(),
    user_id: userId,
    status: ORDER_STATUS.PENDING,
    subtotal: subtotal.toFixed(2),
    tax_amount: taxAmount.toFixed(2),
    shipping_amount: shippingAmount.toFixed(2),
    discount_amount: discountAmount.toFixed(2),
    coupon_code: coupon_code || null,
    total_amount: totalAmount.toFixed(2),
    payment_status: PAYMENT_STATUS.PENDING,
    shipping_address: shippingAddress.toJSON(),
    billing_address: billingAddress.toJSON(),
    notes: notes || null,
  });

  await OrderItem.bulkCreate(
    orderItems.map((item) => ({ ...item, order_id: order.id }))
  );

  for (const item of cart.items) {
    await Product.decrement('stock_qty', {
      by: item.quantity,
      where: { id: item.product_id },
    });
  }

  await CartItem.destroy({ where: { cart_id: cart.id } });

  if (appliedCoupon) {
    await appliedCoupon.increment('used_count');
  }

  return Order.findByPk(order.id, {
    include: [{ model: OrderItem, as: 'items' }],
  });
};

const validateCoupon = async (code, subtotal) => {
  const coupon = await Coupon.findOne({
    where: {
      code: code.toUpperCase(),
      is_active: true,
      expires_at: { [Op.gt]: new Date() },
      ...(subtotal ? { min_order_amount: { [Op.lte]: subtotal } } : {}),
    },
  });

  if (!coupon) return null;
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return null;
  return coupon;
};

const getUserOrders = async (userId, query) => {
  const { page, limit, offset } = paginate(query);
  const where = { user_id: userId };

  if (query.status) where.status = query.status;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [{ model: OrderItem, as: 'items' }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return formatPaginatedResponse(rows, count, page, limit);
};

const getOrderById = async (id, userId) => {
  const where = { id: requireId(id) };
  if (userId) where.user_id = userId;

  const order = await Order.findOne({
    where,
    include: [{ model: OrderItem, as: 'items' }],
  });

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  return order;
};

const cancelOrder = async (id, userId, reason) => {
  const order = await Order.findOne({ where: { id: requireId(id), user_id: userId } });
  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    const error = new Error('Order cannot be cancelled at this stage.');
    error.statusCode = 400;
    throw error;
  }

  await order.update({
    status: ORDER_STATUS.CANCELLED,
    cancelled_at: new Date(),
    cancel_reason: reason || null,
    payment_status: PAYMENT_STATUS.REFUNDED,
  });

  const items = await OrderItem.findAll({ where: { order_id: id } });
  for (const item of items) {
    await Product.increment('stock_qty', {
      by: item.quantity,
      where: { id: item.product_id },
    });
  }

  return order.reload();
};

const getAllOrders = async (query) => {
  const { page, limit, offset } = paginate(query);
  const where = {};

  if (query.status) where.status = query.status;
  if (query.payment_status) where.payment_status = query.payment_status;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [{ model: OrderItem, as: 'items' }],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return formatPaginatedResponse(rows, count, page, limit);
};

const updateOrderStatus = async (id, { status, tracking_number, cancel_reason }) => {
  const order = await Order.findByPk(requireId(id));
  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  const updateData = { status };

  if (tracking_number) updateData.tracking_number = tracking_number;
  if (status === 'shipped') updateData.shipped_at = new Date();
  if (status === 'delivered') updateData.delivered_at = new Date();
  if (status === 'cancelled') {
    updateData.cancelled_at = new Date();
    updateData.cancel_reason = cancel_reason || null;
    updateData.payment_status = PAYMENT_STATUS.REFUNDED;

    const items = await OrderItem.findAll({ where: { order_id: id } });
    for (const item of items) {
      await Product.increment('stock_qty', {
        by: item.quantity,
        where: { id: item.product_id },
      });
    }
  }

  await order.update(updateData);
  return order.reload();
};

module.exports = { createOrder, getUserOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, validateCoupon };
