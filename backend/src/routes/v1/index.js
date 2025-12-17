const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");

// Import routes
const authRoutes = require("./common/authRoutes");
const roomRoutes = require("./common/roomRoutes");
const bookingRoutes = require("./common/bookingRoutes");
const adminRoutes = require("./admin/index");
const staffRoutes = require("./staff/index");
const userRoutes = require("./common/userRoutes");
const configRoutes = require("./common/configRoutes");

// Register routes
// ✅ ĐÚNG: Đặt config lên đầu để không bị dính middleware auth nào cả
router.use("/config", configRoutes);
router.use("/auth", authRoutes);
router.use("/rooms", roomRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", userRoutes);

// Các route cần đăng nhập
router.use("/admin", authenticate, adminRoutes);
router.use("/staff", authenticate, staffRoutes);

module.exports = router;
