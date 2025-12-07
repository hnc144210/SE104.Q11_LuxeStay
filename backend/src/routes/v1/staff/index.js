const router = require("express").Router();

const { authenticate } = require("../../../middleware/auth");
const bookingController = require("../../../controllers/bookingController");
const customerRoutes = require("./customerRoutes");
const checkInRoutes = require("./checkInRoutes");
const checkOutRoutes = require("./checkOutRoutes");

// Tất cả route staff đều cần đăng nhập
router.use(authenticate);
router.use(authorize(['admin']));
// STAFF: xem danh sách booking
router.get('/bookings', bookingController.getBookingsForStaffAdmin);

// STAFF: hủy booking
router.delete('/bookings/:id', bookingController.cancelBookingByStaffAdmin);

// STAFF: quản lý khách hàng
router.use("/customers", customerRoutes);

// STAFF: check-in
router.use("/checkin", checkInRoutes);

// STAFF: check-out
router.use("/checkout", checkOutRoutes);

module.exports = router;
// backend/src/routes/v1/staff/index.js
