const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./common/authRoutes');
const roomRoutes = require('./common/roomRoutes');
const adminRoutes = require('./admin');
const customerRoutes = require('./customer');
const staffRoutes = require('./staff');

// Register routes
router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/admin', adminRoutes);
router.use('/customer', customerRoutes);
router.use('/staff', staffRoutes);

module.exports = router;
//routes/v1/index.js