const express = require("express");
const router = express.Router();
const staffController = require("../../../controllers/staffController");

// Import middleware (Giống hệt bên roomRoutes)
const { authenticate, authorize } = require("../../../middleware/auth");

// --- BẢO MẬT & PHÂN QUYỀN (Global cho file này) ---

// 1. Tất cả các route dưới đây đều cần đăng nhập
router.use(authenticate);

// 2. Chỉ ADMIN mới được phép truy cập (Chặn staff thường)
router.use(authorize("admin"));

// --- ĐỊNH NGHĨA ROUTE ---

// 1. Lấy danh sách nhân viên
// GET /api/v1/admin/staffs
router.get("/", staffController.getStaffs);

// 2. Tạo nhân viên mới
// POST /api/v1/admin/staffs
router.post("/", staffController.createStaff);

// 3. Lấy chi tiết nhân viên
// GET /api/v1/admin/staffs/:id
router.get("/:id", staffController.getStaffById);

// 4. Cập nhật thông tin nhân viên
// PUT /api/v1/admin/staffs/:id
router.put("/:id", staffController.updateStaff);

// 5. Cập nhật trạng thái nhân viên (Active/Inactive/On_leave)
// PUT /api/v1/admin/staffs/:id/status
// (Route này cần thiết nếu bạn muốn đổi trạng thái nhanh mà không cần edit toàn bộ form)
router.put("/:id/status", staffController.updateStaffStatus);

// 6. Xóa nhân viên
// DELETE /api/v1/admin/staffs/:id
router.delete("/:id", staffController.deleteStaff);

module.exports = router;
