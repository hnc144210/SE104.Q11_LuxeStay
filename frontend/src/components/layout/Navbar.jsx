import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuthContext } from "../../features/context/AuthContext.jsx";
import { User, History, CalendarCheck } from "lucide-react";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // State quản lý dropdown

  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Xử lý cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out flex justify-between items-center px-4 md:px-20 max-w-full mx-auto
      ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-4"
          : "bg-transparent py-6"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 cursor-pointer">
        <img
          src="/picture/logo.png"
          alt="LuxeStay"
          className="w-10 h-10 object-contain"
        />
        <div className="text-2xl font-bold text-gray-800">LuxeStay</div>
      </Link>

      {/* Menu Desktop */}
      <div className="hidden md:flex items-center gap-10">
        <ul className="flex gap-8 text-gray-800 font-medium">
          <li className="cursor-pointer hover:text-blue-500 transition">
            Destinations
          </li>
          <li className="cursor-pointer hover:text-blue-500 transition">
            Hotels
          </li>
          <li className="cursor-pointer hover:text-blue-500 transition">
            Bookings
          </li>
        </ul>

        <div className="flex items-center gap-6 font-medium text-gray-800">
          {/* --- LOGIC HIỂN THỊ USER / LOGIN --- */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:text-blue-500 transition focus:outline-none"
              >
                <FaUserCircle className="text-2xl" />
                <span className="max-w-[100px] truncate">
                  {user.full_name || "User"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-[220px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden animate-fade-in-down">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">
                      Xin chào, <strong>{user.full_name}</strong>
                    </p>
                    <p className="text-xs text-gray-400 uppercase mt-1">
                      {user.role}
                    </p>
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <History size={16} />
                    Lịch sử đặt phòng
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <User size={16} />
                    Hồ sơ cá nhân
                  </Link>

                  {/* --- SỬA LOGIC Ở ĐÂY --- */}
                  {["admin", "staff"].includes(user.role) && (
                    <Link
                      // Kiểm tra role để điều hướng đúng trang Dashboard
                      to={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : "/staff/dashboard"
                      }
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition"
                    >
                      <CalendarCheck size={16} />
                      {/* Hiển thị text khác nhau cho dễ phân biệt (Tùy chọn) */}
                      {user.role === "admin"
                        ? "Trang quản trị Admin"
                        : "Trang làm việc Staff"}
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left border-t border-gray-100 mt-1"
                  >
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" className="hover:text-blue-500 transition">
                Login
              </Link>
              <Link
                to="/auth"
                state={{ mode: "signup" }}
                className="px-5 py-2 border-2 border-gray-800 rounded-lg hover:bg-gray-800 hover:text-white transition"
              >
                Sign up
              </Link>
            </>
          )}

          <button className="flex items-center gap-1 hover:text-blue-500 transition">
            EN <span className="text-xs">▼</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden text-2xl cursor-pointer">☰</div>
    </nav>
  );
};

export default Navbar;
