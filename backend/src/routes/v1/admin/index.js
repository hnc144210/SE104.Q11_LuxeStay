// backend/src/routes/v1/admin/index.js
const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../../middleware/auth");
const bookingController = require("../../../controllers/bookingController");

// Import file routes
const staffRoutes = require("./staffRoutes");
const roomRoutes = require("./roomRoutes");
const configRoutes = require("./configRoutes");
//const serviceRoutes = require("./serviceRoutes");
const serviceRoutes = require("./serviceRoutes");
const customerRoutes = require("../staff/customerRoutes");

// --- CHỐT CHẶN BẢO MẬT ---
// Chỉ cần khai báo 1 lần ở đây, tất cả con bên dưới đều được hưởng
// router.use(authenticate); đã được khai báo ở src/routes/v1/index.js
// router.use(authenticate); đã được khai báo ở src/routes/v1/index.js
router.use(authorize("admin"));

// --- ĐỊNH NGHĨA ROUTES ---
router.use("/staff", staffRoutes); // -> /api/v1/admin/staff
router.use("/rooms", roomRoutes); // -> /api/v1/admin/rooms
router.use("/config", configRoutes); // -> /api/v1/admin/config
//router.use("/services", serviceRoutes);   // -> /api/v1/admin/services
router.use("/customers", customerRoutes); // -> /api/v1/admin/customers
// --- ĐỊNH NGHĨA ROUTES ---
router.use("/staff", staffRoutes); // -> /api/v1/admin/staff
router.use("/rooms", roomRoutes); // -> /api/v1/admin/rooms
router.use("/config", configRoutes); // -> /api/v1/admin/config
router.use("/services", serviceRoutes); // -> /api/v1/admin/services
router.use("/customers", customerRoutes); // -> /api/v1/admin/customers

// Booking routes
router.get("/bookings", bookingController.getBookingsForStaffAdmin);
router.delete("/bookings/:id", bookingController.cancelBookingByStaffAdmin);

module.exports = router;
