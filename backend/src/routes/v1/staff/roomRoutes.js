// backend/src/routes/v1/staff/roomRoutes.js
const express = require("express");
const router = express.Router();
const roomController = require("../../../controllers/roomController");

// Tất cả route này yêu cầu Staff HOẶC Admin
// Middleware authorize đã được xử lý ở staff/index.js

// Staff + Admin: Xem danh sách phòng
router.get("/", roomController.getRooms);

// Staff + Admin: Xem chi tiết phòng
router.get("/:id", roomController.getRoomById);

// Staff + Admin: Cập nhật trạng thái phòng
router.patch("/:id/status", roomController.updateRoomStatus);

// Staff + Admin: Báo cáo tình trạng phòng
router.get("/reports/room-status", roomController.getRoomReport);

module.exports = router;