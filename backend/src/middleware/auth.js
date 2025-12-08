// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Không có token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      customerId: decoded.customerId || null,
    };

    next();
<<<<<<< HEAD
  } // Sửa lại đoạn catch
  catch (err) {
    // 👇 Thêm dòng này để xem lỗi ở Terminal khi dev
    console.error('Auth Error:', err.message); 
    
    // Có thể phân loại lỗi chi tiết hơn nếu thích
    if (err.name === 'TokenExpiredError') {
         return res.status(401).json({ success: false, message: 'Token đã hết hạn' });
    }
    
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
}
=======
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ" });
  }
>>>>>>> d5f2e3193a199f67d981f395335fed9e36a86b3a
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
//middleware/auth.js
