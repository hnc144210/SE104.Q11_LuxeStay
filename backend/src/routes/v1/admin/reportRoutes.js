const express = require("express");
const router = express.Router();
const roomController = require("../../../controllers/roomController");
const reportController = require("../../../controllers/reportController");
// GET /api/v1/staff/reports/room-status
router.get("/room-status", roomController.getRoomReport);
// router.get("/revenue", reportController.getRevenueReport);
router.get("/dashboard", reportController.getDashboardStats);
module.exports = router;
// backend/src/routes/v1/admin/reportRoutes.js
