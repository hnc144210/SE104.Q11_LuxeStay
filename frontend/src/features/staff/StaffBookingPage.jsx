import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Edit,
  User,
  Phone,
  BedDouble,
  CalendarRange,
  Users,
} from "lucide-react";
import { getStaffBookings } from "./api/staffApi";
import EditBookingModal from "./components/EditBookingModal";

const StaffBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getStaffBookings();
      if (res.success) {
        // Chỉ lấy các booking Pending hoặc Confirmed theo yêu cầu nghiệp vụ
        const upcomingBookings = res.data.filter((b) =>
          ["pending", "confirmed"].includes(b.status)
        );
        setBookings(upcomingBookings);
      }
    } catch (err) {
      console.error("Lỗi tải booking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logic lọc và tìm kiếm
  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;

    const term = searchTerm.toLowerCase();
    const guestName = b.customer?.full_name?.toLowerCase() || "";
    const phone = b.customer?.phone_number || "";
    const roomNum = b.room?.room_number?.toString() || "";

    return (
      guestName.includes(term) || phone.includes(term) || roomNum.includes(term)
    );
  });

  const renderStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      checked_in: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };

    const labels = {
      pending: "Chờ duyệt",
      confirmed: "Đã xác nhận",
      checked_in: "Đang ở",
      cancelled: "Đã hủy",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
          styles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            status === "pending" ? "bg-yellow-500 animate-pulse" : "bg-current"
          }`}
        ></span>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="text-blue-600" /> Quản Lý Đặt Phòng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách khách sắp đến cần xử lý (Pending & Confirmed).
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition"
              size={18}
            />
            <input
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 outline-none w-64 shadow-sm transition bg-gray-50 focus:bg-white"
              placeholder="Tìm khách, SĐT, phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- FILTER TABS --- */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {[
          { key: "all", label: `Tất cả (${bookings.length})` },
          { key: "pending", label: "Chờ duyệt" },
          { key: "confirmed", label: "Đã xác nhận" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 ${
              filterStatus === tab.key
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- TABLE DANH SÁCH --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-[25%]">Khách hàng</th>
              <th className="px-6 py-4 w-[15%]">Phòng</th>
              <th className="px-6 py-4 w-[25%]">Thời gian lưu trú</th>
              <th className="px-6 py-4 w-[10%] text-center">Khách</th>
              <th className="px-6 py-4 w-[15%] text-center">Trạng thái</th>
              <th className="px-6 py-4 w-[10%] text-right">Tùy chọn</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <span className="text-sm font-medium">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="py-12 text-center text-gray-400 italic bg-gray-50/30"
                >
                  Không tìm thấy đơn đặt phòng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/30 transition group">
                  {/* CỘT 1: KHÁCH HÀNG */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {b.customer?.full_name?.charAt(0).toUpperCase() || "K"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">
                          {b.customer?.full_name || "Khách vãng lai"}
                        </p>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                          <Phone size={12} />
                          <span>{b.customer?.phone_number || "---"}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* CỘT 2: PHÒNG */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md text-sm border border-blue-200 shadow-sm">
                        {b.room?.room_number}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <BedDouble size={12} /> {b.room?.room_type?.name}
                      </span>
                    </div>
                  </td>

                  {/* CỘT 3: THỜI GIAN */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 w-fit">
                      <CalendarRange size={16} className="text-gray-400" />
                      <div className="flex flex-col text-xs font-medium">
                        <span>
                          {new Date(b.check_in_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span className="text-gray-400">đến</span>
                        <span>
                          {new Date(b.check_out_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* CỘT 4: SỐ KHÁCH */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600 font-medium">
                      <Users size={16} />
                      <span>{b.num_guests || 1}</span>
                    </div>
                  </td>

                  {/* CỘT 5: TRẠNG THÁI */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {renderStatusBadge(b.status)}
                    </div>
                  </td>

                  {/* CỘT 6: THAO TÁC */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition duration-200"
                      title="Chỉnh sửa Booking"
                    >
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL SỬA */}
      {selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default StaffBookingsPage;
