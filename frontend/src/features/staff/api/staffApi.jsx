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

// --- FETCH DATA ---

// Lấy danh sách Booking dành cho Staff
export const getStaffBookings = async (params) => {
  const response = await axios.get(`${BASE_URL}/bookings`, {
    headers: getAuthHeaders().headers, // Gọi lại hàm helper để lấy header
    params: params,
  });
  return response.data;
};

// Lấy danh sách Phòng
export const getStaffRooms = async (params) => {
  const response = await axios.get(`${BASE_URL}/rooms`, {
    headers: getAuthHeaders().headers,
    params: params,
  });
  return response.data;
};

// Lấy danh sách Khách hàng
export const getStaffCustomers = async (params) => {
  const response = await axios.get(`${BASE_URL}/customers`, {
    headers: getAuthHeaders().headers,
    params: params,
  });
  return response.data;
};
export const getOccupiedRooms = async () => {
  const response = await axios.get(`${BASE_URL}/rooms`, {
    headers: getAuthHeaders().headers,
    params: { status: "occupied" }, // Chỉ lấy phòng đang thuê
  });
  return response.data;
};

// 2. Lấy thông tin chi tiết Rental hiện tại của phòng (để xem trước khi check-out)
// Lưu ý: Bạn cần đảm bảo Backend có API lấy rental theo room_id hoặc rental_id active
// Tạm thời ta sẽ dùng list rooms để lấy rental_id, sau đó gọi checkout

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
//src/features/staff/api/staffApi.jsx
