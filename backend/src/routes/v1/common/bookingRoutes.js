const express = require("express");
const router = express.Router();
const bookingController = require("../../../controllers/bookingController");
const { authenticate } = require("../../../middleware/auth");

// 1. Tạo booking mới (Cần đăng nhập)
// Đây là dòng bạn đang thiếu:
router.post("/", authenticate, bookingController.createBookingForCustomer);

// 2. Xem danh sách booking của bản thân (Customer)
router.get("/mine", authenticate, bookingController.getMyBookings);

// 3. Xem chi tiết booking theo ID
router.get("/:id", authenticate, bookingController.getBookingById);

// 4. Hủy booking của bản thân
router.delete("/:id", authenticate, bookingController.cancelMyBooking);

module.exports = router;
// backend/src/routes/v1/common/bookingRoutes.js
