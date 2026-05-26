const { Payment, Order } = require('../models');
const { PAYMENT_STATUS } = require('../utils/constants');
const { requireId } = require('../utils/helpers');

const processPayment = async ({ order_id, payment_method, transaction_id, amount, gateway_response }) => {
  const order = await Order.findByPk(requireId(order_id, 'order_id'));
  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  const payment = await Payment.create({
    order_id,
    gateway: payment_method,
    transaction_id: transaction_id || null,
    amount: amount || order.total_amount,
    currency: 'USD',
    status: PAYMENT_STATUS.COMPLETED,
    gateway_response: gateway_response || null,
    paid_at: new Date(),
  });

  await order.update({
    payment_status: PAYMENT_STATUS.COMPLETED,
    status: 'confirmed',
  });

  return {
    payment: payment.toJSON(),
    order: {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
    },
  };
};

const processRefund = async (orderId, amount) => {
  const payment = await Payment.findOne({ where: { order_id: orderId } });
  if (!payment) {
    const error = new Error('Payment not found.');
    error.statusCode = 404;
    throw error;
  }

  await payment.update({
    status: PAYMENT_STATUS.REFUNDED,
    refund_amount: amount || payment.amount,
    refunded_at: new Date(),
  });

  const order = await Order.findByPk(orderId);
  await order.update({ payment_status: PAYMENT_STATUS.REFUNDED });

  return payment;
};

module.exports = { processPayment, processRefund };
