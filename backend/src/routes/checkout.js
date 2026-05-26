const router = require('express').Router();
const controller = require('../controllers/checkoutController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, controller.checkout);
router.post('/payment', authenticate, controller.processPayment);
router.post('/apply-coupon', authenticate, controller.applyCoupon);

module.exports = router;
