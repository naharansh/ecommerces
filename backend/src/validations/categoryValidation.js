const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().optional().allow(''),
  image_url: Joi.string().uri().max(500).optional().allow(''),
  parent_id: Joi.number().integer().optional().allow(null),
  is_active: Joi.boolean().optional(),
  sort_order: Joi.number().integer().min(0).optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().optional().allow(''),
  image_url: Joi.string().uri().max(500).optional().allow(''),
  parent_id: Joi.number().integer().optional().allow(null),
  is_active: Joi.boolean().optional(),
  sort_order: Joi.number().integer().min(0).optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
