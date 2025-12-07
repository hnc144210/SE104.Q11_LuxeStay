import React, { createContext, useState, useEffect, useContext } from "react";
// Import các hàm gọi API mình đã viết ở bước trước
import { loginUser, registerUser } from "../auth/api/authApi.jsx";

// 1. Tạo Context (Cái loa)
const AuthContext = createContext();

// 2. Tạo Provider (Cái trạm phát sóng)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin user (tên, role...)
  const [loading, setLoading] = useState(true); // Trạng thái đang tải (check token lúc đầu)

  // A. HÀM CHECK LOGIN KHI F5 TRANG
  useEffect(() => {
    const checkLoggedIn = () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");
      console.log("Checking logged in user:", storedUser);
      console.log("Checking logged in token:", token);
      if (storedUser && token) {
        // Nếu có trong kho thì set lại vào state để app biết
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // B. HÀM LOGIN
  const login = async (payload) => {
    try {
      const res = await loginUser(payload); // Gọi API
      if (res.success) {
        // Lưu vào LocalStorage
        localStorage.setItem("accessToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));

        // Cập nhật State toàn cục (Quan trọng!)
        setUser(res.data);
        return { success: true };
      }
    } catch (error) {
      // Xử lý lỗi (lấy message lỗi như bài trước)
      const msg = error.message.replace("Failed to login: ", "");
      return { success: false, message: msg };
    }
  };

  // C. HÀM REGISTER
  const register = async (payload) => {
    try {
      const res = await registerUser(payload);
      if (res.success) {
        localStorage.setItem("accessToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
        return { success: true };
      }
    } catch (error) {
      const msg = error.message.replace("Failed to register account: ", "");
      return { success: false, message: msg };
    }
  };

  // D. HÀM LOGOUT
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null); // Xóa state -> App tự render lại về trạng thái chưa đăng nhập
  };

  // Giá trị chia sẻ cho toàn bộ App
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user, // Biến boolean tiện dụng
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Hook để các component con gọi cho nhanh
export const useAuthContext = () => {
  return useContext(AuthContext);
};

//feature/context/AuthContext.jsx
