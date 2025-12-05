import React, { useState, useEffect } from "react";
// [FIX] Named Import
import {
  getAllBookings,
  cancelBookingByAdmin,
} from "../booking/api/bookingApi"; // Chú ý đường dẫn tương đối

const BookingManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      // [FIX] Gọi hàm
      const response = await getAllBookings(params);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm("Admin: Bạn chắc chắn muốn hủy đơn này?")) return;
    try {
      // [FIX] Gọi hàm
      await cancelBookingByAdmin(id);
      alert("Đã hủy thành công");
      fetchAllBookings();
    } catch (err) {
      alert("Lỗi khi hủy");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đặt phòng</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">Khách hàng</th>
              <th className="p-4 font-semibold text-gray-600">Phòng</th>
              <th className="p-4 font-semibold text-gray-600">Check-in/Out</th>
              <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 font-semibold text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm font-mono text-gray-500">
                    #{b.id.toString().substring(0, 6)}
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{b.customers?.full_name}</p>
                    <p className="text-xs text-gray-500">
                      {b.customers?.phone_number}
                    </p>
                  </td>
                  <td className="p-4">{b.rooms?.room_number}</td>
                  <td className="p-4 text-sm">
                    <div>In: {b.check_in_date}</div>
                    <div>Out: {b.check_out_date}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        b.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : b.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {["pending", "confirmed"].includes(b.status) && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Hủy đơn
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
  );
};

export default BookingManagementPage;
