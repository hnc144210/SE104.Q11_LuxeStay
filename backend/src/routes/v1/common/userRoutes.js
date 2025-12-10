const express = require("express");
const router = express.Router();
const userController = require("../../../controllers/userController");
const { authenticate } = require("../../../middleware/auth"); // Hoặc 'protect' tùy tên bạn đặt

// QUAN TRỌNG: Tất cả các route trong file này đều yêu cầu đăng nhập
router.use(authenticate);

// Định nghĩa route ngắn gọn, không cần ID trên URL
// GET /api/v1/users/me
router.get("/me", userController.getMe);

// PUT /api/v1/users/me
router.put("/me", userController.updateMe);

module.exports = router;
