const express = require('express');
const router = express.Router();

router.use('/staff', require('./staffRoutes'));

module.exports = router;