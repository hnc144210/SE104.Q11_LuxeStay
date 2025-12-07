// backend/src/routes/admin/admin.configRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate: protect, authorize: restrictTo } = require("../../../middleware/auth");
const configController = require("../../../controllers/configController");

router
  .route("/")
  .get(protect, restrictTo("admin"), configController.getConfig);

router
  .route("/room-types")
  .put(protect, restrictTo("admin"), configController.updateRoomTypes);

router
  .route("/guest-types")
  .put(protect, restrictTo("admin"), configController.updateGuestTypes);

router
  .route("/surcharges")
  .put(protect, restrictTo("admin"), configController.updateSurcharges);

module.exports = router;