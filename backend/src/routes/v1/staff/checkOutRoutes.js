// backend/src/routes/staff/checkOutRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../../../middleware/auth");
const checkOutController = require("../../../controllers/checkOutController");
router.get("/rentals", authenticate, checkOutController.getActiveRentals);
router.post("/", authenticate, checkOutController.checkOut);

module.exports = router;
