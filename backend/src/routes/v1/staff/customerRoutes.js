const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const userController = require('../../../controllers/userController');

router.post('/', userController.createCustomer);
router.get('/', userController.getCustomers);

module.exports = router;
