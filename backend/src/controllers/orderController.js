const orderService = require('../services/orderService');

const create = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id, req.query);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id, req.body.reason);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { create, getAll, getById, cancel };
