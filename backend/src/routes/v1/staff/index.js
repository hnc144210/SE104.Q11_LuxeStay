const router = require('express').Router();
const { authenticate } = require('../../../middleware/auth');
const bookingController = require('../../../controllers/bookingController');

// tất cả route staff đều cần đăng nhập
router.use(authenticate);

// STAFF: xem danh sách booking
router.get('/bookings', bookingController.getBookingsForStaffAdmin);

// STAFF: hủy booking cho khách
router.delete('/bookings/:id', bookingController.cancelBookingByStaffAdmin);
 
router.post('/customers', require('../staff/customerRoutes'));
module.exports = router;
