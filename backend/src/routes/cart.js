const router = require('express').Router();
const controller = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, controller.getCart);
router.post('/items', authenticate, controller.addItem);
router.put('/items/:id', authenticate, controller.updateItem);
router.delete('/items/:id', authenticate, controller.removeItem);
router.delete('/', authenticate, controller.clearCart);

module.exports = router;
