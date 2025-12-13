import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogIn,
  LogOut,
  BedDouble,
  Users,
  CalendarClock,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";

// Import API lấy thống kê
import { getStaffStats } from "./api/staffApi";

const StaffDashboard = () => {
  const navigate = useNavigate();

  // State lưu dữ liệu thống kê
  const [stats, setStats] = useState({
    arrivals: 0,
    departures: 0,
    staying: 0,
    availableRooms: 0,
  });

  // State trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);

  // State cho đồng hồ thời gian thực
  const [currentTime, setCurrentTime] = useState(new Date());

  // useEffect để gọi API khi component được mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getStaffStats();
        if (response && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thống kê Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Component Card Thống kê
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    bgColor,
    onClick,
    subText,
    trend,
  }) => (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-100"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-800">
              {loading ? "..." : value}
            </h3>
            {trend && (
              <span className="flex items-center text-green-600 text-xs font-medium">
                <TrendingUp size={12} className="mr-1" />
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
        </div>
      </div>
      {subText && (
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
          {subText}
        </p>
      )}
      <ChevronRight
        className="absolute bottom-4 right-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
        size={16}
      />
    </div>
  );

  // Quick Action Button Component
  const QuickActionButton = ({
    title,
    subtitle,
    icon: Icon,
    color,
    bgColor,
    onClick,
    primary,
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group ${
        primary
          ? `${bgColor} ${color}`
          : "bg-white border border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          className={`p-2.5 rounded-lg ${primary ? "bg-white/20" : bgColor}`}
        >
          <Icon
            size={20}
            className={primary ? "text-white" : color}
            strokeWidth={2}
          />
        </div>
        <div className="text-left">
          <p
            className={`font-semibold text-base ${
              primary ? "text-white" : "text-gray-800"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-xs ${primary ? "text-white/80" : "text-gray-500"}`}
          >
            {subtitle}
          </p>
        </div>
      </div>
      <ChevronRight
        className={`${
          primary ? "text-white/80" : "text-gray-400"
        } group-hover:translate-x-0.5 transition-transform duration-200`}
        size={18}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Xin chào, Lễ tân 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Đây là tổng quan công việc hôm nay của bạn
            </p>
          </div>

          {/* Clock card */}
          <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={18} />
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">
                  {currentTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Khách sắp đến"
            value={stats.arrivals}
            icon={LogIn}
            color="text-blue-600"
            bgColor="bg-blue-50"
            onClick={() => navigate("/staff/checkin")}
            subText="Booking cần Check-in hôm nay"
            trend="+2"
          />
          <StatCard
            title="Khách sắp đi"
            value={stats.departures}
            icon={LogOut}
            color="text-orange-600"
            bgColor="bg-orange-50"
            onClick={() => navigate("/staff/checkout")}
            subText="Phòng cần Check-out hôm nay"
          />
          <StatCard
            title="Đang lưu trú"
            value={stats.staying}
            icon={Users}
            color="text-purple-600"
            bgColor="bg-purple-50"
            onClick={() => navigate("/staff/bookings")}
            subText="Tổng số phòng đang có khách"
            trend="+5"
          />
          <StatCard
            title="Phòng trống"
            value={stats.availableRooms}
            icon={BedDouble}
            color="text-green-600"
            bgColor="bg-green-50"
            onClick={() => navigate("/staff/checkin")}
            subText="Sẵn sàng đón khách mới"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800">Thao tác nhanh</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <QuickActionButton
              title="Check In"
              subtitle="Nhận phòng khách mới"
              icon={LogIn}
              color="text-blue-600"
              bgColor="bg-blue-50"
              onClick={() => navigate("/staff/checkin")}
            />

            <QuickActionButton
              title="Check Out"
              subtitle="Trả phòng & Thanh toán"
              icon={LogOut}
              color="text-orange-600"
              bgColor="bg-orange-50"
              onClick={() => navigate("/staff/checkout")}
            />

            <QuickActionButton
              title="Lịch đặt phòng"
              subtitle="Xem danh sách booking"
              icon={CalendarClock}
              color="text-purple-600"
              bgColor="bg-purple-50"
              onClick={() => navigate("/staff/bookings")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
