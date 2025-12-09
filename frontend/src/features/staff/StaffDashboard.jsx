import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogIn,
  LogOut,
  BedDouble,
  Users,
  CalendarClock,
  ChevronRight,
} from "lucide-react";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    arrivals: 0,
    departures: 0,
    staying: 0,
    availableRooms: 0,
  });
  const [loading, setLoading] = useState(true);

  // Component Card Thống kê
  const StatCard = ({ title, value, icon: Icon, color, onClick, subText }) => (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition">
            {loading ? "..." : value}
          </h3>
          {subText && <p className="text-xs text-gray-400 mt-2">{subText}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Xin chào, Lễ tân 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Đây là tổng quan công việc hôm nay của bạn.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-700">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Khách sắp đến (Arrivals)"
          value={stats.arrivals}
          icon={LogIn}
          color="bg-blue-500 text-blue-600"
          onClick={() => navigate("/staff/checkin")}
          subText="Booking cần Check-in hôm nay"
        />
        <StatCard
          title="Khách sắp đi (Departures)"
          value={stats.departures}
          icon={LogOut}
          color="bg-orange-500 text-orange-600"
          onClick={() => navigate("/staff/checkout")}
          subText="Phòng cần Check-out hôm nay"
        />
        <StatCard
          title="Đang lưu trú"
          value={stats.staying}
          icon={Users}
          color="bg-purple-500 text-purple-600"
          onClick={() => navigate("/staff/bookings")}
          subText="Tổng số phòng đang có khách"
        />
        <StatCard
          title="Phòng trống (Available)"
          value={stats.availableRooms}
          icon={BedDouble}
          color="bg-green-500 text-green-600"
          onClick={() => navigate("/staff/checkin")} // Dẫn tới checkin walk-in
          subText="Sẵn sàng đón khách lẻ"
        />
      </div>

      {/* 2. QUICK ACTIONS (Lối tắt) */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Nút Check-in */}
          <button
            onClick={() => navigate("/staff/checkin")}
            className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl text-white shadow-lg shadow-blue-200 hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <LogIn size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">Check In</p>
                <p className="text-blue-100 text-xs">Nhận phòng mới</p>
              </div>
            </div>
            <ChevronRight />
          </button>

          {/* Nút Check-out */}
          <button
            onClick={() => navigate("/staff/checkout")}
            className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:border-orange-200 hover:bg-orange-50 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-200">
                <LogOut size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg group-hover:text-orange-700">
                  Check Out
                </p>
                <p className="text-gray-400 text-xs group-hover:text-orange-600">
                  Trả phòng & Thanh toán
                </p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-orange-500" />
          </button>

          {/* Nút Xem Booking */}
          <button
            onClick={() => navigate("/staff/bookings")}
            className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:border-purple-200 hover:bg-purple-50 transition group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-200">
                <CalendarClock size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg group-hover:text-purple-700">
                  Lịch đặt phòng
                </p>
                <p className="text-gray-400 text-xs group-hover:text-purple-600">
                  Xem danh sách booking
                </p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-purple-500" />
          </button>
        </div>
      </div>

      {/* 3. Có thể thêm danh sách khách sắp đến gần nhất ở đây nếu muốn */}
    </div>
  );
};

export default StaffDashboard;
//src/features/staff/StaffDashboard.jsx
