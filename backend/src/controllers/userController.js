const { User, Address, Wishlist, Product, ProductImage, Vendor } = require('../models');
const { requireId } = require('../utils/helpers');

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'avatar_url'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await req.user.update(updates);
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token'] },
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findAll({ where: { user_id: req.user.id } });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const address = await Address.create({ ...req.body, user_id: req.user.id });
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Product,
        as: 'product',
        include: [{
          model: ProductImage,
          as: 'images',
          where: { is_primary: true },
          required: false,
        }],
      }],
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const product_id = requireId(req.body.product_id, 'product_id');
    const [item] = await Wishlist.findOrCreate({
      where: { user_id: req.user.id, product_id },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    await Wishlist.destroy({
      where: { user_id: req.user.id, product_id: requireId(req.params.productId, 'product_id') },
    });
    res.json({ message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAddresses, addAddress, getWishlist, addToWishlist, removeFromWishlist };
