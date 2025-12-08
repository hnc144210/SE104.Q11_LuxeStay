const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const authController = require('../../../controllers/authController');
const { authenticate} = require('../../../middleware/auth');
=======
const authController = require("../../../controllers/authController");
const { authenticate, authorize } = require("../../../middleware/auth");
>>>>>>> d5f2e3193a199f67d981f395335fed9e36a86b3a

router.post("/register-customer", authController.registerCustomer);
router.post("/login", authController.login);

router.get("/profile", authenticate, authController.getProfile);
router.post("/logout", authenticate, authController.logout);
router.put("/profile", authenticate, authController.updateProfile);

module.exports = router;
// backend/src/routes/v1/common/authRoutes.js
