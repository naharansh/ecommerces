const { Category, Product } = require('../models');
const { requireId } = require('../utils/helpers');

const getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      include: [{
        model: Category,
        as: 'children',
        where: { is_active: true },
        required: false,
      }],
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(requireId(req.params.id), {
      include: [
        { model: Category, as: 'parent' },
        { model: Category, as: 'children', where: { is_active: true }, required: false },
        { model: Product, as: 'products', where: { is_active: true }, required: false },
      ],
    });
    if (!category) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, image_url, parent_id, is_active, sort_order } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name, slug, description, image_url, parent_id, is_active, sort_order,
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const err = new Error('A category with this name already exists.');
      err.statusCode = 409;
      return next(err);
    }
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(requireId(req.params.id));
    if (!category) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    const allowed = ['name', 'description', 'image_url', 'parent_id', 'is_active', 'sort_order'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) category[key] = req.body[key];
    }
    if (req.body.name) {
      category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await category.save();
    res.json(category);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const err = new Error('A category with this name already exists.');
      err.statusCode = 409;
      return next(err);
    }
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const category = await Category.findByPk(requireId(req.params.id));
    if (!category) {
      const error = new Error('Category not found.');
      error.statusCode = 404;
      throw error;
    }

    const productCount = await Product.count({ where: { category_id: category.id } });
    if (productCount > 0) {
      const error = new Error(`Cannot delete category. ${productCount} product(s) are assigned to it.`);
      error.statusCode = 400;
      throw error;
    }

    await Category.update({ parent_id: null }, { where: { parent_id: category.id } });

    await category.destroy();
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
