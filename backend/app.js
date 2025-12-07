require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
const cors = require("cors");
app.use(cors()); // Cho phép tất cả các nguồn
// Routes
const v1Routes = require("./src/routes/v1");
app.use("/api/v1", v1Routes);

// Home
app.get("/", (req, res) => {
  res.json({ message: "LuxeStay" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy: ${req.originalUrl}`,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Lỗi server",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
//backend/app.js
