import React, { useState, useEffect } from "react";
import { Search, CheckCircle, X } from "lucide-react";
import { getStaffBookings, checkInFromBooking } from "../api/staffApi";

const BookingCheckIn = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getStaffBookings({ status: "confirmed" });
      setBookings(res.data || []);
    } catch (err) {
      console.error("Lỗi fetch booking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCheckIn = async () => {
    if (!selectedBooking) return;
    try {
      await checkInFromBooking({
        booking_id: selectedBooking.id,
        deposit_amount: parseInt(depositAmount),
      });
      alert("✅ Check-in thành công!");
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = bookings.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.customers?.full_name?.toLowerCase().includes(term) ||
      b.rooms?.room_number?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-blue-500 transition"
          placeholder="Tìm theo tên khách hoặc phòng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
            <tr>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Phòng</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400">
                  Không có dữ liệu phù hợp
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/50 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-800">
                      {b.customers?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.customers?.phone_number}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">
                      {b.rooms?.room_number}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(b.check_in_date).toLocaleDateString("vi-VN")} →{" "}
                    {new Date(b.check_out_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setDepositAmount(b.deposit_amount || 0);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm flex items-center gap-2 ml-auto transition"
                    >
                      <CheckCircle size={16} /> Nhận phòng
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Xác nhận Check-in</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm bg-blue-50 p-3 rounded-lg text-blue-800 border border-blue-100">
                Khách: <strong>{selectedBooking.customers?.full_name}</strong>
                <br />
                Phòng: <strong>{selectedBooking.rooms?.room_number}</strong>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Tiền cọc thực thu (VND)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-800 text-right"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <button
                onClick={handleConfirmCheckIn}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCheckIn;
