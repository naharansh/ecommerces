const router = require('express').Router();
const controller = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, controller.updateProfile);
router.get('/addresses', authenticate, controller.getAddresses);
router.post('/addresses', authenticate, controller.addAddress);
router.get('/wishlist', authenticate, controller.getWishlist);
router.post('/wishlist', authenticate, controller.addToWishlist);
router.delete('/wishlist/:productId', authenticate, controller.removeFromWishlist);
module.exports = router;
