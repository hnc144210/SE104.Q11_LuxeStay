const router = require('express').Router();
const { authenticate } = require('../../../middleware/auth');
const bookingController = require('../../../controllers/bookingController');

// tất cả route admin đều cần đăng nhập
router.use(authenticate);

// ADMIN: xem danh sách booking
router.get('/bookings', bookingController.getBookingsForStaffAdmin);

// ADMIN: hủy booking bất kỳ
router.delete('/bookings/:id', bookingController.cancelBookingByStaffAdmin);

const express = require('express');
const router = express.Router();

router.use('/staff', require('./staffRoutes'));

module.exports = router;