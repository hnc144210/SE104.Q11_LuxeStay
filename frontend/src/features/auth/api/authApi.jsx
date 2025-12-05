import axios from "axios";

const BASE_URL = "http://localhost:3000/api/v1";

export const loginUser = async (credentials) => {
  try {
    // credentials bao gồm: { email, password }
    console.log("Attempting login for:", credentials.email);

    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);

    console.log("Login success data: ", response.data);
    return response.data;
  } catch (error) {
    // Axios trả về lỗi chi tiết trong error.response nếu server phản hồi (ví dụ 400, 401)
    const errorMessage = error.response?.data?.message || error.message;
    console.error(`Login API error: ${errorMessage}`);
    throw new Error(`Failed to login: ${errorMessage}`);
  }
};

export const registerUser = async (userData) => {
  try {
    const payload = { ...userData, type: "domestic" };

    // URL ghép lại phải thành: http://localhost:3000/api/v1/auth/register-customer
    const response = await axios.post(
      `${BASE_URL}/auth/register-customer`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
