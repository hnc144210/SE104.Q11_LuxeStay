import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  LogIn,
  LogOut,
  Loader2,
  DollarSign,
  Calendar,
} from "lucide-react";
import { getDashboardStats } from "./api/adminApi"; // Import API mới

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardStats();
        if (res.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!data) return <div className="p-6">Không có dữ liệu báo cáo.</div>;

  // Destructuring dữ liệu từ Backend cho gọn
  const { cards, charts } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tổng quan hệ thống
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Cập nhật số liệu kinh doanh mới nhất hôm nay
          </p>
        </div>
        <div className="text-right hidden sm:block bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
            <Calendar size={16} /> {new Date().toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>

      {/* --- PHẦN 1: 4 THẺ KPI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Doanh thu hôm nay */}
        <StatCard
          title="Doanh thu hôm nay"
          value={cards.revenueToday.toLocaleString() + " đ"}
          icon={DollarSign}
          color="bg-blue-50 text-blue-600"
        />

        {/* Card 2: Tỉ lệ lấp đầy */}
        <StatCard
          title="Tỉ lệ lấp đầy"
          value={`${cards.occupancyRate}%`}
          subText={`${cards.occupiedRooms} / ${cards.totalRooms} phòng đang có khách`}
          icon={TrendingUp}
          color="bg-green-50 text-green-600"
        />

        {/* Card 3: Khách đến (Arrivals) */}
        <StatCard
          title="Khách đến (Check-in)"
          value={cards.checkInsToday}
          icon={LogIn}
          color="bg-purple-50 text-purple-600"
        />

        {/* Card 4: Khách đi (Departures) */}
        <StatCard
          title="Khách đi (Check-out)"
          value={cards.checkOutsToday}
          icon={LogOut}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* --- PHẦN 2: BIỂU ĐỒ DOANH THU & CẤU TRÚC KHÁCH --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: DOANH THU 7 NGÀY (Chiếm 2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg mb-6">
            Doanh thu 7 ngày gần nhất
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueLast7Days} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000000}M`} // Rút gọn số liệu trục Y
                />
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat("vi-VN").format(value) + " đ"
                  }
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{ fill: "#F3F4F6" }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: LOẠI KHÁCH (PIE CHART) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-2">
            Phân loại khách
          </h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.customerTypes}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.customerTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            {/* Label giữa biểu đồ */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <span className="text-gray-400 text-sm font-medium">Tỷ lệ</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- PHẦN 3: TOP LOẠI PHÒNG BÁN CHẠY --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg mb-4">
          Top loại phòng được đặt nhiều nhất (30 ngày)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {charts.topRoomTypes.map((room, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  #{idx + 1}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{room.name}</p>
                  <p className="text-xs text-gray-500">{room.value} lượt đặt</p>
                </div>
              </div>
            </div>
          ))}
          {charts.topRoomTypes.length === 0 && (
            <p className="text-gray-400 text-sm">Chưa có dữ liệu.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Component con: Thẻ thống kê nhỏ
const StatCard = ({ title, value, subText, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-2">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {subText && <p className="text-xs text-gray-400 mt-2">{subText}</p>}
  </div>
);

export default DashboardPage;
