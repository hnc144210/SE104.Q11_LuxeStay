const express = require('express');
const router = express.Router();
const roomController = require('../../../controllers/roomController');

// GET /api/v1/staff/reports/room-status
router.get('/room-status', roomController.getRoomReport);

module.exports = router;