const express = require("express");
const router = express.Router();
const roomController = require("../../../controllers/roomController");
router.get("/availability", roomController.checkAvailability);

module.exports = router;
//routes/v1/common/roomRoutes.js
