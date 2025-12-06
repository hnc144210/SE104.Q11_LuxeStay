// backend/src/routes/staff/staff.checkInRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../../../middleware/auth");
const checkInController = require("../../../controllers/checkInController");

// 1) CHECK-IN TỪ BOOKING
// POST /api/v1/staff/checkin/
router.post(
  "/",
  authenticate,
  checkInController.checkInFromBooking
);

// 2) CHECK-IN WALK-IN (không có booking)
// POST /api/v1/staff/checkin/walk-in
router.post(
  "/walk-in",
  authenticate,
  checkInController.checkInWalkIn
);

// 3) TÍNH GIÁ WALK-IN
// POST /api/v1/staff/checkin/calculate-price
router.post(
  "/calculate-price",
  authenticate,
  checkInController.calculateWalkInPrice
);

module.exports = router;