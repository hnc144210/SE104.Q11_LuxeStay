const express = require("express");
const router = express.Router();
const authController = require("../../../controllers/authController");

router.post("/register-customer", authController.registerCustomer);
router.post("/login", authController.login);

module.exports = router;

//routes/v1/common/authRoutes.js
