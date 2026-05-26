const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().positive().precision(2).required(),
  compare_price: Joi.number().positive().precision(2).optional().allow(null),
  cost_price: Joi.number().positive().precision(2).optional().allow(null),
  stock_qty: Joi.number().integer().min(0).required(),
  sku: Joi.string().max(100).optional().allow(''),
  is_featured: Joi.boolean().optional(),
  weight: Joi.number().positive().precision(2).optional().allow(null),
  category_id: Joi.number().integer().optional().allow(null),
  image_url: Joi.string().uri().max(500).optional().allow(''),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().positive().precision(2).optional(),
  compare_price: Joi.number().positive().precision(2).optional().allow(null),
  cost_price: Joi.number().positive().precision(2).optional().allow(null),
  stock_qty: Joi.number().integer().min(0).optional(),
  sku: Joi.string().max(100).optional().allow(''),
  is_featured: Joi.boolean().optional(),
  is_active: Joi.boolean().optional(),
  weight: Joi.number().positive().precision(2).optional().allow(null),
  category_id: Joi.number().integer().optional().allow(null),
  image_url: Joi.string().uri().max(500).optional().allow(''),
});

module.exports = { createProductSchema, updateProductSchema };
