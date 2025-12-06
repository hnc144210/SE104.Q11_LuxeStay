const express = require("express");
const router = express.Router();

// 1. Import Middleware & Controllers
const { authenticate, authorize } = require("../../../middleware/auth");
const bookingController = require("../../../controllers/bookingController");

// 2. Import Sub-routes (Các module con của Admin)
const staffRoutes = require("./staffRoutes"); // File quản lý nhân viên
const roomRoutes = require("./roomRoutes"); // File quản lý phòng (nếu bạn đã tách riêng cho admin)

// --- BẢO MẬT: CHỐT CHẶN CẤP CAO ---
// Tất cả các route bên dưới bắt buộc phải:
// 1. Đã đăng nhập (authenticate)
// 2. Có quyền là ADMIN (authorize)
router.use(authenticate);
router.use(authorize("admin"));

// --- ĐỊNH NGHĨA ROUTES ---

// A. Module Quản lý Nhân sự (Staffs)
// Path: /api/v1/admin/staffs
router.use("/staffs", staffRoutes);

// B. Module Quản lý Phòng (Rooms)
// Path: /api/v1/admin/rooms
router.use("/rooms", roomRoutes);

// C. Module Quản lý Booking (Tạm thời để đây hoặc tách ra file bookingRoutes riêng)
// Path: /api/v1/admin/bookings
router.get("/bookings", bookingController.getBookingsForStaffAdmin); // Xem tất cả booking
router.delete("/bookings/:id", bookingController.cancelBookingByStaffAdmin); // Hủy booking

module.exports = router;
