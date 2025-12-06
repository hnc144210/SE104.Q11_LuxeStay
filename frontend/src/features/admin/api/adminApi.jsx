import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

// Helper lấy token từ LocalStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- QUẢN LÝ KHÁCH HÀNG (CUSTOMERS) ---

// 1. Lấy danh sách khách hàng (có search)
export const getCustomers = async (params) => {
  try {
    // Gọi vào route của staff vì staff quản lý customer
    const response = await axios.get(`${BASE_URL}/staff/customers`, {
      headers: getAuthHeaders(),
      params: params, // { search: '...' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// 2. Tạo khách hàng mới
export const createCustomer = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/staff/customers`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// 3. Cập nhật khách hàng
export const updateCustomer = async (id, data) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/staff/customers/${id}`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// --- QUẢN LÝ ĐẶT PHÒNG (BOOKINGS) ---

// 4. Lấy danh sách Booking (có filter)
export const getAllBookings = async (params) => {
  try {
    // params: { status, room_id, from, to }
    const response = await axios.get(`${BASE_URL}/staff/bookings`, {
      headers: getAuthHeaders(),
      params: params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// 5. Hủy Booking (Quyền Admin/Staff)
export const cancelBookingByAdmin = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/staff/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
// 6. Lấy danh sách phòng
export const getRooms = async (params) => {
  try {
    // params: { page, limit, type, status }
    const response = await axios.get(`${BASE_URL}/admin/rooms`, {
      headers: getAuthHeaders(),
      params: params,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// 7. Tạo phòng mới
export const createRoom = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/admin/rooms`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// 8. Cập nhật phòng
export const updateRoom = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/admin/rooms/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// 9. Cập nhật trạng thái phòng nhanh
export const updateRoomStatus = async (id, status) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/rooms/${id}/status`,
      { status },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// 10. Xóa phòng
export const deleteRoom = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/admin/rooms/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
