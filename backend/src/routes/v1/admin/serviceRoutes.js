// backend/src/routes/admin/serviceRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate: protect, authorize: restrictTo } = require("../../../middleware/auth");
const serviceController = require("../../../controllers/serviceController");

router
  .route("/")
  .get(protect, restrictTo("admin"), serviceController.getServices)
  .post(protect, restrictTo("admin"), serviceController.createService);

router
  .route("/:id")
  .get(protect, restrictTo("admin"), serviceController.getServiceById)
  .put(protect, restrictTo("admin"), serviceController.updateService)
  .delete(protect, restrictTo("admin"), serviceController.deleteService);


// Admin có thể soft delete (bật/tắt trạng thái)
router.patch("/:id/toggle-status", protect, restrictTo("admin"), serviceController.toggleServiceStatus);

module.exports = router;