import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { createBooking } from "./api/bookingApi"; // Đảm bảo import đúng

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state || {};
  const { room, check_in_date, check_out_date, max_guests } = bookingData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numGuests, setNumGuests] = useState(1);
  const [note, setNote] = useState("");

  // ... (Giữ nguyên các logic tính toán nights, total ...)
  const start = new Date(check_in_date);
  const end = new Date(check_out_date);
  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const total = nights * room?.price;

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Chuẩn bị payload
      const payload = {
        room_id: room.id,
        check_in_date,
        check_out_date,
        num_guests: parseInt(numGuests),
        deposit_amount: 0, // Hoặc tính 30% total
        note: note,
      };

      // 2. Gọi API tạo Booking (Backend sẽ tự update status phòng)
      const response = await createBooking(payload);

      if (response.success) {
        // 3. Thành công -> Chuyển sang trang Success
        navigate("/booking-success", {
          state: {
            booking: response.data,
            roomInfo: room,
            message: "Đặt phòng thành công! Phòng đã được khóa cho bạn.",
          },
        });
      }
    } catch (err) {
      console.error("Booking Error:", err);
      setError(err.message || "Đặt phòng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!room) return <div>Không có thông tin đặt phòng</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Xác nhận đặt phòng</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái: Form nhập thông tin thêm */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-bold mb-4">Thông tin chuyến đi</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Nhận phòng</p>
                  <p className="font-medium">{check_in_date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Trả phòng</p>
                  <p className="font-medium">{check_out_date}</p>
                </div>
              </div>

              <label className="block mb-2 text-sm font-medium">
                Số khách:
              </label>
              <select
                value={numGuests}
                onChange={(e) => setNumGuests(e.target.value)}
                className="w-full border p-2 rounded mb-4"
              >
                {[...Array(max_guests)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} khách
                  </option>
                ))}
              </select>

              <label className="block mb-2 text-sm font-medium">
                Ghi chú đặc biệt:
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border p-2 rounded h-24"
                placeholder="Yêu cầu thêm..."
              />
            </div>
          </div>

          {/* Cột phải: Tổng tiền & Nút xác nhận */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded shadow sticky top-24">
              <h3 className="font-bold text-lg mb-2">{room.name}</h3>
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>
                    {room.price?.toLocaleString()} x {nights} đêm
                  </span>
                  <span>{total?.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-blue-600 pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span>{total?.toLocaleString()} đ</span>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-4">{error}</div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? "Đang xử lý..." : "Xác nhận đặt phòng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
