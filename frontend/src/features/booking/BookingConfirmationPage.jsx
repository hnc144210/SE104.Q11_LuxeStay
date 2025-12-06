import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { createBooking } from "./api/bookingApi";
import { useAuthContext } from "../../features/context/AuthContext"; // Import Auth Context

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext(); // Lấy thông tin user từ Context

  // Lấy dữ liệu từ trang trước truyền qua
  const bookingData = location.state || {};
  const { room, check_in_date, check_out_date, max_guests } = bookingData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numGuests, setNumGuests] = useState(1);
  const [note, setNote] = useState("");

  // Tính toán tiền
  const start = new Date(check_in_date);
  const end = new Date(check_out_date);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  // Giá phòng lấy từ room object, đảm bảo có fallback
  const pricePerNight = room?.price || room?.room_types?.base_price || 0;
  const total = nights * pricePerNight;

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Chuẩn bị payload gửi lên Backend
      const payload = {
        room_id: room.id,
        check_in_date,
        check_out_date,
        num_guests: parseInt(numGuests),
        deposit_amount: 0, // Backend có thể tự tính hoặc nhận từ đây
        note: note,
      };

      // 2. Gọi API tạo Booking
      const response = await createBooking(payload);

      if (response.success) {
        // Dữ liệu trả về từ Backend (nhờ ta đã sửa select ở bước 1)
        const createdBooking = response.data;

        // 3. Chuyển sang trang Success kèm dữ liệu đầy đủ
        // Ta gộp dữ liệu từ API và dữ liệu local để hiển thị đẹp nhất
        const successState = {
          id: createdBooking.id,
          roomName: createdBooking.room?.room_type?.name || room.name,
          roomImage: room.image, // Ảnh thường chưa có trong DB, lấy từ state cũ
          check_in_date: createdBooking.check_in_date,
          check_out_date: createdBooking.check_out_date,
          num_guests: numGuests,
          deposit_amount: createdBooking.deposit_amount,
          total_amount: total, // Truyền tổng tiền đã tính
          customer_email: user?.email, // Email khách hàng
          note: note,
        };

        navigate("/booking-success", { state: successState });
      }
    } catch (err) {
      console.error("Booking Error:", err);
      setError(err.message || "Đặt phòng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!room)
    return (
      <div className="p-8 text-center text-red-500">
        Thiếu thông tin đặt phòng. Vui lòng chọn phòng lại.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-5xl">
        <h1 className="text-3xl font-bold text-[#181E4B] mb-8">
          Xác nhận đặt phòng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: FORM THÔNG TIN */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Thông tin khách hàng (Read-only từ User Context) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                👤 Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Họ và tên
                  </label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {user?.full_name || "Chưa cập nhật tên"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {user?.email || "Chưa cập nhật email"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Số điện thoại
                  </label>
                  <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {user?.phone_number || "Chưa cập nhật SĐT"}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Thông tin chuyến đi & Yêu cầu */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                ✈️ Chi tiết chuyến đi
              </h3>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Nhận phòng
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {check_in_date}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Trả phòng
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {check_out_date}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Số lượng khách
                </label>
                <select
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {[...Array(max_guests || 3)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1} người lớn
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Ghi chú cho khách sạn (không bắt buộc)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Ví dụ: Tôi muốn phòng yên tĩnh, check-in muộn..."
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TỔNG TIỀN & XÁC NHẬN */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <div className="mb-4">
                {/* Ảnh phòng nhỏ (nếu có) */}
                {room.image && (
                  <img
                    src={room.image}
                    alt="Room"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-xl text-[#181E4B]">
                  {room.name || room.room_types?.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Phòng tiêu chuẩn cho {max_guests} người
                </p>
              </div>

              <div className="border-t border-dashed border-gray-300 py-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Đơn giá</span>
                  <span>{pricePerNight?.toLocaleString()} đ / đêm</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Thời gian ở</span>
                  <span>{nights} đêm</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-xl text-blue-600 pt-4 border-t border-gray-200">
                <span>Tổng cộng</span>
                <span>{total?.toLocaleString()} đ</span>
              </div>

              <div className="bg-green-50 text-green-700 text-xs p-3 rounded mt-4 flex items-start gap-2">
                <span>ℹ️</span>
                <span>
                  Bạn sẽ không bị trừ tiền ngay. Khách sạn sẽ liên hệ để xác
                  nhận đặt cọc sau.
                </span>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded mt-4 border border-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="w-full mt-6 bg-[#DF6951] text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận & Đặt phòng"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
