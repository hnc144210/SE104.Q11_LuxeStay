const express = require("express");
const router = express.Router();
const userController = require("../../../controllers/userController");

router.post("/", userController.createCustomer); // Tạo khách
router.get("/", userController.getCustomers); // Lấy danh sách khách <-- CÁI BẠN CẦN
router.get("/:id", userController.getCustomerById); // Lấy chi tiết
router.put("/:id", userController.updateCustomer); // Sửa khách

module.exports = router;

// backend/src/routes/v1/staff/customerRoutes.js
