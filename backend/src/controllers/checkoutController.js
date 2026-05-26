const orderService = require('../services/orderService');
const paymentService = require('../services/paymentService');

const checkout = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json({
      message: 'Order created successfully.',
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        status: order.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const processPayment = async (req, res, next) => {
  try {
    const result = await paymentService.processPayment({
      order_id: req.body.order_id,
      payment_method: req.body.payment_method,
      transaction_id: req.body.transaction_id,
      amount: req.body.amount,
      gateway_response: req.body.gateway_response,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await orderService.validateCoupon(code, subtotal);
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon code.' });
    }
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_discount: coupon.max_discount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkout, processPayment, applyCoupon };
