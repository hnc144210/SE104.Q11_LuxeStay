const router = require('express').Router();
const bookingController = require('../../../controllers/bookingController');
const customerRoutes = require('./customerRoutes');

// STAFF: xem danh sách booking
router.get('/bookings', bookingController.getBookingsForStaffAdmin);

// STAFF: hủy booking
router.delete('/bookings/:id', bookingController.cancelBookingByStaffAdmin);

router.use('/customers', customerRoutes);

module.exports = router;

