// backend/src/routes/v1/admin/index.js
const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../../../middleware/auth");
const bookingController = require("../../../controllers/bookingController");

// Import file routes con (Đảm bảo file này nằm cùng thư mục admin)
const staffRoutes = require("./staffRoutes");
const roomRoutes = require("./roomRoutes");
const customerRoutes = require("../staff/customerRoutes");
// --- CHỐT CHẶN BẢO MẬT ---
// Chỉ cần khai báo 1 lần ở đây, tất cả con bên dưới đều được hưởng
router.use(authenticate);
router.use(authorize("admin"));

// --- ĐỊNH NGHĨA ---
router.use("/staffs", staffRoutes); // -> /api/v1/admin/staffs
router.use("/rooms", roomRoutes); // -> /api/v1/admin/rooms
router.use("/customers", customerRoutes); // -> /api/v1/admin/customers
// Booking routes
router.get("/bookings", bookingController.getBookingsForStaffAdmin);
router.delete("/bookings/:id", bookingController.cancelBookingByStaffAdmin);

module.exports = router;
