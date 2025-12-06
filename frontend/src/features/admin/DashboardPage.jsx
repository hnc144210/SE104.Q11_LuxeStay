import React from "react";
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
  LineChart,
  Line,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";

// --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
const revenueData = [
  { name: "01", revenue: 4000 },
  { name: "02", revenue: 3000 },
  { name: "03", revenue: 5000 },
  { name: "04", revenue: 2780 },
  { name: "05", revenue: 6890 },
  { name: "06", revenue: 6390 },
  { name: "07", revenue: 3490 },
  { name: "08", revenue: 4490 },
  { name: "09", revenue: 5490 },
  { name: "10", revenue: 3490 },
];

const bookingTimeData = [
  { name: "Afternoon", value: 400, color: "#4F46E5" }, // Indigo
  { name: "Evening", value: 300, color: "#818CF8" }, // Light Indigo
  { name: "Morning", value: 300, color: "#C7D2FE" }, // Very Light Indigo
];

const ratingData = [
  { name: "Quality", value: 85, color: "#8B5CF6" }, // Purple
  { name: "Attitude", value: 85, color: "#F59E0B" }, // Orange
  { name: "Responsive", value: 92, color: "#06B6D4" }, // Cyan
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* 1. TOP ROW: REVENUE CHART & BOOKING TIME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE CHART (Chiếm 2/3) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                Doanh thu (Revenue)
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                7.852.000 đ
              </p>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium mt-1">
                <ArrowUpRight size={16} />
                <span>2.1% so với tuần trước</span>
              </div>
            </div>
            <button className="text-blue-600 text-sm font-semibold hover:underline">
              Xem báo cáo
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barSize={12}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    color: "#fff",
                    borderRadius: "8px",
                    border: "none",
                  }}
                  cursor={{ fill: "#F3F4F6" }}
                />
                <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOOKING TIME (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Thời gian đặt</h3>
            <MoreHorizontal
              size={20}
              className="text-gray-400 cursor-pointer"
            />
          </div>

          <div className="flex-grow flex items-center justify-center relative">
            {/* Tooltip giả lập ở giữa */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-800">
                  1000
                </span>
                <span className="text-xs text-gray-500">Booking</span>
              </div>
            </div>

            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingTimeData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 flex justify-between text-center">
            {bookingTimeData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-500">{item.name}</span>
                </div>
                <span className="font-bold text-sm">{item.value / 10}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM ROW: RATING, DESTINATIONS, TRENDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* RATING (Bubbles Style - Mockup bằng HTML/CSS đơn giản) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-2">Đánh giá của bạn</h3>
          <p className="text-gray-400 text-xs mb-6">
            Tổng hợp từ phản hồi khách hàng
          </p>

          <div className="relative h-48 flex items-center justify-center">
            {/* Giả lập các vòng tròn như hình */}
            <div className="absolute top-0 left-10 w-24 h-24 rounded-full bg-purple-500 text-white flex flex-col items-center justify-center shadow-lg opacity-90 z-10">
              <span className="font-bold text-xl">85%</span>
              <span className="text-xs">Chất lượng</span>
            </div>
            <div className="absolute top-8 right-6 w-28 h-28 rounded-full bg-orange-400 text-white flex flex-col items-center justify-center shadow-lg opacity-90 z-0">
              <span className="font-bold text-xl">85%</span>
              <span className="text-xs">Thái độ</span>
            </div>
            <div className="absolute bottom-0 left-16 w-24 h-24 rounded-full bg-cyan-500 text-white flex flex-col items-center justify-center shadow-lg opacity-90 z-20">
              <span className="font-bold text-xl">92%</span>
              <span className="text-xs">Phản hồi</span>
            </div>
          </div>
        </div>

        {/* MOST DESTINATIONS (List) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Địa điểm hot nhất</h3>
          <div className="space-y-5">
            {[
              { name: "Đà Lạt", price: "450.000", bg: "bg-gray-200" },
              { name: "Nha Trang", price: "750.000", bg: "bg-blue-100" },
              { name: "Đà Nẵng", price: "450.000", bg: "bg-green-100" },
              { name: "Khánh Hòa", price: "450.000", bg: "bg-yellow-100" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${item.bg}`}></div>
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-400">
                  {item.price} IDR
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BOOKING TREND (Line Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-800">Lượt đặt phòng</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">2.568</p>
              <div className="flex items-center gap-1 text-red-500 text-sm font-medium mt-1">
                <ArrowDownRight size={16} />
                <span>2.1% so với tuần trước</span>
              </div>
            </div>
            <button className="text-blue-600 text-xs border border-blue-100 px-3 py-1 rounded-full">
              Report
            </button>
          </div>

          <div className="h-40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E5E7EB"
                  strokeWidth={3}
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
