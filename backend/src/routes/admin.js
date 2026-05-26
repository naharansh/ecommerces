const router = require('express').Router();
const controller = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const { updateOrderStatusSchema } = require('../validations/orderValidation');
const { createCategorySchema, updateCategorySchema } = require('../validations/categoryValidation');
const categoryController = require('../controllers/categoryController');

const admin = [authenticate, roleCheck('admin')];

router.get('/dashboard', ...admin, controller.getDashboard);
router.get('/products', ...admin, controller.getAdminProducts);
router.get('/users', ...admin, controller.getUsers);
router.put('/users/:id/role', ...admin, controller.updateUserRole);
router.put('/users/:id', ...admin, controller.updateUser);
router.get('/orders', ...admin, controller.getAdminOrders);
router.put('/orders/:id/status', ...admin, validate(updateOrderStatusSchema), controller.updateOrderStatus);
router.get('/reports/sales', ...admin, controller.getSalesReport);

router.get('/vendors', ...admin, controller.getVendors);
router.post('/vendors', ...admin, controller.createVendor);
router.put('/vendors/:id', ...admin, controller.updateVendor);
router.delete('/vendors/:id', ...admin, controller.deleteVendor);

router.get('/categories', ...admin, categoryController.getAll);
router.get('/categories/:id', ...admin, categoryController.getById);
router.post('/categories', ...admin, validate(createCategorySchema), categoryController.create);
router.put('/categories/:id', ...admin, validate(updateCategorySchema), categoryController.update);
router.delete('/categories/:id', ...admin, categoryController.remove);

router.get('/coupons', ...admin, controller.getCoupons);
router.post('/coupons', ...admin, controller.createCoupon);
router.put('/coupons/:id', ...admin, controller.updateCoupon);
router.delete('/coupons/:id', ...admin, controller.deleteCoupon);

module.exports = router;
