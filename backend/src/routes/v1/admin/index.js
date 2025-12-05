const router = require('express').Router();
const { authenticate, authorize } = require('../../../middleware/auth');

// tất cả route admin đều cần đăng nhập
router.use(authenticate);
router.use(authorize(['admin']));
router.use('/bookings', require('./bookingRoutes'));


router.use('/staff', require('./staffRoutes'));
router.use('/reports', require('./reportRoutes'));
module.exports = router;