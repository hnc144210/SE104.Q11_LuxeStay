import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { createBooking, getCustomerDetail } from "./api/bookingApi"; // Import API vừa sửa
import { useAuthContext } from "../../features/context/AuthContext";
import { Info, CheckCircle, Loader2 } from "lucide-react";

// --- CẤU HÌNH HỆ THỐNG ---
const SYSTEM_SETTINGS = {
  SURCHARGE_RATE: 0.25,
  FOREIGN_COEFFICIENT: 1.5,
  DEPOSIT_PERCENT: 50,
  STANDARD_CAPACITY: 3,
};

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext(); // Dữ liệu fallback từ token (email, name)

  // State lưu thông tin chi tiết từ DB (có sđt, type)
  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  // Lấy dữ liệu từ trang Search/Room Detail
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
  const [numGuests, setNumGuests] = useState(parseInt(initialMaxGuests) || 1);

  const [priceBreakdown, setPriceBreakdown] = useState({
    nights: 0,
    roomCharge: 0,
    surcharge: 0,
    foreignSurcharge: 0,
    totalEstimate: 0,
    depositAmount: 0,
  });

  // --- 1. GỌI API LẤY THÔNG TIN KHÁCH (Khi vào trang) ---
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        setLoadingCustomer(true);
        const res = await getCustomerDetail(); // Gọi endpoint /users/me
        if (res.success && res.data) {
          setCustomer(res.data);
        }
      } catch (err) {
        console.error("Fetch customer error:", err);
      } finally {
        setLoadingCustomer(false);
      }
    };
    fetchCustomerInfo();
  }, []);

  // --- 2. TÍNH TOÁN GIÁ (Tự động chạy lại khi customer hoặc số người thay đổi) ---
  useEffect(() => {
    if (!room || !check_in_date || !check_out_date) return;

    const start = new Date(check_in_date);
    const end = new Date(check_out_date);
    const nights = Math.max(
      1,
      Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    );
    const basePrice = room.price || room.room_types?.base_price || 0;

    // A. Tiền phòng
    const roomCharge = basePrice * nights;

    // B. Phụ thu quá người
    let surcharge = 0;
    if (numGuests > SYSTEM_SETTINGS.STANDARD_CAPACITY) {
      const extraPeople = numGuests - SYSTEM_SETTINGS.STANDARD_CAPACITY;
      surcharge =
        basePrice * SYSTEM_SETTINGS.SURCHARGE_RATE * extraPeople * nights;
    }

    // C. Phụ thu khách nước ngoài
    let foreignSurcharge = 0;
    const tempTotal = roomCharge + surcharge;

    // Ưu tiên check type từ DB, nếu không có thì mặc định domestic
    const isForeigner = customer?.type === "foreign";

    if (isForeigner) {
      foreignSurcharge = tempTotal * (SYSTEM_SETTINGS.FOREIGN_COEFFICIENT - 1);
    }

    const totalEstimate = tempTotal + foreignSurcharge;
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
  }, [numGuests, customer, room, check_in_date, check_out_date]);

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
          // Ưu tiên lấy email từ customer DB, nếu không thì lấy từ AuthContext
          customer_email: customer?.email || user?.email,
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
          {/* === CỘT TRÁI === */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. THÔNG TIN KHÁCH HÀNG */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                👤 Thông tin khách hàng
              </h3>

              {loadingCustomer ? (
                <div className="flex justify-center py-4 text-blue-500 gap-2">
                  <Loader2 className="animate-spin" /> Đang tải hồ sơ...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Họ tên */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 block text-xs uppercase mb-1">
                      Họ tên
                    </span>
                    <span className="font-bold text-gray-800 text-base">
                      {customer?.full_name || user?.full_name || "---"}
                    </span>
                  </div>
                  {/* Email */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 block text-xs uppercase mb-1">
                      Email
                    </span>
                    <span className="font-medium text-gray-700">
                      {customer?.email || user?.email || "---"}
                    </span>
                  </div>
                  {/* SĐT */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 block text-xs uppercase mb-1">
                      Số điện thoại
                    </span>
                    <span className="font-medium text-gray-700">
                      {customer?.phone_number || "Chưa cập nhật"}
                    </span>
                  </div>
                  {/* Loại khách */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 block text-xs uppercase mb-1">
                      Quốc tịch / Loại khách
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs inline-block ${
                        customer?.type === "foreign"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {customer?.type === "foreign"
                        ? "Quốc tế (Foreign)"
                        : "Trong nước (Domestic)"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. CHI TIẾT CHUYẾN ĐI (Giữ nguyên code cũ) */}
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

              {/* Dropdown số khách */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Số lượng khách
                </label>
                <div className="relative">
                  <select
                    value={numGuests}
                    onChange={(e) => setNumGuests(parseInt(e.target.value))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700"
                  >
                    {[...Array(6)].map((_, i) => {
                      const val = i + 1;
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
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info size={12} />
                  <span>
                    Tiêu chuẩn {SYSTEM_SETTINGS.STANDARD_CAPACITY} người. Khách
                    thứ {SYSTEM_SETTINGS.STANDARD_CAPACITY + 1} trở đi tính thêm
                    phí.
                  </span>
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Ghi chú
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

          {/* === CỘT PHẢI: BILL (Giữ nguyên logic hiển thị giá) === */}
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

              <div className="border-t border-dashed border-gray-300 py-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Giá thuê ({priceBreakdown.nights} đêm)</span>
                  <span className="font-medium">
                    {priceBreakdown.roomCharge.toLocaleString()} đ
                  </span>
                </div>

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

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-yellow-800 uppercase">
                    Tiền cọc ({SYSTEM_SETTINGS.DEPOSIT_PERCENT}%)
                  </span>
                </div>
                <div className="text-right text-lg font-extrabold text-yellow-700">
                  {priceBreakdown.depositAmount.toLocaleString()} đ
                </div>
                <p className="text-[10px] text-yellow-600 mt-1 italic text-center">
                  *Vui lòng thanh toán cọc để giữ phòng.
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
                className="w-full mt-6 bg-[#DF6951] text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:bg-gray-300 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle size={20} />
                )}
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
