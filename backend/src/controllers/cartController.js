const cartService = require('../services/cartService');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const addItem = async (req, res, next) => {
  try {
    const cart = await cartService.addItem(req.user.id, req.body);
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateItem(req.user.id, req.params.id, req.body);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(req.user.id, req.params.id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
