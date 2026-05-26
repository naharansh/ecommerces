const router = require('express').Router();
const authRoutes = require('./auth');
const productRoutes = require('./product');
const orderRoutes = require('./order');
const cartRoutes = require('./cart');
const checkoutRoutes = require('./checkout');
const userRoutes = require('./user');
const adminRoutes = require('./admin');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

router.get('/categories', require('../controllers/categoryController').getAll);
router.get('/categories/:id', require('../controllers/categoryController').getById);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
