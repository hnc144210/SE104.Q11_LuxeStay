import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

// API Kiểm tra phòng trống
export const checkRoomAvailability = async (params) => {
  // params: { check_in_date, check_out_date, room_type_id, max_guests }
  try {
    // Axios sẽ tự chuyển object params thành query string: ?check_in_date=...&...
    const response = await axios.get(`${BASE_URL}/rooms/availability`, {
      params: params,
    });
    console.log("Availability Data:", response.data);
    return response.data;
  } catch (error) {
    // Xử lý lỗi trả về từ backend (ví dụ: ngày check-in quá khứ)
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};
export const getRoomById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/rooms/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};
//roomApi.jsx
