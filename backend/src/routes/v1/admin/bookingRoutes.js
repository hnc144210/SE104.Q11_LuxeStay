// File: src/routes/v1/admin/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../../../controllers/bookingController');

// 1. Route gốc: tương ứng với /api/v1/admin/bookings
router.get('/', bookingController.getBookingsForStaffAdmin);

// 2. Route có tham số: tương ứng với /api/v1/admin/bookings/:id
router.delete('/:id', bookingController.cancelBookingByStaffAdmin);
router.put('/:id', bookingController.updateBooking);          // Mục 3
router.post('/extend/:id', bookingController.extendBooking);  // Mục 5
module.exports = router;