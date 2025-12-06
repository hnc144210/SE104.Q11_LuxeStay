const express = require("express");
const router = express.Router();
const roomController = require("../../../controllers/roomController");
// Middleware bảo vệ (Chỉ admin/staff mới vào được)
const { authenticate, authorize } = require("../../../middleware/auth");

// Áp dụng bảo mật cho tất cả route bên dưới
router.use(authenticate);
router.use(authorize("admin", "staff"));

// 1. Tạo phòng mới
router.post("/", roomController.createRoom);

// 2. Lấy danh sách phòng (Quản lý)
router.get("/", roomController.getRooms);

// 3. Cập nhật thông tin phòng
router.put("/:id", roomController.updateRoom);

// 4. Xóa phòng
router.delete("/:id", roomController.deleteRoom);

// 5. Cập nhật riêng trạng thái phòng
router.put("/:id/status", roomController.updateRoomStatus);

module.exports = router;
