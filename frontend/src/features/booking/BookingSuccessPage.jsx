import React, { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CheckCircle,
  Home,
  FileText,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  Loader,
} from "lucide-react";

// 👇 Sửa đường dẫn này trỏ đúng tới file api của bạn
import { getBookingById } from "../booking/api/bookingApi";

const BookingSuccessPage = () => {
  // 1. Lấy ID từ URL (ví dụ: /booking-success/123 -> id = 123)
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Fetch dữ liệu từ API dựa vào ID trên URL
  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getBookingById(id);

        if (res.success) {
          setBooking(res.data);
        } else {
          setError("Không tìm thấy thông tin đơn hàng.");
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết đơn:", err);
        setError("Không thể tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // --- Helper Functions ---
  const formatMoney = (amount) => Number(amount).toLocaleString("vi-VN") + " đ";
  const formatDate = (dateString) =>
    dateString ? format(new Date(dateString), "dd/MM/yyyy") : "N/A";

  // --- Render Logic ---

  // Bảo vệ: Nếu URL không có ID -> Về Home
  if (!id) {
    return <Navigate to="/" replace />;
  }

  // Màn hình Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-500 font-medium">Đang xác thực đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Màn hình Lỗi
  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-100 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // --- Xử lý dữ liệu hiển thị (Mapping Data) ---
  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;

  // Lấy thông tin phòng an toàn (Optional Chaining)
  const roomInfo = booking.room;
  const roomType = booking.room?.room_type;

  // Tính tổng tiền (nếu API chưa trả về total)
  const basePrice = roomType?.base_price || 0;
  const totalPrice = Number(basePrice) * nights;

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <div className="flex-grow flex items-center justify-center pt-24 pb-20 px-4">
        {/* --- MAIN CARD --- */}
        <div className="bg-white max-w-3xl w-full rounded-3xl shadow-xl overflow-hidden relative animate-fade-in-up">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>

          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="text-green-600 w-10 h-10 animate-bounce" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Đặt phòng thành công!
              </h1>
              <p className="text-gray-500">
                Mã đơn:{" "}
                <span className="font-bold text-blue-600">#{booking.id}</span>
                <br className="hidden md:block mt-1" />
                Email xác nhận đã gửi tới{" "}
                <span className="text-gray-900 font-medium">
                  {booking.customer?.email}
                </span>
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
              <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                    Mã đặt phòng
                  </p>
                  <p className="text-lg font-bold text-gray-800 break-all">
                    #{booking.id}
                  </p>
                </div>
                {/* Badge trạng thái */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {booking.status === "pending" ? "Chờ duyệt" : booking.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột trái: Thông tin phòng */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                      alt="Room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {roomType?.name || "Phòng nghỉ"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Phòng số: {roomInfo?.room_number}
                    </p>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <MapPin size={14} /> <span>Vietnam</span>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Chi tiết ngày giờ */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" /> Check-in
                    </span>
                    <span className="font-semibold">
                      {formatDate(booking.check_in_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" /> Check-out
                    </span>
                    <span className="font-semibold">
                      {formatDate(booking.check_out_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users size={16} className="text-blue-500" /> Khách
                    </span>
                    <span className="font-semibold">
                      {roomType?.max_guests || 2} người
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Footer */}
              <div className="mt-6 pt-5 border-t border-dashed border-gray-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                    <CreditCard size={12} /> Thanh toán
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    Tiền mặt / Chuyển khoản
                  </p>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Tổng cộng
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatMoney(totalPrice)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Đã cọc: {formatMoney(booking.deposit_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="w-full sm:w-auto">
                <button className="w-full bg-gray-100 text-gray-700 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
                  <Home size={18} /> Về trang chủ
                </button>
              </Link>
              <Link to="/my-bookings" className="w-full sm:w-auto">
                <button className="w-full bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  <FileText size={18} /> Xem lịch sử
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
