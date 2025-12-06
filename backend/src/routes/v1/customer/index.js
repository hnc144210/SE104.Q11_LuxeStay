// src/routes/v1/customer/index.js
const router = require("express").Router();
const { authenticate } = require("../../../middleware/auth");
const bookingController = require("../../../controllers/bookingController");

// Tất cả route customer yêu cầu đăng nhập
router.use(authenticate);

/**
 * POST /api/v1/customer/bookings
 * Khách tạo booking mới
 */
router.post("/bookings", bookingController.createBookingForCustomer);

/**
 * GET /api/v1/customer/bookings
 * Khách xem danh sách booking của chính mình
 */
router.get("/bookings", bookingController.getMyBookings);

/**
 * GET /api/v1/customer/bookings/:id
 * Khách xem chi tiết 1 booking của mình
 * (controller vẫn dùng getBookingById, có kiểm tra quyền)
 */
router.get("/bookings/:id", bookingController.getBookingById);

/**
 * DELETE /api/v1/customer/bookings/:id
 * Khách tự hủy booking của mình (pending/confirmed)
 */
router.delete("/bookings/:id", bookingController.cancelMyBooking);

module.exports = router;
// src/routes/v1/customer/index.js
