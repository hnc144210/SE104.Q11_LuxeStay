import axios from "axios";

// Đảm bảo đúng port Backend (3000 hoặc 5000 tùy bạn config)
const BASE_URL = "http://localhost:3000/api/v1/staff";

// Helper lấy token chuẩn
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) console.warn("⚠️ Không tìm thấy accessToken trong LocalStorage!");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// --- CHECK-IN ---

// Check-in từ Booking (Chỉ gửi ID và Cọc)
export const checkInFromBooking = async (data) => {
  // data: { booking_id, deposit_amount }
  const response = await axios.post(
    `${BASE_URL}/checkin`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

// Check-in Walk-in
export const checkInWalkIn = async (data) => {
  const response = await axios.post(
    `${BASE_URL}/checkin/walk-in`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

// Tính giá Walk-in
export const calculateWalkInPrice = async (data) => {
  const response = await axios.post(
    `${BASE_URL}/checkin/calculate-price`,
    data,
    getAuthHeaders()
  );
  return response.data;
};
export const createStaffCustomer = async (data) => {
  // data: { full_name, identity_card, phone_number, ... }
  // Endpoint này trỏ về router.post("/", ...) trong customerRoutes.js của Staff
  const response = await axios.post(
    `${BASE_URL}/customers`,
    data,
    getAuthHeaders()
  );
  return response.data;
};
// --- FETCH DATA ---

// Lấy danh sách Booking dành cho Staff
export const getStaffBookings = async (params) => {
  const response = await axios.get(
    `${BASE_URL}/bookings`,
    getAuthHeaders() // Gọi lại hàm helper để lấy header
  );
  return response.data;
};

// Lấy danh sách Phòng
export const getStaffRooms = async (params) => {
  const response = await axios.get(`${BASE_URL}/rooms`, getAuthHeaders());
  return response.data;
};

// Lấy danh sách Khách hàng
export const getStaffCustomers = async (params) => {
  const response = await axios.get(`${BASE_URL}/customers`, getAuthHeaders());
  return response.data;
};
export const getActiveRentals = async () => {
  const response = await axios.get(
    `${BASE_URL}/checkout/rentals`,
    getAuthHeaders()
  );
  return response.data;
};

// 3. Thực hiện Check-out
export const performCheckOut = async (checkOutData) => {
  // checkOutData: { rental_id, payment_method }
  const response = await axios.post(
    `${BASE_URL}/checkout`,
    checkOutData,
    getAuthHeaders()
  );
  return response.data; // Backend trả về { success, data: { invoice: ... } }
};
export const getInvoiceById = async (id) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/finance/invoices/${id}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
export const getRentalById = async (id) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/finance/rentals/${id}`,
      getAuthHeaders()
    );
    console.log("API getRentalById response:", response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 2. Gia hạn phòng (Cập nhật ngày trả phòng)
export const extendRental = async (id, newEndDate) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/finance/rentals/${id}`,
      { new_end_date: newEndDate },
      { headers: getAuthHeaders().headers } // Lưu ý: axios.put(url, data, config)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
//src/features/staff/api/staffApi.jsx
