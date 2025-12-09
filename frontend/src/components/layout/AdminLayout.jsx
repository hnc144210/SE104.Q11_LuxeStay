import React from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import {
  LogIn,
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  UserCog, // <--- 1. Import thêm icon này cho Staff
} from "lucide-react";
import { useAuthContext } from "../../features/context/AuthContext";

const AdminLayout = () => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // --- 2. CẬP NHẬT MENU SIDEBAR ---
  const navItems = [
    { icon: LayoutDashboard, label: "Tổng quan", path: "/admin/dashboard" },
    { icon: BedDouble, label: "Quản lý Phòng", path: "/admin/rooms" },
    { icon: CalendarCheck, label: "Quản lý Booking", path: "/admin/bookings" },

    // Thêm mục Nhân viên vào đây (Path khớp với App.js)
    { icon: UserCog, label: "Nhân viên", path: "/admin/staffs" },

    { icon: Users, label: "Khách hàng", path: "/admin/customers" },
    { icon: LogIn, label: "Check In", path: "/admin/checkin" },
    { icon: Settings, label: "Cài đặt", path: "/admin/settings" },
  ];

  // Lấy tiêu đề trang dựa trên path hiện tại
  const getPageTitle = () => {
    const currentPath = navItems.find((item) =>
      location.pathname.includes(item.path)
    );
    return currentPath ? currentPath.label : "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* --- 1. SIDEBAR (CỐ ĐỊNH) --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <Link
            to="/"
            className="text-2xl font-extrabold text-blue-600 tracking-tight"
          >
            LuxeStay
          </Link>
          <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
            Admin
          </span>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm translate-x-1"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- 2. MAIN AREA (CONTENT) --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header (Sticky) */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {getPageTitle()}
            </h2>
            <p className="text-sm text-gray-400">
              Chào mừng quay trở lại, Admin!
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Search bar nhỏ trên header */}
            <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-lg">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Tìm nhanh..."
                className="bg-transparent border-none outline-none text-sm ml-2 w-32"
              />
            </div>

            <button className="relative p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
