const router = require("express").Router();
const { authenticate, authorize } = require("../../../middleware/auth");
const bookingController = require("../../../controllers/bookingController");
const customerRoutes = require("./customerRoutes");
const checkInRoutes = require("./checkInRoutes");
const checkOutRoutes = require("./checkOutRoutes");
const serviceRoutes = require("./serviceRoutes");
const roomRoutes = require("./roomRoutes");
const staffController = require("../../../controllers/staffController");
// Tất cả route staff đều cần đăng nhập
router.use(authenticate);
router.use(authorize(["admin", "staff"]));
// STAFF: xem danh sách booking
router.get("/bookings", bookingController.getBookingsForStaffAdmin);
router.put("/bookings/:id", bookingController.updateBooking); // Mục 3
// STAFF: hủy booking
router.delete("/bookings/:id", bookingController.cancelBookingByStaffAdmin);
router.get("/stats", staffController.getDashboardStats);
// STAFF: quản lý khách hàng
router.use("/customers", customerRoutes); // -> /api/v1/staff/customers

// STAFF: check-in
router.use("/checkin", checkInRoutes); // -> /api/v1/staff/checkin

// STAFF: check-out
router.use("/checkout", checkOutRoutes); // -> /api/v1/staff/checkout

//Yêu cầu dịch vụ
router.use("/services", serviceRoutes); // -> /api/v1/staff/services

// STAFF: quản lý phòng
router.use("/rooms", roomRoutes); // -> /api/v1/staff/rooms

router.use("/finance", require("./financeRoutes"));

module.exports = router;
// backend/src/routes/v1/staff/index.js
