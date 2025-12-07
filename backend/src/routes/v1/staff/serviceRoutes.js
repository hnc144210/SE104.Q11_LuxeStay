// backend/src/routes/staff/serviceRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../../../middleware/auth");
const serviceController = require("../../../controllers/serviceController");

// Staff có thể xem và yêu cầu dịch vụ
router.get("/", authenticate, serviceController.getServices);
router.get("/:id", authenticate, serviceController.getServiceById);
router.post("/request", authenticate, serviceController.requestService);

// Staff có thể bật/tắt trạng thái dịch vụ (soft delete)
router.patch("/:id/toggle-status", authenticate, serviceController.toggleServiceStatus);

module.exports = router;