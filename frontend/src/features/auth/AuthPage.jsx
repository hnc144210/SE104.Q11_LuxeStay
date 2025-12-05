import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebookF,
  FaPhone,
  FaIdCard,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "../context/AuthContext";

const AuthPage = () => {
  // --- STATE UI ---
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- HOOKS ---
  const { login, register } = useAuthContext();
  const navigate = useNavigate();

  // State local để hiển thị lỗi UI (nếu có)
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE FORM ---
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone_number: "",
    identity_card: "",
  });

  // Xử lý nhập liệu
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(""); // Xóa lỗi khi người dùng gõ lại
  };

  // Chuyển đổi qua lại giữa Sign In và Sign Up
  const handleSwitchMode = (mode) => {
    setIsSignUp(mode);
    setLocalError("");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      full_name: "",
      phone_number: "",
      identity_card: "",
    });
  };

  // Xử lý Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError("");

    let result;

    if (isSignUp) {
      // --- LOGIC ĐĂNG KÝ ---
      // 1. Validate mật khẩu
      if (formData.password !== formData.confirmPassword) {
        setLocalError("Mật khẩu xác nhận không khớp!");
        setIsSubmitting(false);
        return;
      }

      // 2. Gọi hàm register từ Context
      result = await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        identity_card: formData.identity_card,
      });
    } else {
      // --- LOGIC ĐĂNG NHẬP ---
      result = await login({
        email: formData.email,
        password: formData.password,
      });
    }

    // Xử lý kết quả trả về từ Context
    if (result && result.success) {
      alert(isSignUp ? "Đăng ký thành công!" : "Đăng nhập thành công!");
      navigate("/"); // Chuyển về trang chủ
    } else {
      // Hiển thị lỗi từ server trả về
      setLocalError(result?.message || "Đã có lỗi xảy ra, vui lòng thử lại.");
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen font-sans py-10 bg-cover bg-center relative"
      style={{
        backgroundImage:
          'url("https://i.pinimg.com/736x/ac/2f/c8/ac2fc8f0427892aa82c3e448d95dd907.jpg")',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-white mb-5 tracking-wide drop-shadow-lg">
          Welcome To LuxeStay
        </h1>

        <div className="relative overflow-hidden w-[768px] max-w-full min-h-[650px] bg-white rounded-[20px] shadow-2xl">
          {/* --- SIGN UP FORM (ĐĂNG KÝ) --- */}
          <div
            className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 flex items-center justify-center ${
              isSignUp ? "translate-x-full opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white flex flex-col items-center justify-center h-full w-full px-10 text-center"
            >
              <h1 className="font-bold text-3xl text-[#548ec4] mb-2">
                Create Account
              </h1>

              {/* Hiển thị lỗi nếu đang ở form Sign Up */}
              {localError && isSignUp && (
                <p className="text-red-500 text-sm mb-2 font-medium">
                  {localError}
                </p>
              )}

              <div className="flex gap-4 my-2">
                <button
                  type="button"
                  className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-[#555] hover:bg-gray-50 transition hover:scale-110"
                >
                  <FaGoogle />
                </button>
                <button
                  type="button"
                  className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-[#555] hover:bg-gray-50 transition hover:scale-110"
                >
                  <FaFacebookF />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                or use your email for registration
              </p>

              {/* Full Name */}
              <div className="relative w-full mb-2">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="bg-[#f0f4f8] border-none py-3 pl-12 pr-4 w-full rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#79cbdc] text-sm"
                />
              </div>

              {/* Phone Number */}
              <div className="relative w-full mb-2">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="bg-[#f0f4f8] border-none py-3 pl-12 pr-4 w-full rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#79cbdc] text-sm"
                />
              </div>

              {/* Identity Card */}
              <div className="relative w-full mb-2">
                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="identity_card"
                  value={formData.identity_card}
                  onChange={handleChange}
                  placeholder="ID Card / CCCD"
                  required
                  className="bg-[#f0f4f8] border-none py-3 pl-12 pr-4 w-full rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#79cbdc] text-sm"
                />
              </div>

              {/* Email */}
              <div className="relative w-full mb-2">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="bg-[#f0f4f8] border-none py-3 pl-12 pr-4 w-full rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#79cbdc] text-sm"
                />
              </div>

              {/* Password */}
              <div className="relative w-full mb-2">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="bg-[#f0f4f8] border-none py-3 pl-12 pr-10 w-full rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#79cbdc] text-sm"
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative w-full mb-3">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  className="bg-[#f0f4f8] border-none py-3 pl-12 pr-10 w-full rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#79cbdc] text-sm"
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full bg-gradient-to-r from-[#79cbdc] to-[#548ec4] text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transform transition hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Sign Up"}
              </button>
            </form>
          </div>

          {/* --- SIGN IN FORM (ĐĂNG NHẬP) --- */}
          <div
            className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-2 flex items-center justify-center ${
              isSignUp ? "translate-x-full opacity-0" : "opacity-100"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-white flex flex-col items-center justify-center h-full w-full px-10 text-center"
            >
              <h1 className="font-bold text-3xl text-[#548ec4] mb-2">
                Sign in
              </h1>

              {/* Hiển thị lỗi nếu đang ở form Sign In */}
              {localError && !isSignUp && (
                <p className="text-red-500 text-sm mb-4 font-medium">
                  {localError}
                </p>
              )}

              <div className="flex gap-4 my-4">
                <button
                  type="button"
                  className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-[#555] hover:bg-gray-50 transition hover:scale-110"
                >
                  <FaGoogle />
                </button>
                <button
                  type="button"
                  className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-[#555] hover:bg-gray-50 transition hover:scale-110"
                >
                  <FaFacebookF />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">or use your account</p>

              {/* Email */}
              <div className="relative w-full mb-3">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="bg-[#f0f4f8] border-none py-3 pl-12 pr-4 w-full rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#79cbdc]"
                />
              </div>

              {/* Password */}
              <div className="relative w-full mb-3">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="bg-[#f0f4f8] border-none py-3 pl-12 pr-10 w-full rounded-lg outline-none placeholder-gray-400 focus:ring-2 focus:ring-[#79cbdc]"
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <a
                href="#"
                className="text-[#333] text-sm my-4 border-b border-transparent hover:border-[#548ec4] hover:text-[#548ec4] transition"
              >
                Forgot your password?
              </a>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full bg-gradient-to-r from-[#79cbdc] to-[#548ec4] text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transform transition hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? "Loading..." : "Sign In"}
              </button>
            </form>
          </div>

          {/* --- OVERLAY (MÀN CHE TRƯỢT) --- */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${
              isSignUp ? "-translate-x-full" : ""
            }`}
          >
            <div
              className={`bg-gradient-to-r from-[#79cbdc] to-[#548ec4] text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out ${
                isSignUp ? "translate-x-1/2" : "translate-x-0"
              }`}
            >
              {/* Overlay Panel Left (Dành cho Sign In) */}
              <div
                className={`absolute flex flex-col items-center justify-center top-0 h-full w-1/2 px-10 text-center transform transition-transform duration-700 ease-in-out ${
                  isSignUp ? "translate-x-0" : "-translate-x-[20%]"
                }`}
              >
                <h1 className="font-bold text-3xl mb-4">Welcome Back!</h1>
                <p className="text-sm font-medium leading-6 mb-8 text-blue-50">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="bg-transparent border border-white rounded-full text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transform transition hover:bg-white hover:text-[#548ec4]"
                  onClick={() => handleSwitchMode(false)}
                >
                  Sign In
                </button>
              </div>

              {/* Overlay Panel Right (Dành cho Sign Up) */}
              <div
                className={`absolute right-0 flex flex-col items-center justify-center top-0 h-full w-1/2 px-10 text-center transform transition-transform duration-700 ease-in-out ${
                  isSignUp ? "translate-x-[20%]" : "translate-x-0"
                }`}
              >
                <h1 className="font-bold text-3xl mb-4">New Here?</h1>
                <p className="text-sm font-medium leading-6 mb-8 text-blue-50">
                  Enter your personal details and start your journey with
                  LuxeStay
                </p>
                <button
                  className="bg-transparent border border-white rounded-full text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transform transition hover:bg-white hover:text-[#548ec4]"
                  onClick={() => handleSwitchMode(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
