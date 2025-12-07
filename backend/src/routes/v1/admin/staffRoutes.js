const express = require("express");
const router = express.Router();
const staffController = require("../../../controllers/staffController");

router.get("/", staffController.getStaffs);
router.post("/", staffController.createStaff);
router.get("/:id", staffController.getStaffById);
router.put("/:id", staffController.updateStaff);
//router.put("/:id/status", staffController.updateStaffStatus);
router.delete("/:id", staffController.deleteStaff);

module.exports = router;
// backend/src/routes/v1/admin/staffRoutes.js
