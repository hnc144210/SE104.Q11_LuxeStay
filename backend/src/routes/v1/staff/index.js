const router = require('express').Router();
const customerRoutes = require('./customerRoutes');
const bookingRoutes = require('./bookingRoutes');
const { authenticate, authorize } = require('../../../middleware/auth');
router.use(authenticate);
router.use(authorize(['staff', 'admin']));
// 1. Gom nhóm Booking
router.use('/bookings', bookingRoutes);



module.exports = router;

