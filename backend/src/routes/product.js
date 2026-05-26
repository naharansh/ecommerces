const router = require('express').Router();
const controller = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { createProductSchema, updateProductSchema } = require('../validations/productValidation');

router.get('/', controller.getAll);
router.get('/featured', controller.getFeatured);
router.get('/:id', controller.getById);
router.post('/', authenticate, roleCheck('admin'), validate(createProductSchema), controller.create);
router.put('/:id', authenticate, roleCheck('admin'), validate(updateProductSchema), controller.update);
router.delete('/:id', authenticate, roleCheck('admin'), controller.remove);

module.exports = router;
