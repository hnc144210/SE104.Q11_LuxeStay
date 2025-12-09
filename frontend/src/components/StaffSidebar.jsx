import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  CalendarDays,
  Users,
  LogOut as SignOutIcon,
} from "lucide-react";
import { useAuthContext } from "../features/context/AuthContext"; // Sửa đường dẫn cho đúng
import { Link } from "react-router-dom";
const StaffSidebar = () => {
  const { logout } = useAuthContext();

  const navItems = [
    { icon: LayoutDashboard, label: "Tổng quan", path: "/staff/dashboard" },
    { icon: CalendarDays, label: "Lịch đặt phòng", path: "/staff/bookings" },
    { icon: LogIn, label: "Check In", path: "/staff/checkin" },
    { icon: LogOut, label: "Check Out", path: "/staff/checkout" },
    { icon: Users, label: "Khách hàng", path: "/staff/customers" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link to="/" className="text-xl font-extrabold text-blue-600">
          LuxeStay
        </Link>
        <span className="ml-2 text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase">
          Staff
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-bold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <SignOutIcon size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
//src/components/StaffSidebar.jsx
