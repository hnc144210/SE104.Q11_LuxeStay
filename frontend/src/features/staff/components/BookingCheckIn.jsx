import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  X,
  User,
  Phone,
  Calendar,
  Loader2,
  BedDouble,
  ArrowRight,
} from "lucide-react";
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
      const res = await getStaffBookings();
      const allBookings = res.data || [];

      // Chỉ lấy các booking sắp đến (Pending hoặc Confirmed) để check-in
      const validBookings = allBookings.filter(
        (b) => b.status === "pending" || b.status === "confirmed"
      );
      setBookings(validBookings);
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
    // Lưu ý: Dùng b.customer và b.room (số ít) theo log API
    return (
      b.customer?.full_name?.toLowerCase().includes(term) ||
      b.customer?.phone_number?.includes(term) ||
      b.room?.room_number?.toString().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="text-green-600" /> Check-in Đặt Trước
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xử lý nhận phòng cho khách đã có Booking (Online).
          </p>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition"
            size={18}
          />
          <input
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-green-500 outline-none w-64 shadow-sm transition bg-gray-50 focus:bg-white"
            placeholder="Tìm tên, SĐT, phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLE DANH SÁCH --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-[30%]">Khách hàng</th>
              <th className="px-6 py-4 w-[20%]">Phòng</th>
              <th className="px-6 py-4 w-[30%]">Thời gian</th>
              <th className="px-6 py-4 w-[20%] text-right">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2
                      className="animate-spin text-green-500"
                      size={32}
                    />
                    <span className="text-sm font-medium">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-12 text-center text-gray-400 italic bg-gray-50/30"
                >
                  Không tìm thấy đơn đặt phòng nào cần Check-in.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-green-50/30 transition group"
                >
                  {/* CỘT 1: KHÁCH HÀNG */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shadow-sm">
                        {b.customer?.full_name?.charAt(0).toUpperCase() || "K"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">
                          {b.customer?.full_name || "Khách hàng"}
                        </p>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                          <Phone size={12} />
                          <span>{b.customer?.phone_number || "---"}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CỘT 2: PHÒNG */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-md text-sm border border-green-200 shadow-sm">
                        {b.room?.room_number}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <BedDouble size={12} />{" "}
                        {b.room?.room_type?.name || "Loại phòng"}
                      </span>
                    </div>
                  </td>

                  {/* CỘT 3: THỜI GIAN */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 w-fit">
                      <Calendar size={16} className="text-gray-400" />
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span>
                          {new Date(b.check_in_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <ArrowRight size={12} className="text-gray-400" />
                        <span>
                          {new Date(b.check_out_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* CỘT 4: HÀNH ĐỘNG */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setDepositAmount(b.deposit_amount || 0);
                      }}
                      className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 shadow-md shadow-green-200 flex items-center gap-2 ml-auto transition active:scale-95"
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

      {/* --- MODAL CHECK-IN --- */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" /> Xác nhận
                Check-in
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="text-sm bg-blue-50 p-4 rounded-xl text-blue-900 border border-blue-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-600/70">Khách hàng</span>
                  <span className="font-bold">
                    {selectedBooking.customer?.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600/70">Phòng</span>
                  <span className="font-bold">
                    {selectedBooking.room?.room_number}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                  Tiền cọc thực thu (VND)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-800 text-right text-lg"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    đ
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1 text-right italic">
                  *Nhập số tiền khách thực tế đóng cọc
                </p>
              </div>

              <button
                onClick={handleConfirmCheckIn}
                className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition active:scale-[0.98] flex justify-center items-center gap-2"
              >
                <CheckCircle size={20} /> Xác nhận & Giao phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCheckIn;
