const express = require("express");
const router = express.Router();
const roomController = require("../../../controllers/roomController");
router.get("/availability", roomController.checkAvailability);
//router.get("/:id", roomController.getRoomById);
module.exports = router;
// src/routes/v1/common/roomRoutes.js
