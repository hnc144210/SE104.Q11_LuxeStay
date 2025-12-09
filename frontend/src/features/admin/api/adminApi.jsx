import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

// Helper lấy token từ LocalStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==========================================
// 1. QUẢN LÝ KHÁCH HÀNG (CUSTOMERS)
// ==========================================

export const getCustomers = async (params) => {
  const response = await axios.get(`${BASE_URL}/admin/customers`, {
    headers: getAuthHeaders(),
    params: params,
  });
  return response.data;
};

export const createCustomer = async (data) => {
  const response = await axios.post(`${BASE_URL}/admin/customers`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateCustomer = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/admin/customers/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==========================================
// 2. QUẢN LÝ ĐẶT PHÒNG (BOOKINGS)
// ==========================================

export const getAllBookings = async (params) => {
  const response = await axios.get(`${BASE_URL}/admin/bookings`, {
    headers: getAuthHeaders(),
    params: params,
  });
  return response.data;
};

export const cancelBookingByAdmin = async (id) => {
  const response = await axios.delete(`${BASE_URL}/admin/bookings/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==========================================
// 3. QUẢN LÝ PHÒNG (ROOMS)
// ==========================================

export const getRooms = async (params) => {
  const response = await axios.get(`${BASE_URL}/admin/rooms`, {
    headers: getAuthHeaders(),
    params: params,
  });
  return response.data;
};

export const createRoom = async (data) => {
  const response = await axios.post(`${BASE_URL}/admin/rooms`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateRoom = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/admin/rooms/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateRoomStatus = async (id, status) => {
  const response = await axios.put(
    `${BASE_URL}/admin/rooms/${id}/status`,
    { status },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await axios.delete(`${BASE_URL}/admin/rooms/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==========================================
// 4. QUẢN LÝ NHÂN VIÊN (STAFFS)
// ==========================================

export const getStaffs = async (params) => {
  const response = await axios.get(`${BASE_URL}/admin/staffs`, {
    headers: getAuthHeaders(),
    params: params,
  });
  return response.data;
};

export const getStaffById = async (id) => {
  const response = await axios.get(`${BASE_URL}/admin/staffs/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createStaff = async (data) => {
  const response = await axios.post(`${BASE_URL}/admin/staffs`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateStaff = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/admin/staffs/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateStaffStatus = async (id, status) => {
  const response = await axios.put(
    `${BASE_URL}/admin/staffs/${id}/status`,
    { status },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await axios.delete(`${BASE_URL}/admin/staffs/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// ==========================================
// 5. QUẢN LÝ DỊCH VỤ (SERVICES)
// ==========================================

export const getServices = async (params) => {
  const response = await axios.get(`${BASE_URL}/admin/services`, {
    headers: getAuthHeaders(),
    params: params,
  });
  return response.data;
};

export const createService = async (data) => {
  const response = await axios.post(`${BASE_URL}/admin/services`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateService = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/admin/services/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const toggleServiceStatus = async (id) => {
  const response = await axios.patch(
    `${BASE_URL}/admin/services/${id}/toggle-status`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteService = async (id) => {
  const response = await axios.delete(`${BASE_URL}/admin/services/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Yêu cầu dịch vụ (Gọi món cho phòng)
export const requestService = async (data) => {
  // data: { rental_id, service_id, quantity }
  // Lưu ý: Route này được khai báo trong admin/serviceRoutes.js là /request
  const response = await axios.post(
    `${BASE_URL}/admin/services/request`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
// Lấy báo cáo doanh thu
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/reports/dashboard`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
