const express = require('express');
const router = express.Router();
const { createStaff } = require('../../../controllers/authController');
const { authenticate: protect, authorize: restrictTo } = require('../../../middleware/auth');

router
  .route('/')
  .post(protect, restrictTo('admin'), createStaff);
module.exports = router;