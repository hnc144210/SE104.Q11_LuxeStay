const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/auth");

// Import routes
const authRoutes = require("./common/authRoutes");
const roomRoutes = require("./common/roomRoutes");
const bookingRoutes = require("./common/bookingRoutes");

const adminRoutes = require("./admin/index");
const customerRoutes = require("./customer"); // giữ của bạn
const staffRoutes = require("./staff/index");

// Register routes
router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/bookings", bookingRoutes);

router.use("/customer", customerRoutes); // giữ của bạn
router.use("/admin", authenticate, adminRoutes); // bảo mật
router.use("/staff", authenticate, staffRoutes); // bảo mật

module.exports = router;
