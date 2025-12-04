const express = require('express');
const router = express.Router();

const { authenticate } = require('../../middleware/auth');  // Path từ v1/ đến src/middleware/auth.js

// Import routes
const authRoutes = require('./common/authRoutes');
const roomRoutes = require('./common/roomRoutes');
const bookingRoutes = require('./common/bookingRoutes');
const adminRoutes = require('./admin/index');
const staffRoutes = require('./staff/index');

// Register routes
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', authenticate, adminRoutes);
router.use('/staff', authenticate, staffRoutes);


module.exports = router;