const express = require('express');
const router = express.Router();
const { createStaff } = require('../../../controllers/authController');
const { authenticate: protect, authorize: restrictTo } = require('../../../middleware/auth');
const userController = require('../../../controllers/userController');

router
  .route('/')
  .post(protect, restrictTo('admin'), createStaff)
  .get(protect, restrictTo('admin'), userController.getStaff);

  
module.exports = router;