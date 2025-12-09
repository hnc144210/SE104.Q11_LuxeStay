// roomApi.jsx
import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

// Helper lấy header (có thể trả về object rỗng nếu không có token)
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return {}; // Trả về rỗng nếu là khách vãng lai

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// API Kiểm tra phòng trống
export const checkRoomAvailability = async (params) => {
  try {
    // SỬA LẠI CÁCH TRUYỀN PARAMS
    const config = {
      ...getAuthHeaders(), // Spread header vào config
      params: params, // Params phải nằm trong object config
    };

    const response = await axios.get(
      `${BASE_URL}/rooms/availability`,
      config // Truyền đúng 1 object config chứa cả headers và params
    );

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// API Xem chi tiết phòng
export const getRoomById = async (id) => {
  try {
    // Với GET chi tiết, có thể không cần Auth Header nếu đã mở public
    // Nhưng cứ gửi kèm cũng không sao (Backend đã bỏ check role rồi)
    const response = await axios.get(
      `${BASE_URL}/rooms/${id}`,
      getAuthHeaders() // Cái này đúng vì getAuthHeaders trả về { headers: ... }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};
