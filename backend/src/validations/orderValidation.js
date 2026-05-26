const Joi = require('joi');

const createOrderSchema = Joi.object({
  shipping_address_id: Joi.number().integer().optional(),
  billing_address_id: Joi.number().integer().optional(),
  coupon_code: Joi.string().max(50).optional().allow(''),
  notes: Joi.string().optional().allow(''),
  payment_method: Joi.string().valid('stripe', 'paypal', 'razorpay').optional(),
  // Raw address fields (alternative to shipping_address_id)
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zip: Joi.string().optional(),
  country: Joi.string().optional(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(
    'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
  ).required(),
  tracking_number: Joi.string().max(100).optional().allow(''),
  cancel_reason: Joi.string().optional().allow(''),
});

module.exports = { createOrderSchema, updateOrderStatusSchema };
