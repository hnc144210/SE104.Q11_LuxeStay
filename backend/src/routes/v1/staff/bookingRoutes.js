// src/routes/v1/staff/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../../../controllers/bookingController');

router.post('/', bookingController.createBookingByStaff);
// 1. Xem danh sách booking (Route gốc /)
// Tương ứng URL: /api/v1/staff/bookings
router.get('/', bookingController.getBookingsForStaffAdmin);

// 2. Hủy booking (Route /:id)
// Tương ứng URL: /api/v1/staff/bookings/:id
router.delete('/:id', bookingController.cancelBookingByStaffAdmin);

router.put('/:id', bookingController.updateBooking);          // Mục 3
router.post('/extend/:id', bookingController.extendBooking);  // Mục 5
module.exports = router;