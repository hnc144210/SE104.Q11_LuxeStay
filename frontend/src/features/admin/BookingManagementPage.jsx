import React, { useState, useEffect } from "react";
import { getAllBookings, cancelBookingByAdmin } from "./api/adminApi";
import { Calendar, Filter, XCircle, Search, User } from "lucide-react";

const BookingManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings(
        filter !== "all" ? { status: filter } : {}
      );
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm("Hủy đơn này?")) return;
    try {
      await cancelBookingByAdmin(id);
      fetchAllBookings();
    } catch (e) {
      alert("Lỗi hủy");
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "N/A";

  // Helper Badge
  const getStatusBadge = (status) => {
    const styles = {
      confirmed: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      cancelled: "bg-red-50 text-red-600 border-red-100",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
          styles[status] || "bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 py-2 px-3 rounded-xl outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Phòng
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition group">
                    <td className="p-5">
                      <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        #{b.id.toString().substring(0, 6)}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">
                            {b.customers?.full_name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {b.customers?.phone_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 font-bold text-gray-700">
                      {b.rooms?.room_number || "---"}
                    </td>
                    <td className="p-5 text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>{" "}
                        {formatDate(b.check_in_date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>{" "}
                        {formatDate(b.check_out_date)}
                      </div>
                    </td>
                    <td className="p-5">{getStatusBadge(b.status)}</td>
                    <td className="p-5 text-right">
                      {["pending", "confirmed"].includes(b.status) && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                          title="Hủy đơn này"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManagementPage;
