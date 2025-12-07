import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  AlertCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getMyBookings, cancelMyBooking } from "./api/bookingApi";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // --- STATE MỚI CHO MODAL & THÔNG BÁO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false); // Loading khi đang hủy
  const [successMessage, setSuccessMessage] = useState(""); // Thông báo thành công

  // Hàm gọi API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error("Lỗi tải lịch sử:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Tự động tắt thông báo thành công sau 3 giây
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 1. Khi bấm nút "Hủy phòng" -> Mở Modal
  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  // 2. Khi bấm "Xác nhận" trong Modal -> Gọi API
  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;

    try {
      setIsCanceling(true);
      await cancelMyBooking(selectedBookingId);

      // Thành công
      setSuccessMessage("Đã hủy phòng thành công!");
      setIsModalOpen(false); // Đóng modal
      fetchBookings(); // Tải lại danh sách
    } catch (err) {
      // Dùng setError của trang hoặc alert nhẹ nếu cần
      alert(err.message || "Lỗi khi hủy phòng");
    } finally {
      setIsCanceling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <Clock size={14} /> Chờ duyệt
          </span>
        );
      case "confirmed":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <CheckCircle size={14} /> Đã xác nhận
          </span>
        );
      case "checked_in":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <Home size={14} /> Đang ở
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <XCircle size={14} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "cancelled") return b.status === "cancelled";
    if (activeTab === "completed")
      return (
        b.status === "checked_out" || new Date(b.check_out_date) < new Date()
      );
    if (activeTab === "upcoming")
      return (
        ["pending", "confirmed"].includes(b.status) &&
        new Date(b.check_out_date) >= new Date()
      );
    return true;
  });

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative">
      <Navbar />

      {/* THÔNG BÁO THÀNH CÔNG (TOAST MESSAGE) */}
      {successMessage && (
        <div className="fixed top-24 right-5 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce-in">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      <div className="container mx-auto px-4 py-8 pt-24 max-w-5xl flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#181E4B]">
            Lịch sử đặt phòng
          </h1>
          <p className="text-gray-500 mt-2">
            Quản lý và xem lại các chuyến đi của bạn
          </p>
        </div>

        <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
          {[
            { id: "all", label: "Tất cả" },
            { id: "upcoming", label: "Sắp tới" },
            { id: "completed", label: "Hoàn thành" },
            { id: "cancelled", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-[-9px] left-0 w-full h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-sm h-40 animate-pulse"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-4 text-blue-600 hover:underline"
            >
              Thử lại
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-blue-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              Chưa có đơn đặt phòng nào
            </h3>
            <p className="text-gray-500 mb-6">
              Bạn chưa có chuyến đi nào trong mục này.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-[#DF6951] text-white font-bold rounded-xl hover:bg-orange-600 transition shadow-md"
            >
              Đặt phòng ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const roomName =
                booking.rooms?.room_types?.name || "Phòng không xác định";
              const roomNumber = booking.rooms?.room_number || "N/A";
              const totalPrice = booking.total_amount || 0;
              const deposit = booking.deposit_amount || 0;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80"
                        alt="Room"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                            Mã đơn: #{booking.id.toString().padStart(6, "0")}
                          </p>
                          <h3 className="text-xl font-bold text-[#181E4B]">
                            {roomName}{" "}
                            <span className="text-gray-400 font-normal">
                              - P{roomNumber}
                            </span>
                          </h3>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-[#DF6951]" />
                          <span>
                            Check-in:{" "}
                            <strong>
                              {format(
                                new Date(booking.check_in_date),
                                "dd/MM/yyyy"
                              )}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-[#DF6951]" />
                          <span>
                            Check-out:{" "}
                            <strong>
                              {format(
                                new Date(booking.check_out_date),
                                "dd/MM/yyyy"
                              )}
                            </strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-[#DF6951]" />
                          <span>Việt Nam</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-[#DF6951]" />
                          <span>Cọc: {Number(deposit).toLocaleString()} đ</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                      <div className="text-right mb-4 md:mb-0">
                        <p className="text-xs text-gray-500">Tổng cộng</p>
                        <p className="text-xl font-bold text-[#DF6951]">
                          {totalPrice > 0
                            ? `${Number(totalPrice).toLocaleString()} đ`
                            : "Liên hệ"}
                        </p>
                      </div>

                      {["pending", "confirmed"].includes(booking.status) && (
                        <button
                          // THAY ĐỔI: Gọi hàm mở modal thay vì window.confirm
                          onClick={() => openCancelModal(booking.id)}
                          className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 text-sm w-full transition"
                        >
                          Hủy phòng
                        </button>
                      )}

                      {booking.status === "completed" && (
                        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm w-full transition">
                          Đặt lại
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL XÁC NHẬN HỦY (CUSTOM UI) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay làm mờ nền */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => !isCanceling && setIsModalOpen(false)}
          ></div>

          {/* Hộp thoại chính */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all scale-100">
            {/* Header Modal */}
            <div className="bg-red-50 p-6 flex flex-col items-center justify-center text-center border-b border-red-100">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Xác nhận hủy phòng?
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn hủy đơn
                đặt phòng này không?
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isCanceling}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCanceling}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isCanceling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang hủy...
                  </>
                ) : (
                  "Đồng ý Hủy"
                )}
              </button>
            </div>

            {/* Nút đóng góc trên */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
