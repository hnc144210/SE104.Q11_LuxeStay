import axios from "axios";

// Đảm bảo BASE_URL khớp với cấu hình backend của bạn
const BASE_URL = "http://localhost:3000/api/v1";

export const getFeaturedRooms = async () => {
  try {
    // Gọi API lấy danh sách phòng (Public)
    // Nếu backend chưa hỗ trợ phân trang/limit, ta sẽ lấy hết rồi slice ở frontend
    const response = await axios.get(`${BASE_URL}/rooms`);

    // Giả sử response trả về dạng { success: true, data: [...] }
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách phòng nổi bật:", error);
    throw error.response?.data || error.message;
  }
};
