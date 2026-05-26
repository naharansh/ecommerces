const productService = require('../services/productService');

const getAll = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, getFeatured, create, update, remove };
