import axios from "axios";

// Đảm bảo bạn đã có biến BASE_URL (ví dụ: http://localhost:3000/api/v1)
// và hàm lấy headers (chứa Token)
const BASE_URL = "http://localhost:3000/api/v1";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken"); // Hoặc lấy từ Context/Store
  return { Authorization: `Bearer ${token}` };
};

// 1. Lấy thông tin cá nhân
export const getMyProfile = async () => {
  const response = await axios.get(`${BASE_URL}/users/me`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// 2. Cập nhật thông tin cá nhân
export const updateMyProfile = async (data) => {
  const response = await axios.put(`${BASE_URL}/users/me`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
