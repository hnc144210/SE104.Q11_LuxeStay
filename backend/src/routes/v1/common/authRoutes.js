const express = require("express");
const router = express.Router();
const authController = require("../../../controllers/authController");
const { authenticate, authorize } = require("../../../middleware/auth");

router.post("/register-customer", authController.registerCustomer);
router.post("/login", authController.login);

router.get("/profile", authenticate, authController.getProfile);
router.post("/logout", authenticate, authController.logout);
router.put("/profile", authenticate, authController.updateProfile);

module.exports = router;
// backend/src/routes/v1/common/authRoutes.js
