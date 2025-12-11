import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { createBooking } from "./api/bookingApi";
import { useAuthContext } from "../../features/context/AuthContext";
import { Info, CheckCircle } from "lucide-react";

// --- CẤU HÌNH HỆ THỐNG (Giả lập lấy từ DB) ---
const SYSTEM_SETTINGS = {
  SURCHARGE_RATE: 0.25, // Phụ thu 25% cho mỗi khách vượt quá
  FOREIGN_COEFFICIENT: 1.5, // Hệ số 1.5 cho khách nước ngoài
  DEPOSIT_PERCENT: 50, // Cọc 50%
  STANDARD_CAPACITY: 3, // ✅ LUẬT MỚI: Tối đa 3 người không tính phí
};

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Lấy dữ liệu từ trang trước
  const bookingData = location.state || {};
  const {
    room,
    check_in_date,
    check_out_date,
    max_guests: initialMaxGuests,
  } = bookingData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");

  // Mặc định chọn 1 người hoặc số người đã chọn từ trang search
  const [numGuests, setNumGuests] = useState(parseInt(initialMaxGuests) || 1);

  const [priceBreakdown, setPriceBreakdown] = useState({
    nights: 0,
    roomCharge: 0,
    surcharge: 0,
    foreignSurcharge: 0,
    totalEstimate: 0,
    depositAmount: 0,
  });

  // --- LOGIC TÍNH TOÁN GIÁ CHI TIẾT ---
  useEffect(() => {
    if (!room || !check_in_date || !check_out_date) return;

    const start = new Date(check_in_date);
    const end = new Date(check_out_date);
    const nights = Math.max(
      1,
      Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    );

    const basePrice = room.price || room.room_types?.base_price || 0;

    // 1. Tiền phòng cơ bản
    const roomCharge = basePrice * nights;

    // 2. Tính Phụ thu quá người
    // ✅ LUẬT MỚI: Chỉ tính tiền nếu khách > 3
    const standardCapacity = SYSTEM_SETTINGS.STANDARD_CAPACITY;
    let surcharge = 0;

    if (numGuests > standardCapacity) {
      const extraPeople = numGuests - standardCapacity;
      // Công thức: Giá * 0.25 * số người thừa * số đêm
      surcharge =
        basePrice * SYSTEM_SETTINGS.SURCHARGE_RATE * extraPeople * nights;
    }

    // 3. Tính Phụ thu khách nước ngoài
    let foreignSurcharge = 0;
    // Kiểm tra an toàn biến user
    const isForeigner = user?.type === "foreign";

    // Tổng tạm tính (đã bao gồm phụ thu người)
    const tempTotal = roomCharge + surcharge;

    if (isForeigner) {
      // Cách tính: (Tổng tạm) * (1.5 - 1) -> Tăng 50% trên tổng bill
      foreignSurcharge = tempTotal * (SYSTEM_SETTINGS.FOREIGN_COEFFICIENT - 1);
    }

    // 4. Tổng cuối cùng
    const totalEstimate = tempTotal + foreignSurcharge;

    // 5. Tiền cọc (50%)
    const depositAmount =
      totalEstimate * (SYSTEM_SETTINGS.DEPOSIT_PERCENT / 100);

    setPriceBreakdown({
      nights,
      roomCharge,
      surcharge,
      foreignSurcharge,
      totalEstimate,
      depositAmount,
    });
  }, [numGuests, user, room, check_in_date, check_out_date]);

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        room_id: room.id,
        check_in_date,
        check_out_date,
        num_guests: parseInt(numGuests),
        deposit_amount: priceBreakdown.depositAmount,
        note: note,
      };

      const response = await createBooking(payload);

      if (response.success) {
        const createdBooking = response.data;

        const successState = {
          id: createdBooking.id,
          roomName: createdBooking.room?.room_type?.name || room.name,
          roomImage: room.image,
          check_in_date: createdBooking.check_in_date,
          check_out_date: createdBooking.check_out_date,
          num_guests: numGuests,
          deposit_amount: createdBooking.deposit_amount,
          total_amount: priceBreakdown.totalEstimate,
          customer_email: user?.email,
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
      <div className="p-8 text-center text-red-500">Thiếu thông tin phòng.</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-5xl">
        <h1 className="text-3xl font-bold text-[#181E4B] mb-8">
          Xác nhận đặt phòng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* === CỘT TRÁI: THÔNG TIN & FORM === */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Khách */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                👤 Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block text-xs uppercase">
                    Họ tên
                  </span>
                  <span className="font-medium">
                    {user?.full_name || "---"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block text-xs uppercase">
                    Email
                  </span>
                  <span className="font-medium">{user?.email || "---"}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block text-xs uppercase">
                    SĐT
                  </span>
                  <span className="font-medium">
                    {user?.phone_number || "---"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 block text-xs uppercase">
                    Loại khách
                  </span>
                  <span className="font-medium capitalize">
                    {user?.type === "foreign"
                      ? "Quốc tế (Foreign)"
                      : "Trong nước (Domestic)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Chi tiết chuyến đi */}
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

              {/* CHỌN SỐ KHÁCH */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Số lượng khách
                </label>
                <div className="relative">
                  <select
                    value={numGuests}
                    onChange={(e) => setNumGuests(parseInt(e.target.value))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white font-medium text-gray-700"
                  >
                    {/* Tạo options tối đa 6 người để test */}
                    {[...Array(6)].map((_, i) => {
                      const val = i + 1;
                      // Nếu lớn hơn 3 người -> Hiện cảnh báo có phụ thu
                      const isExtra = val > SYSTEM_SETTINGS.STANDARD_CAPACITY;
                      return (
                        <option key={val} value={val}>
                          {val} người{" "}
                          {isExtra
                            ? `(Phụ thu +${
                                SYSTEM_SETTINGS.SURCHARGE_RATE * 100
                              }%)`
                            : ""}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▼
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info size={12} />
                  <span>
                    Phòng tiêu chuẩn{" "}
                    <strong>{SYSTEM_SETTINGS.STANDARD_CAPACITY} người</strong>.
                    Khách thứ {SYSTEM_SETTINGS.STANDARD_CAPACITY + 1} trở đi sẽ
                    tính thêm phụ phí.
                  </span>
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Ghi chú (Tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Yêu cầu đặc biệt..."
                />
              </div>
            </div>
          </div>

          {/* === CỘT PHẢI: BILL & CONFIRM === */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <div className="mb-4">
                {room.image && (
                  <img
                    src={room.image}
                    alt="Room"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-xl text-[#181E4B] line-clamp-1">
                  {room.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {priceBreakdown.nights} đêm • {numGuests} người
                </p>
              </div>

              {/* --- BẢNG CHI TIẾT GIÁ --- */}
              <div className="border-t border-dashed border-gray-300 py-4 space-y-3 text-sm">
                {/* 1. Giá phòng */}
                <div className="flex justify-between text-gray-600">
                  <span>Giá thuê ({priceBreakdown.nights} đêm)</span>
                  <span className="font-medium">
                    {priceBreakdown.roomCharge.toLocaleString()} đ
                  </span>
                </div>

                {/* 2. Phụ thu quá người */}
                {priceBreakdown.surcharge > 0 && (
                  <div className="flex justify-between text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <span className="flex items-center gap-1">
                      <Info size={12} /> Phụ thu quá người
                    </span>
                    <span className="font-bold">
                      +{priceBreakdown.surcharge.toLocaleString()} đ
                    </span>
                  </div>
                )}

                {/* 3. Phụ thu nước ngoài */}
                {priceBreakdown.foreignSurcharge > 0 && (
                  <div className="flex justify-between text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    <span className="flex items-center gap-1">
                      <Info size={12} /> Phụ thu khách QT
                    </span>
                    <span className="font-bold">
                      +{priceBreakdown.foreignSurcharge.toLocaleString()} đ
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end font-bold text-xl text-blue-800 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500 font-normal pb-1">
                  Chi phí ước tính
                </span>
                <span>{priceBreakdown.totalEstimate.toLocaleString()} đ</span>
              </div>

              {/* Thông tin tiền cọc */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-yellow-800 uppercase">
                    Tiền cọc cần thanh toán ({SYSTEM_SETTINGS.DEPOSIT_PERCENT}%)
                  </span>
                </div>
                <div className="text-right text-lg font-extrabold text-yellow-700">
                  {priceBreakdown.depositAmount.toLocaleString()} đ
                </div>
                <p className="text-[10px] text-yellow-600 mt-1 italic text-center">
                  *Vui lòng thanh toán khoản cọc này để giữ phòng.
                </p>
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
                  <>
                    <CheckCircle size={20} /> Xác nhận đặt phòng
                  </>
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
