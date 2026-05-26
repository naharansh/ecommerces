const router = require('express').Router();
const controller = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createOrderSchema } = require('../validations/orderValidation');

router.post('/', authenticate, validate(createOrderSchema), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id/cancel', authenticate, controller.cancel);

module.exports = router;
