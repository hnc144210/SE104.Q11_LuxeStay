import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

// Helper lấy token
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
// --- API DÀNH CHO KHÁCH HÀNG (CUSTOMER) ---

// Lấy danh sách booking của tôi
export const getMyBookings = async (params) => {
  // params: { status } (optional)
  try {
    const response = await axios.get(`${BASE_URL}/bookings/mine`, {
      params: params,
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// Tạo booking mới
export const createBooking = async (data) => {
  // data: { room_id, check_in_date, check_out_date, num_guests, deposit_amount }
  try {
    const response = await axios.post(`${BASE_URL}/bookings`, data, {
      headers: getAuthHeaders(),
    });
    console.log("Booking Created:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// Hủy booking của tôi
export const cancelMyBooking = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// Lấy chi tiết booking (Dùng chung cho cả Customer và Staff)
export const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    console.log("Booking Details:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// --- API DÀNH CHO STAFF / ADMIN ---

// Lấy danh sách tất cả booking (có filter)
export const getAllBookings = async (params) => {
  // params: { status, room_id, from, to }
  try {
    const response = await axios.get(`${BASE_URL}/admin/bookings`, {
      params: params,
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// Hủy booking (Admin quyền lực hơn)
export const cancelBookingByAdmin = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/admin/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};
//bookingApi.jsx
