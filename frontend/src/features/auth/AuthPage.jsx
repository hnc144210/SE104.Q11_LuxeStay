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
  const { login, register } = useAuthContext();
  const navigate = useNavigate();
  // --- STATE UI ---
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="flex flex-col items-center justify-center min-h-screen font-sans py-10 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>

      {/* Floating shapes for modern effect */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Modern logo/title with gradient */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
            LuxeStay
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Your Gateway to Luxury Accommodations
          </p>
        </div>

        <div className="relative overflow-hidden w-[768px] max-w-full min-h-[650px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
          {/* --- SIGN UP FORM (ĐĂNG KÝ) --- */}
          <div
            className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 flex items-center justify-center ${
              isSignUp ? "translate-x-full opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-transparent flex flex-col items-center justify-center h-full w-full px-10 text-center"
            >
              <h1 className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
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
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-110"
                >
                  <FaGoogle />
                </button>
                <button
                  type="button"
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-110"
                >
                  <FaFacebookF />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                or use your email for registration
              </p>

              {/* Full Name */}
              <div className="relative w-full mb-2">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="bg-white border-2 border-gray-200 py-3 pl-12 pr-4 w-full rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition-all duration-300"
                />
              </div>

              {/* Phone Number */}
              <div className="relative w-full mb-2">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="bg-white border-2 border-gray-200 py-3 pl-12 pr-4 w-full rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition-all duration-300"
                />
              </div>

              {/* Identity Card */}
              <div className="relative w-full mb-2">
                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  name="identity_card"
                  value={formData.identity_card}
                  onChange={handleChange}
                  placeholder="ID Card / CCCD"
                  required
                  className="bg-white border-2 border-gray-200 py-3 pl-12 pr-4 w-full rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div className="relative w-full mb-2">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="bg-white border-2 border-gray-200 py-3 pl-12 pr-4 w-full rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition-all duration-300"
                />
              </div>

              {/* Password */}
              <div className="relative w-full mb-2">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="bg-white border-2 border-gray-200 py-3 pl-12 pr-10 w-full rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition-all duration-300"
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative w-full mb-3">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  className="bg-white border-2 border-gray-200 py-3 pl-12 pr-10 w-full rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm transition-all duration-300"
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transform transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
              className="bg-transparent flex flex-col items-center justify-center h-full w-full px-10 text-center"
            >
              <h1 className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
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
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-110"
                >
                  <FaGoogle />
                </button>
                <button
                  type="button"
                  className="w-10 h-10 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-110"
                >
                  <FaFacebookF />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">or use your account</p>

              {/* Email */}
              <div className="relative w-full mb-3">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="bg-white border-2 border-gray-200 py-3 pl-12 pr-4 w-full rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                />
              </div>

              {/* Password */}
              <div className="relative w-full mb-3">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="bg-white border-2 border-gray-200 py-3 pl-12 pr-10 w-full rounded-xl outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <a
                href="#"
                className="text-gray-600 text-sm my-4 hover:text-blue-600 transition-colors duration-300 font-medium"
              >
                Forgot your password?
              </a>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transform transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
              className={`bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out ${
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
                  className="bg-white/10 backdrop-blur-sm border-2 border-white rounded-xl text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transform transition-all duration-300 hover:bg-white hover:text-indigo-600 hover:scale-105"
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
                  className="bg-white/10 backdrop-blur-sm border-2 border-white rounded-xl text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transform transition-all duration-300 hover:bg-white hover:text-indigo-600 hover:scale-105"
                  onClick={() => handleSwitchMode(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
