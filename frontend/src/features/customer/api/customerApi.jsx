import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

// Helper lấy token từ LocalStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 1. Lấy danh sách khách hàng (Admin/Staff)
export const getCustomers = async (params) => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/customers`, {
      // Lưu ý: check lại route BE của bạn, có thể là /admin/customers hoặc /staff/customers tùy phân quyền
      params: params,
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// 2. Tạo khách hàng mới
export const createCustomer = async (data) => {
  try {
    // Route này thường nằm ở auth hoặc admin route tùy logic BE
    const response = await axios.post(
      `${BASE_URL}/admin/staff/register-customer`,
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

// 3. Cập nhật khách hàng
export const updateCustomer = async (id, data) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/customers/${id}`,
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

// 4. Lấy chi tiết khách hàng
export const getCustomerById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/customers/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
