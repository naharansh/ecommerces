const { Cart, CartItem, Product, ProductImage } = require('../models');
const { requireId } = require('../utils/helpers');

const getCart = async (userId) => {
  let cart = await Cart.findOne({
    where: { user_id: userId },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'price', 'stock_qty', 'is_active'],
        include: [{
          model: ProductImage,
          as: 'images',
          where: { is_primary: true },
          required: false,
          attributes: ['image_url'],
        }],
      }],
    }],
  });

  if (!cart) {
    cart = await Cart.create({ user_id: userId });
    cart = await getCart(userId);
  }

  return cart;
};

const addItem = async (userId, { product_id, quantity = 1 }) => {
  const product = await Product.findByPk(requireId(product_id, 'product_id'));
  if (!product || !product.is_active) {
    const error = new Error('Product not found or unavailable.');
    error.statusCode = 404;
    throw error;
  }

  let cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) cart = await Cart.create({ user_id: userId });

  const existingItem = await CartItem.findOne({
    where: { cart_id: cart.id, product_id },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock_qty) {
      const error = new Error('Insufficient stock.');
      error.statusCode = 400;
      throw error;
    }
    await existingItem.update({ quantity: newQty });
  } else {
    if (quantity > product.stock_qty) {
      const error = new Error('Insufficient stock.');
      error.statusCode = 400;
      throw error;
    }
    await CartItem.create({ cart_id: cart.id, product_id, quantity });
  }

  return getCart(userId);
};

const updateItem = async (userId, itemId, { quantity }) => {
  requireId(itemId, 'item_id');
  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) {
    const error = new Error('Cart not found.');
    error.statusCode = 404;
    throw error;
  }

  const item = await CartItem.findOne({
    where: { id: itemId, cart_id: cart.id },
    include: [{ model: Product, as: 'product' }],
  });

  if (!item) {
    const error = new Error('Item not found in cart.');
    error.statusCode = 404;
    throw error;
  }

  if (quantity > item.product.stock_qty) {
    const error = new Error('Insufficient stock.');
    error.statusCode = 400;
    throw error;
  }

  if (quantity <= 0) {
    await item.destroy();
  } else {
    await item.update({ quantity });
  }

  return getCart(userId);
};

const removeItem = async (userId, itemId) => {
  requireId(itemId, 'item_id');
  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) {
    const error = new Error('Cart not found.');
    error.statusCode = 404;
    throw error;
  }

  const item = await CartItem.findOne({
    where: { id: itemId, cart_id: cart.id },
  });

  if (!item) {
    const error = new Error('Item not found in cart.');
    error.statusCode = 404;
    throw error;
  }

  await item.destroy();
  return getCart(userId);
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (cart) {
    await CartItem.destroy({ where: { cart_id: cart.id } });
  }
  return getCart(userId);
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
