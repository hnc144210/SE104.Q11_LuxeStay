const express = require("express");
const router = express.Router();

// 1. Import đúng đường dẫn tới file controller của bạn
// Dựa vào comment của bạn: // backend/src/controllers/configController.js
// Từ routes/v1/common đi ra: ../../../controllers/configController
const configController = require("../../../controllers/configController");

// 2. Gọi đúng tên hàm 'getConfig' mà bạn đã viết trong controller
router.get("/regulations", configController.getConfig);

module.exports = router;
