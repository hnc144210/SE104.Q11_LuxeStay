// backend/src/routes/staff/checkOutRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../../../middleware/auth");
const checkOutController = require("../../../controllers/checkOutController");

router.post("/", authenticate, checkOutController.checkOut);

module.exports = router;