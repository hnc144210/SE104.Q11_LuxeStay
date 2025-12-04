const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/auth');
const userController = require('../../../controllers/userController');

router.post('/', userController.createCustomer);
router.get('/', userController.getCustomers);
router.get('/:id', userController.getCustomerById);
router.put('/:id', authenticate, userController.updateCustomer);

module.exports = router;


