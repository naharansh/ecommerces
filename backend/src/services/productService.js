const { Op } = require('sequelize');
const { Product, Category, ProductImage, Review, Vendor } = require('../models');
const { generateSlug, paginate, formatPaginatedResponse, requireId } = require('../utils/helpers');

const getProducts = async (query) => {
  const { page, limit, offset } = paginate(query);
  const where = { is_active: true };

  if (query.category) where.category_id = query.category;
  if (query.min_price || query.max_price) {
    where.price = {};
    if (query.min_price) where.price[Op.gte] = parseFloat(query.min_price);
    if (query.max_price) where.price[Op.lte] = parseFloat(query.max_price);
  }
  if (query.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${query.search}%` } },
      { description: { [Op.like]: `%${query.search}%` } },
    ];
  }

  const order = [];
  if (query.sort === 'price_asc') order.push(['price', 'ASC']);
  else if (query.sort === 'price_desc') order.push(['price', 'DESC']);
  else if (query.sort === 'newest') order.push(['created_at', 'DESC']);
  else if (query.sort === 'oldest') order.push(['created_at', 'ASC']);
  else order.push(['created_at', 'DESC']);

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      { model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'is_primary', 'alt_text'] },
      { model: Vendor, as: 'vendor', attributes: ['id', 'store_name', 'slug'] },
    ],
    order,
    limit,
    offset,
  });

  return formatPaginatedResponse(rows, count, page, limit);
};

const getProductById = async (id) => {
  const product = await Product.findByPk(requireId(id), {
    include: [
      { model: Category, as: 'category' },
      { model: ProductImage, as: 'images' },
      { model: Vendor, as: 'vendor', attributes: ['id', 'store_name', 'slug', 'logo_url'] },
      { model: Review, as: 'reviews', include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'name', 'avatar_url'] }] },
    ],
  });

  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }

  return product;
};

const getFeaturedProducts = async () => {
  return Product.findAll({
    where: { is_featured: true, is_active: true },
    include: [
      { model: ProductImage, as: 'images', where: { is_primary: true }, required: false },
    ],
    limit: 10,
  });
};

const createProduct = async (data) => {
  const { image_url, ...productData } = data;
  const slug = generateSlug(productData.name);
  const existing = await Product.findOne({ where: { slug } });
  if (existing) {
    productData.slug = slug + '-' + Date.now();
  } else {
    productData.slug = slug;
  }
  const product = await Product.create(productData);
  if (image_url) {
    await ProductImage.create({
      product_id: product.id,
      image_url,
      is_primary: true,
      sort_order: 0,
    });
  }
  return product;
};

const updateProduct = async (id, data) => {
  const { image_url, ...productData } = data;
  const product = await Product.findByPk(requireId(id));
  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }
  if (productData.name && productData.name !== product.name) {
    productData.slug = generateSlug(productData.name);
  }
  await product.update(productData);
  if (image_url) {
    const existing = await ProductImage.findOne({ where: { product_id: product.id, is_primary: true } });
    if (existing) {
      await existing.update({ image_url });
    } else {
      await ProductImage.create({
        product_id: product.id,
        image_url,
        is_primary: true,
        sort_order: 0,
      });
    }
  }
  return product.reload();
};

const deleteProduct = async (id) => {
  const product = await Product.findByPk(requireId(id));
  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }
  await product.destroy();
};

module.exports = { getProducts, getProductById, getFeaturedProducts, createProduct, updateProduct, deleteProduct };
