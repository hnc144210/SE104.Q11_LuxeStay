const router = require("express").Router();

const { authenticate } = require("../../../middleware/auth");
const bookingController = require("../../../controllers/bookingController");
const customerRoutes = require("./customerRoutes");

// Tất cả route staff đều cần đăng nhập
router.use(authenticate);

// STAFF: xem danh sách booking
router.get("/bookings", bookingController.getBookingsForStaffAdmin);

// STAFF: hủy booking
router.delete("/bookings/:id", bookingController.cancelBookingByStaffAdmin);

// STAFF: quản lý khách hàng
router.use("/customers", customerRoutes);

module.exports = router;
// backend/src/routes/v1/staff/index.js
